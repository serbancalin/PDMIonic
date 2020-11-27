import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { ProductProps } from './ProductProps';

const productUrl = `http://${baseUrl}/api/products`;

export const getProducts: (token: string) => Promise<ProductProps[]> = token => {
    return withLogs(axios.get(productUrl, authConfig(token)), 'getProduct');
}

export const createProduct: (token: string, product: ProductProps) => Promise<ProductProps[]> = (token,product) => {
    return withLogs(axios.post(productUrl, product, authConfig(token)), 'createProduct');
}

export const updateProduct: (token: string, product: ProductProps) => Promise<ProductProps[]> = (token,product) => {
    return withLogs(axios.put(`${productUrl}/${product._id}`, product, authConfig(token)), 'updateProduct');
}

interface MessageData {
    type: string;
    payload: ProductProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
