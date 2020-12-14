import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {ProductContext} from "./ProductProvider";
import {ProductProps} from "./ProductProps";
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle, IonToast,
    IonToolbar
} from "@ionic/react";

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const ProductEdit: React.FC<ProductEditProps> = ({ history, match }) => {
    const { products, saving, savingError, saveProduct, networkStatus } = useContext(ProductContext);
    const [name, setName] = useState('New product');
    const [price, setPrice] = useState(0.0);
    const [product, setProduct] = useState<ProductProps>()
    const [date, setDate] = useState(new Date());
    const [showSaveToast, setShowSaveToast] = useState(false);
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
            setDate(product.date);
        }
    }, [match.params.id, products]);
    const handleSave = () => {
        const editedProduct = product ? { ...product, name, price, date: new Date() } : { name, price, date: new Date(), version: 0, lastModified: new Date() };
        saveProduct && saveProduct(editedProduct).then(() => {
            setShowSaveToast(true)
        });
    }
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton/>
                    </IonButtons>
                    <IonTitle>Edit - {networkStatus ? "online" : "offline"}</IonTitle>
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
                <IonToast
                position="bottom"
                isOpen={showSaveToast}
                onDidDismiss={() => setShowSaveToast(false)}
                message={`${networkStatus ? "Product was saved on the server." : "~ LOCAL CHANGE SAVED ~"}`}
                duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default ProductEdit;
