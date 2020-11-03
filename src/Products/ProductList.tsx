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
import React, {useContext} from 'react';
import Product from './Product';
import {getLogger} from "../core";
import {add} from "ionicons/icons";
import {RouteComponentProps} from "react-router";
import {ProductContext} from "./ProductProvider";

const log = getLogger('ProductList');

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
    const { products, fetching, fetchingError } = useContext(ProductContext);
    log("ProductList render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your products</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching products" />
                {products && (
                    <IonList>
                        {products.map(({ id, name, price}) =>
                            <Product key={id} id={id} name={name} price={price} onEdit = {id => history.push(`/product/${id}`)}/>)}
                        {log("ProductList render done")}
                    </IonList>
                )}
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
