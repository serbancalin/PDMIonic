export interface ProductProps {
    _id?: string;
    name: string;
    price: number;
    date: Date,
    size?: number,
    version: number;
    lastModified: Date;
}
