import {useEffect, useState} from "react";
import {getLogger} from "../core";
import {ProductProps} from "./ProductProps";
import {getProducts} from "./ProductApi";

const log = getLogger("useProducts")

export interface ItemsState {
    products?: ProductProps[],
    fetching: boolean,
    fetchingError?: Error,
}

export interface ProductsProps extends ItemsState {
    addProduct: () => void,
}

export const useProducts: () => ProductsProps = () => {
    const [state, setState] = useState<ItemsState>({
        products: undefined,
        fetching: false,
        fetchingError: undefined,
    });
    const { products, fetching, fetchingError } = state;
    const addProduct = () => {
        log('addProduct - TODO');
    };
    useEffect(getItemsEffect, []);
    log('returns');
    return {
        products: products,
        fetching,
        fetchingError,
        addProduct: addProduct,
    };

    function getItemsEffect() {
        let canceled = false;
        fetchProducts();
        return () => {
            canceled = true;
        }

        async function fetchProducts() {
            try {
                log('fetchProducts started');
                setState({ ...state, fetching: true });
                const products = await getProducts();
                log('fetchProducts succeeded');
                if (!canceled) {
                    setState({ ...state, products: products, fetching: false });
                }
            } catch (error) {
                log('fetchProducts failed');
                setState({ ...state, fetchingError: error, fetching: false });
            }
        }
    }
};