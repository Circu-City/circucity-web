'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    weight?: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: { id: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'SET_CART'; payload: CartItem[] };

const initialState: CartState = {
    items: [],
    isOpen: false,
};

const CartContext = createContext<{
    state: CartState;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity;
                return { ...state, items: newItems };
            }
            return { ...state, items: [...state.items, action.payload] };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id),
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen };
        case 'SET_CART':
            return { ...state, items: action.payload };
        default:
            return state;
    }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Persist to localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                dispatch({ type: 'SET_CART', payload: parsed });
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsInitialized(true);

    const onCartAdd = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.id) addItem(detail);
    };
    window.addEventListener("circucity:cart-add", onCartAdd);
    return () => window.removeEventListener("circucity:cart-add", onCartAdd);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem('cart', JSON.stringify(state.items));
    }, [state.items, isInitialized]);

    const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
    const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    const updateQuantity = (id: string, quantity: number) =>
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });

    return (
        <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
