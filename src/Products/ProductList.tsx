import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React, {useState} from 'react';
import Product from './Product';
import {getLogger} from "../core";
import {add} from "ionicons/icons";
import {useProducts} from "./useProducts";

const log = getLogger('ProductList');

const ProductList: React.FC = () => {
    const { products, fetching, fetchingError, addProduct } = useProducts();
    log("ProductList render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching products" />
                {products && (
                    <IonList>
                        {products.map(({ id, name, price}) => <Product key={id} name={name} price={price}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch products'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={addProduct}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ProductList;
