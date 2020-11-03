import React from 'react';
import {ProductProps} from "./ProductProps";

const Product: React.FC<ProductProps> = ({ id, name, price }) => {
    return (
        <div>
            <div>{name} {price}</div>
        </div>
    );
};

export default Product;
