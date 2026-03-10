import type { Dispatch, SetStateAction } from 'react';

export type UserRole = 'admin' | 'employee';
export type MovementType = 'IN' | 'OUT';

export interface Product {
    id: number;
    name: string;
    sku: string;
    binLocation: string;
    documentNo: string;
    unit: string;
    lotNo: string;
    manufacturingDate: string;
    expiryDate: string;
    stock: number;
}

export interface MovementLog {
    id: number;
    type: MovementType;
    productId: number;
    quantity: number;
    location: string;
    person: string;
    timestamp: string;
}

export interface User {
    id: number;
    username: string;
    password: string;
    role: UserRole;
    name: string;
}

export interface AppOutletContext {
    products: Product[];
    setProducts: Dispatch<SetStateAction<Product[]>>;
    history: MovementLog[];
    setHistory: Dispatch<SetStateAction<MovementLog[]>>;
    user: User | null;
}

export interface LayoutProps {
    products: Product[];
    setProducts: Dispatch<SetStateAction<Product[]>>;
    history: MovementLog[];
    setHistory: Dispatch<SetStateAction<MovementLog[]>>;
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
}
