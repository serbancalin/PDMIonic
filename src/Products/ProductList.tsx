import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLoading,
    IonList,
    IonSearchbar,
    IonToggle,
    IonLabel,
    IonItem,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent
} from '@ionic/react';
import {add} from 'ionicons/icons';
import React, {useContext, useEffect} from 'react';
import Product from './Product';
import { getLogger } from '../core';
import {Redirect, RouteComponentProps} from "react-router";
import {ProductContext} from "./ProductProvider";
import {AuthContext} from "../auth";

const log = getLogger('ProductList');

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
    const { products, fetching, fetchingError, page, setPage, scrollDisabled, searchProduct, setSearchProduct, networkStatus, conflictProducts } = useContext(ProductContext);

    const {token, logout} = useContext(AuthContext);

    const noop = () => {
    }
    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };
    log("render")
    log(`PAGE: ${page}`)
    async function getNewProducts($event: CustomEvent<void>){
        log('page: ', page)
        setPage ? setPage(page + 1) : noop();
        ($event.target as HTMLIonInfiniteScrollElement).complete().then();
    }

    useEffect(conflictNotesEffect, [conflictProducts]);
    function conflictNotesEffect() {
        if(conflictProducts && conflictProducts.length > 0) {
            console.log('conflictProduct', conflictProducts);
            history.push('/products/conflict');
        }
    }
    log(`SCROLL DISABLED: ${scrollDisabled}`);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your products - {networkStatus ? "online" : "offline"}</IonTitle>
                    <IonButton slot="end" onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSearchbar
                    value={searchProduct}
                    debounce={1000}
                    onIonChange={e => setSearchProduct && setPage ? setSearchProduct(e.detail.value!) && setPage(0) : noop()}>
                </IonSearchbar>
                <IonLoading isOpen={fetching} message="Fetching products" />
                {products && (
                    <IonList>
                        {products
                            .map(product =>
                                <Product key={product._id} product={product} onEdit={id => history.push(`/product/${id}`)}/>)}
                        {log("ProductList render done")}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={scrollDisabled}
                                   onIonInfinite={(e: CustomEvent<void>) => getNewProducts(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch products'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/product')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ProductList;
