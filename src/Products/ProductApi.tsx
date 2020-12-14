import axios from 'axios';
import {AppConstants, authConfig, baseUrl, getLogger} from '../core';
import { ProductProps } from './ProductProps';
import {LocalStorage} from "../core/Storage";

const productUrl = `http://${baseUrl}/api/products`;

const {v4: uuidv4} = require('uuid');

export const syncData: (token: string) => Promise<ProductProps[]> = async (token: string) => {
    const products = await getProductsLocal('D');
    return axios.post<ProductProps[]>(`${productUrl}/sync`, products, authConfig(token))
        .then(
            response => response.data,
            () => {
                console.log('cannot sync data with server');
                return [];
            });
};
export const createProduct: (token: string, product: ProductProps, isNetworkAvailable: boolean) => Promise<ProductProps> = (token, product, isNetworkAvailable) => {
    if(isNetworkAvailable){
        console.log("API create sunt online")
        return axios.post(productUrl, product, authConfig(token)).then(
            response => {
                saveProductLocal(response.data).then();
                return response.data;
            },
            () => saveProductLocal(product)
        );
    }
    return saveProductLocal(product);
}
export const updateProduct: (token: string, product: ProductProps, isNetworkAvailable: boolean) => Promise<ProductProps> = (token, product, isNetworkAvailable) => {
    console.log(`API UPDATE NETWORK ${isNetworkAvailable}`)
    if(isNetworkAvailable){
        console.log("API update sunt online")
        axios.put(`${productUrl}/${product._id}`, product, authConfig(token)).then(
            response => {
                saveProductLocal(response.data).then();
                return response.data;
            },
            () => saveProductLocal(product)
        );
    }
    return saveProductLocal(product);
}
function setIfModifiedSinceHeader(products: ProductProps[], config: any): void {
    if (products.length === 0) return;
    let ifModifiedSince = new Date(products[0].lastModified);
    products.forEach(product => {
        const productModified = new Date(product.lastModified);
        if (productModified > ifModifiedSince) {
            ifModifiedSince = productModified;
        }
    });
    const sec = ifModifiedSince.getSeconds();
    ifModifiedSince.setSeconds(sec + 1);
    config.headers['if-modified-since'] = ifModifiedSince.toUTCString();
}
export const getPagedProducts: (token: string,
                             page: number,
                             isNetworkAvailable: boolean,
                             search?: string,) => Promise<ProductProps[]> =
    async (token: string, page: number, isNetworkAvailable: boolean, search?: string) => {
        if(isNetworkAvailable) {
            console.log(`API Network available`)
            let url = `${productUrl}?page=${page}`;
            if (search && search !== '') {
                url += '&search=' + search;
            }
            const localProducts = await getProductsLocal()
                .then(products => paginateAndMatch(products, page, search));
            console.log(`API ${localProducts}`);
            setIfModifiedSinceHeader(localProducts, authConfig(token));
            return axios.get<ProductProps[]>(url, authConfig(token)).then(
                response=>{
                    const products = response.data;
                    console.log(`API RESPONSE ${products}`)
                    products.forEach(product=>{
                        const index = localProducts.findIndex(it => it._id === product._id);
                        if(index === -1){
                            localProducts.push(product)
                        }
                        else{
                            localProducts[index] = product;
                        }
                        LocalStorage.set(`${AppConstants.PRODUCTS}/${product._id}`, product).then();
                    })
                    console.log(`API fac chestii`)
                    return localProducts;
                }
            ).catch(err => {
                if (err.response.status === 304) {
                    console.log('304');
                    return localProducts;
                }
                return getProductsLocal()
                    .then(products => paginateAndMatch(products, page, search));
            })
        }
        return getProductsLocal().then(products => paginateAndMatch(products, page, search));
    };

const PAGE_SIZE = 5;

function paginateAndMatch(products: ProductProps[], page: number, search?: string): ProductProps[] {
    if (search) {
        products = products.filter(products => products.name.indexOf(search) >= 0 || products.price.toString().indexOf(search) >= 0);
    }
    products.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    const resp: ProductProps[] = [];
    let i = 0;
    products.forEach(guitar => {
        if (i >= PAGE_SIZE * page && i < PAGE_SIZE * (page + 1)) {
            resp.push(guitar);
        }
        i++;
    });
    return resp;
}
async function getProductsLocal(customPrefix?: string): Promise<ProductProps[]> {
    const keys: string[] = await LocalStorage.keys();
    const products = [];
    for (const i in keys) {
        const key = keys[i];
        if (key.startsWith(AppConstants.PRODUCTS)
            || (customPrefix && key.startsWith(`${customPrefix}/${AppConstants.PRODUCTS}`))) {
            const product: ProductProps = await LocalStorage.get(key);
            products.push(product);
        }
    }
    return products;
}
function saveProductLocal(product: ProductProps): Promise<ProductProps> {
    console.log("API salvam local")
    if (!product?._id) {
        product._id = uuidv4();
        product.version = 0;
    }
    LocalStorage.set(`${AppConstants.PRODUCTS}/${product._id}`, product).then();
    return Promise.resolve(product);
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
