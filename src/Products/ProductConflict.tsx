import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {ProductContext} from "./ProductProvider";
import {ProductProps} from "./ProductProps";

const ProductConflict: React.FC<RouteComponentProps> = ({history}) => {
    const {conflictProducts, saving, savingError, saveProduct} = useContext(ProductContext)
    const [firstProduct, setFirstProduct] = useState<ProductProps>();
    const [secondProduct, setSecondProduct] = useState<ProductProps>();
    console.log("!!! Conflict: " + conflictProducts)
    useEffect(setProductVs, []);

    function setProductVs(){
        if(!conflictProducts || conflictProducts?.length === 0){
            history.goBack();
            return;
        }
        setFirstProduct(conflictProducts[0]);
        setSecondProduct(conflictProducts[1]);
    }

    const handleSave = (product: ProductProps) => {
        saveProduct && saveProduct(product).then(()=>{
            conflictProducts?.shift();
            conflictProducts?.shift();
            setProductVs();
        });
    }

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Version conflicts</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {firstProduct && (<ProductConflictView product={firstProduct} onAction={handleSave}/>)}
                <IonHeader>VS</IonHeader>
                {secondProduct && (<ProductConflictView product={secondProduct} onAction={handleSave}/>)}
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
}

export default ProductConflict;

export const ProductConflictView: React.FC<{product: ProductProps, onAction: (product: ProductProps) => void}> =
    ({product, onAction}) => {
    return(
        <IonCard>
            <IonCardHeader>
                <IonCardSubtitle>Last modified: {product.date}</IonCardSubtitle>
                <IonCardTitle>{product.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <div>{product.price}</div>
                <IonButton onClick={() => onAction(product)}>Accept this version</IonButton>
            </IonCardContent>
        </IonCard>
    );
    }