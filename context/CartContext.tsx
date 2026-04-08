"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Product } from "@/lib/data";

export interface CartItem extends Product {
  quantity: number;
  isHalfAndHalf?: boolean;
  flavors?: Product[];
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, price?: number) => void;
  addHalfAndHalfToCart: (flavor1: Product, flavor2: Product, size: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  toast: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem("pizzaria-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pizzaria-cart", JSON.stringify(cart));
  }, [cart]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addToCart = useCallback((product: Product, size?: string, price?: number) => {
    if (!product || !product.id || !product.name || (price !== undefined ? price <= 0 : product.price <= 0)) {
      console.error("Tentativa de adicionar produto inválido ao carrinho");
      return;
    }

    const finalPrice = price !== undefined ? price : product.price;
    const finalName = size ? `${product.name} - ${size}` : product.name;
    const cartId = size ? `${product.id}-${size}` : product.id;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartId && !item.isHalfAndHalf);
      if (existing) {
        return prev.map((item) =>
          item.id === cartId && !item.isHalfAndHalf
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, id: cartId, name: finalName, price: finalPrice, size, quantity: 1 }];
    });
    showToast("Item adicionado ao pedido");
  }, [showToast]);

  const addHalfAndHalfToCart = useCallback((flavor1: Product, flavor2: Product, size: string, price: number) => {
    if (!flavor1 || !flavor2 || flavor1.id === flavor2.id || !size || price <= 0) {
      console.error("Parâmetros inválidos para meio a meio");
      return;
    }

    const sortedFlavors = [flavor1, flavor2].sort((a, b) => a.id.localeCompare(b.id));
    const id = `hh-${sortedFlavors[0].id}-${sortedFlavors[1].id}-${size}`;
    const name = `Meio a Meio: ${flavor1.name} / ${flavor2.name} - ${size}`;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      const newItem: CartItem = {
        id,
        name,
        price,
        size,
        category: flavor1.category, // Assuming same category type
        description: `Metade ${flavor1.name} e metade ${flavor2.name}`,
        imageUrl: flavor1.imageUrl, // Using first flavor image as representative
        active: true,
        tags: Array.from(new Set([...flavor1.tags, ...flavor2.tags])),
        quantity: 1,
        isHalfAndHalf: true,
        flavors: sortedFlavors,
      };
      
      return [...prev, newItem];
    });
    showToast("Item adicionado ao pedido");
  }, [showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            // Ensure quantity doesn't go below 0
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  ), [cart]);

  const contextValue = useMemo(() => ({
    cart,
    addToCart,
    addHalfAndHalfToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    toast,
  }), [
    cart, 
    addToCart, 
    addHalfAndHalfToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    totalPrice, 
    isCartOpen,
    toast
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
