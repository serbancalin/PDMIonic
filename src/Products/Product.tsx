import React from 'react';
import {ProductProps} from "./ProductProps";
import {IonItem, IonLabel} from "@ionic/react";

interface ProductPropsExt extends ProductProps {
    onEdit: (id?: string) => void;
}

const Product: React.FC<ProductPropsExt> = ({ _id, name, price , onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{price}</IonLabel>
        </IonItem>
    );
};

export default Product;
