import React from 'react';
import {IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle} from '@ionic/react'
import {ProductProps} from "./ProductProps";

const Product: React.FC<{product: ProductProps, onEdit: (_id?: string) => void}> = ({product, onEdit}) => {
    return (
        <IonCard button={true} onClick={() => onEdit(product._id)}>
            <IonCardHeader>
                <IonCardSubtitle>Last modified: {new Date(product.date).toDateString()}</IonCardSubtitle>
                <IonCardTitle>{product.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                {product.price}
            </IonCardContent>
        </IonCard>
    )
};

export default Product;
