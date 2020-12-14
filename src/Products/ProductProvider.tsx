import {getLogger} from "../core";
import {ProductProps} from "./ProductProps";
import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import PropTypes from 'prop-types';
import {createProduct, getPagedProducts, syncData, newWebSocket, updateProduct} from "./ProductApi";
import {AuthContext} from "../auth";
import {NetworkStatus, Plugins} from "@capacitor/core";
const { Network } = Plugins;

const log = getLogger('ProductProvider');

type SaveProductFn = (product: ProductProps) => Promise<any>;

export interface ProductState {
    products?: ProductProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveProduct?: SaveProductFn,
    page: number
    setPage?: Function,
    scrollDisabled: boolean,
    searchProduct: string,
    setSearchProduct?: Function
    networkStatus: boolean,
    conflictProducts?: ProductProps[];
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ProductState = {
    fetching: false,
    saving: false,
    page: 0,
    scrollDisabled: false,
    searchProduct: '',
    networkStatus: false,
};

const FETCH_PRODUCTS_STARTED = 'FETCH_PRODUCTS_STARTED';
const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';
const SAVE_PRODUCT_STARTED = 'SAVE_PRODUCT_STARTED';
const SAVE_PRODUCT_SUCCEEDED = 'SAVE_PRODUCT_SUCCEEDED';
const SAVE_PRODUCT_FAILED = 'SAVE_PRODUCT_FAILED';
const RESET_PRODUCT = 'RESET_PRODUCT'

const reducer: (state: ProductState, action: ActionProps) => ProductState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_PRODUCTS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_PRODUCTS_SUCCEEDED:
                let tmp = state.products || []
                payload.products
                    .forEach((item: ProductProps) => {
                        const index = tmp.findIndex((it: ProductProps) => it._id === item._id);
                        if (index === -1) {
                            tmp.push(item);
                        } else {
                            tmp[index] = item;
                        }
                    });
                console.log(`PAYLOAD ${payload.products}`)
                return { ...state, products: tmp, fetching: false };
            case FETCH_PRODUCTS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_PRODUCT_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_PRODUCT_SUCCEEDED:
                const products = [...(state.products || [])];
                console.log(`PAYLOAD - products ${payload.products}`)
                const product = payload.product;
                console.log(`PAYLOAD - product ${payload.product}`)
                const index = products.findIndex(it => it._id === product._id);
                if (index === -1) {
                    products.splice(0, 0, product);
                } else {
                    products[index] = product;
                }
                return {...state, products: products, saving: false};
            case SAVE_PRODUCT_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case RESET_PRODUCT:
                return {...state, products: []}
            default:
                return state;
        }
    };

export const ProductContext = React.createContext<ProductState>(initialState);

interface ProductProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ProductProvider: React.FC<ProductProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {products, fetching, fetchingError, saving, savingError} = state;
    const [page, setPage] = useState<number>(0);
    const [scrollDisabled, setScrollDisabled] = useState<boolean>(false)

    const [networkStatus, setNetworkStatus] = useState(false)
    const [searchProduct, setSearchProduct] = useState<string>('');

    const [conflictProducts, setConflictProducts] = useState<ProductProps[]>([]);
    useEffect(networkEffect, [token])
    useEffect(getProductEffect, [token, page, searchProduct, networkStatus])
    useEffect(resetProducts, [token, searchProduct])
    useEffect(wsEffect, [token, networkStatus])

    const saveProduct = useCallback<SaveProductFn>(saveProductCallback, [token, page, networkStatus]);
    const value = { products,
        fetching,
        fetchingError,
        page,
        searchProduct,
        setSearchProduct,
        setPage,
        scrollDisabled,
        saving,
        savingError,
        saveProduct,
        networkStatus,
        conflictProducts};
    log('returns');
    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );

    function networkEffect() {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }
        async function handleNetworkStatusChange(status: NetworkStatus) {
            console.log('useNetwork - status change', status);
            if (!canceled) {
                if(status.connected === true ){
                    const conflicts = await syncData(token);
                    setConflictProducts(conflicts);
                    setNetworkStatus(true);
                }
                else {
                    setNetworkStatus(false);
                }
            }
        }

    }

    function getProductEffect() {
        let canceled = false;
        fetchProducts().then();
        return () => {
            canceled = true;
        }

        async function fetchProducts() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchProducts started');
                dispatch({type: FETCH_PRODUCTS_STARTED});
                const products = await getPagedProducts(token, page, networkStatus, searchProduct);
                log('fetchProducts succeeded');
                setScrollDisabled(false)
                if (!canceled) {
                    dispatch({type: FETCH_PRODUCTS_SUCCEEDED, payload: {products}});
                }
            } catch (error) {
                log('fetchProducts failed');
                setScrollDisabled(true)
                dispatch({type: FETCH_PRODUCTS_FAILED, payload: {error}});
            }
        }
    }

    function resetProducts(){
        setPage(0)
        dispatch({type: RESET_PRODUCT})
    }

    async function saveProductCallback(product: ProductProps) {
        try {
            log('saveProduct started');
            log(`saveNote network status sent is ${networkStatus}`)
            dispatch({type: SAVE_PRODUCT_STARTED});
            const savedProduct = await (product._id ? updateProduct(token, product, networkStatus) : createProduct(token, product, networkStatus));
            log('saveProduct succeeded');
            dispatch({type: SAVE_PRODUCT_SUCCEEDED, payload: {product: savedProduct}});
        } catch (error) {
            log('savePorduct failed');
            dispatch({type: SAVE_PRODUCT_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        if (!networkStatus || token === '') {
            return;
        }
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: product} = message;
                log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_PRODUCT_SUCCEEDED, payload: {product: product}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }

};
