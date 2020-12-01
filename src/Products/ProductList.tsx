import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonList,
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
    const { products, fetching, fetchingError } = useContext(ProductContext);
    const [searchProduct, setSearchProduct] = useState<string>('');
    const {token, logout} = useContext(AuthContext);

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };
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
                    onIonChange={e => setSearchProduct(e.detail.value!)}>
                </IonSearchbar>
                <IonLoading isOpen={fetching} message="Fetching products" />
                {products && (
                    <IonList>
                        {products
                            .filter(product => product.name.indexOf(searchProduct) >= 0 || product.price.toString().indexOf(searchProduct) >= 0)
                            .map(({ _id, name, price}) =>
                            <Product key={_id} _id={_id} name={name} price={price} onEdit = {id => history.push(`/product/${id}`)}/>)}
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
