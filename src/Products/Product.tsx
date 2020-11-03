import React from 'react';
import {ProductProps} from "./ProductProps";
import {IonItem, IonLabel} from "@ionic/react";

interface ProductPropsExt extends ProductProps {
    onEdit: (id?: string) => void;
}

const Product: React.FC<ProductPropsExt> = ({ id, name, price , onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{price}</IonLabel>
        </IonItem>
    );
};

export default Product;
