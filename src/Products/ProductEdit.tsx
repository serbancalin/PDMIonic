import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {useContext, useEffect, useState} from "react";
import {ProductContext} from "./ProductProvider";
import {ProductProps} from "./ProductProps";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React from "react";

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const ProductEdit: React.FC<ProductEditProps> = ({ history, match }) => {
    const { products, saving, savingError, saveProduct } = useContext(ProductContext);
    const [name, setName] = useState('New product');
    const [price, setPrice] = useState(0);
    const [product, setProduct] = useState<ProductProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        log(`${routeId} - match-ul`);
        const product = products?.find(product => String(product._id) === String(routeId));
        log(`${product} - match-ul`);
        setProduct(product);
        if (product) {
            setName(product.name);
            setPrice(product.price);
        }
    }, [match.params.id, products]);
    const handleSave = () => {
        const editedProduct = product ? { ...product, name, price } : { name, price };
        saveProduct && saveProduct(editedProduct).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonInput value={price} onIonChange={e => setPrice(parseFloat(e.detail.value || ''))} />
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save product'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ProductEdit;
