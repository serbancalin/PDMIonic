import {getLogger} from "../core";
import {ProductProps} from "./ProductProps";
import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import PropTypes from 'prop-types';
import {createProduct, getPagedProducts, getProducts, newWebSocket, updateProduct} from "./ProductApi";
import {AuthContext} from "../auth";

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
    searchProduct: ''
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
                return {...state, products: [...tmp, ...payload.products], fetching: false};
            case FETCH_PRODUCTS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_PRODUCT_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_PRODUCT_SUCCEEDED:
                const products = [...(state.products || [])];
                const product = payload.product;
                const index = products.findIndex(it => it._id === product._id);
                if (index === -1) {
                    products.splice(0, 0, product);
                } else {
                    products[index] = product;
                }
                return {...state, items: products, saving: false};
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

    const [searchProduct, setSearchProduct] = useState<string>('');

    useEffect(getProductEffect, [token, page, searchProduct]);
    useEffect(resetProducts, [token, searchProduct])
    useEffect(wsEffect, [token]);

    const saveProduct = useCallback<SaveProductFn>(saveProductCallback, [token]);
    const value = {products, fetching, fetchingError, saving, savingError, saveProduct, page, searchProduct, setSearchProduct, setPage, scrollDisabled};
    log('returns');
    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );

    function getProductEffect() {
        let canceled = false;
        fetchProducts();
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
                const products = await getPagedProducts(token, page, searchProduct);
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
            dispatch({type: SAVE_PRODUCT_STARTED});
            const savedProduct = await (product._id ? updateProduct(token, product) : createProduct(token, product));
            log('saveProduct succeeded');
            dispatch({type: SAVE_PRODUCT_SUCCEEDED, payload: {product: savedProduct}});
        } catch (error) {
            log('savePorduct failed');
            dispatch({type: SAVE_PRODUCT_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
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
                    dispatch({type: SAVE_PRODUCT_SUCCEEDED, payload: {product}});
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
