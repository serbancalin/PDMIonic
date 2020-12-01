import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList,
    IonLoading,
    IonPage, IonSearchbar,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React, {useContext, useState} from 'react';
import Product from './Product';
import {getLogger} from "../core";
import {add} from "ionicons/icons";
import {Redirect, RouteComponentProps} from "react-router";
import {ProductContext} from "./ProductProvider";
import {AuthContext} from "../auth";

const log = getLogger('ProductList');

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
    const { products, fetching, fetchingError, page, setPage, scrollDisabled, searchProduct, setSearchProduct } = useContext(ProductContext);

    const {token, logout} = useContext(AuthContext);

    const noop = () => {
    }
    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };
    async function getNewProducts($event: CustomEvent<void>){
        log('page: ', page)
        setPage ? setPage(page + 1) : noop();
        ($event.target as HTMLIonInfiniteScrollElement).complete().then();
    }

    log("ProductList render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your products</IonTitle>
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
                            .map(({ _id, name, price}) =>
                            <Product key={_id} _id={_id} name={name} price={price} onEdit = {id => history.push(`/product/${id}`)}/>)}
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
