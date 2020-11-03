import axios from 'axios';
import { getLogger } from '../core';
import { ProductProps } from './ProductProps';

const log = getLogger('ProductApi');

const baseUrl = 'http://localhost:8080';

export const getProducts: () => Promise<ProductProps[]> = () => {
    log('getProducts - started');
    return axios
        .get(`${baseUrl}/products`)
        .then(res => {
            log('getProducts - succeeded');
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log('getProducts - failed');
            return Promise.reject(err);
        });
}
