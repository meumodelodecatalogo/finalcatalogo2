"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight, ShoppingCart } from "lucide-react";
import { Product, PIZZARIA_CONFIG } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { cn, isPizzaCategory } from "@/lib/utils";

interface PizzaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstFlavor: Product;
  allProducts: Product[];
}

type SelectionStep = "size" | "type" | "flavor";
type PizzaType = "inteira" | "meio-a-meio";

function FlavorCard({ 
  flavor, 
  isSelected, 
  onClick 
}: { 
  flavor: Product; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "/images/fallback.webp";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-3 transition-all text-left",
        isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-white/5 bg-white/5 hover:bg-white/10"
      )}
    >
      <img
        src={imgError ? fallbackImage : flavor.imageUrl}
        alt={flavor.name}
        onError={() => setImgError(true)}
        className="h-16 w-16 rounded-xl object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1">
        <h4 className="font-bold text-sm">{flavor.name}</h4>
        <p className="text-xs text-gray-500 line-clamp-1">{flavor.description}</p>
        <p className="mt-1 text-xs font-bold text-primary">
          R$ {flavor.price.toFixed(2).replace(".", ",")}
        </p>
      </div>
      {isSelected && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}

export default function PizzaSelectionModal({ isOpen, onClose, firstFlavor, allProducts }: PizzaSelectionModalProps) {
  const [step, setStep] = useState<SelectionStep>("size");
  const [selectedSize, setSelectedSize] = useState<typeof PIZZARIA_CONFIG.pizzaSizes[0] | null>(null);
  const [pizzaType, setPizzaType] = useState<PizzaType | null>(null);
  const [flavor1, setFlavor1] = useState<Product | null>(null);
  const [flavor2, setFlavor2] = useState<Product | null>(null);
  
  const { addToCart, addHalfAndHalfToCart } = useCart();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("size");
      setSelectedSize(null);
      setPizzaType(null);
      setFlavor1(null);
      setFlavor2(null);
    }
  }, [isOpen]);

  const allPizzaFlavors = (allProducts || []).filter(
    (p) => isPizzaCategory(p.category) && p.active
  );

  const handleConfirm = () => {
    if (!selectedSize) return;

    try {
      if (pizzaType === "inteira") {
        const finalPrice = selectedSize.id === "small" ? (firstFlavor.priceSmall || firstFlavor.price) :
                          selectedSize.id === "medium" ? (firstFlavor.priceMedium || firstFlavor.price) :
                          (firstFlavor.priceLarge || firstFlavor.price);
        
        addToCart(firstFlavor, selectedSize.name, finalPrice);
        onClose();
      } else if (pizzaType === "meio-a-meio" && flavor1 && flavor2) {
        const getPriceForSize = (p: Product) => {
          if (selectedSize.id === "small") return p.priceSmall || p.price;
          if (selectedSize.id === "medium") return p.priceMedium || p.price;
          return p.priceLarge || p.price;
        };

        const price1 = getPriceForSize(flavor1);
        const price2 = getPriceForSize(flavor2);
        const finalPrice = Math.max(price1, price2);
        
        addHalfAndHalfToCart(flavor1, flavor2, selectedSize.name, finalPrice);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao adicionar pizza:", error);
      alert("Não foi possível adicionar a pizza ao carrinho. Tente novamente.");
    }
  };

  const currentPrice = selectedSize 
    ? (pizzaType === "meio-a-meio" 
        ? (flavor1 && flavor2 
            ? Math.max(
                selectedSize.id === "small" ? (flavor1.priceSmall || flavor1.price) : selectedSize.id === "medium" ? (flavor1.priceMedium || flavor1.price) : (flavor1.priceLarge || flavor1.price),
                selectedSize.id === "small" ? (flavor2.priceSmall || flavor2.price) : selectedSize.id === "medium" ? (flavor2.priceMedium || flavor2.price) : (flavor2.priceLarge || flavor2.price)
              ) 
            : (flavor1 
                ? (selectedSize.id === "small" ? (flavor1.priceSmall || flavor1.price) : selectedSize.id === "medium" ? (flavor1.priceMedium || flavor1.price) : (flavor1.priceLarge || flavor1.price)) 
                : (selectedSize.id === "small" ? (firstFlavor.priceSmall || firstFlavor.price) : selectedSize.id === "medium" ? (firstFlavor.priceMedium || firstFlavor.price) : (firstFlavor.priceLarge || firstFlavor.price))))
        : (selectedSize.id === "small" ? (firstFlavor.priceSmall || firstFlavor.price) : selectedSize.id === "medium" ? (firstFlavor.priceMedium || firstFlavor.price) : (firstFlavor.priceLarge || firstFlavor.price)))
    : (firstFlavor.priceSmall || firstFlavor.priceMedium || firstFlavor.priceLarge || firstFlavor.price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-[110] mx-auto max-w-2xl overflow-hidden rounded-3xl bg-[#0f0f0f] border border-white/10 shadow-2xl md:top-[15%]"
          >
            <div className="flex h-full flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6">
                <div>
                  <h2 className="text-xl font-bold">Personalize sua Pizza</h2>
                  <p className="text-sm text-gray-400">
                    {pizzaType === "meio-a-meio" ? (
                      flavor1 ? (flavor2 ? `Sabores: ${flavor1.name} / ${flavor2.name}` : `1º Sabor: ${flavor1.name}`) : "Escolha os sabores"
                    ) : (
                      `Sabor: ${firstFlavor.name}`
                    )}
                  </p>
                </div>
                <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="flex border-b border-white/5 bg-white/[0.01]">
                {[
                  { id: "size", label: "1. Tamanho" },
                  { id: "type", label: "2. Tipo" },
                  { id: "flavor", label: "3. Sabores", hidden: pizzaType === "inteira" }
                ].filter(s => !s.hidden).map((s) => (
                  <div 
                    key={s.id}
                    className={cn(
                      "flex flex-1 items-center justify-center py-4 text-[10px] font-bold uppercase tracking-wider transition-colors",
                      step === s.id ? "text-primary border-b-2 border-primary" : "text-gray-600"
                    )}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {step === "size" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Qual o tamanho?</h3>
                      <p className="text-sm text-gray-500">Escolha o tamanho ideal para sua fome</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {PIZZARIA_CONFIG.pizzaSizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => {
                            setSelectedSize(size);
                            setStep("type");
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-5 transition-all",
                            selectedSize?.id === size.id
                              ? "border-primary bg-primary/10 ring-1 ring-primary"
                              : "border-white/5 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full border-2",
                              selectedSize?.id === size.id ? "border-primary bg-primary" : "border-gray-600"
                            )}>
                              {selectedSize?.id === size.id && <Check className="h-4 w-4 text-white" />}
                            </div>
                            <span className="text-lg font-bold">{size.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-400">
                            R$ {(size.id === "small" ? (firstFlavor.priceSmall || firstFlavor.price) : size.id === "medium" ? (firstFlavor.priceMedium || firstFlavor.price) : (firstFlavor.priceLarge || firstFlavor.price)).toFixed(2).replace(".", ",")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === "type" && (
                  <div className="space-y-8">
                    <button 
                      onClick={() => setStep("size")}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                    >
                      ← Voltar para Tamanho
                    </button>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Como deseja sua pizza?</h3>
                      <p className="text-sm text-gray-500">Escolha entre um sabor inteiro ou dois sabores</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => {
                          setPizzaType("inteira");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-3xl border p-10 transition-all hover:bg-white/10",
                          pizzaType === "inteira" 
                            ? "border-primary bg-primary/10 ring-1 ring-primary" 
                            : "border-white/5 bg-white/5"
                        )}
                      >
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShoppingCart className="h-10 w-10" />
                        </div>
                        <span className="text-lg font-bold">Inteira</span>
                        <span className="mt-1 text-xs text-gray-500">Apenas este sabor</span>
                      </button>
                      <button
                        onClick={() => {
                          setPizzaType("meio-a-meio");
                          setStep("flavor");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-3xl border p-10 transition-all hover:bg-white/10",
                          pizzaType === "meio-a-meio" 
                            ? "border-primary bg-primary/10 ring-1 ring-primary" 
                            : "border-white/5 bg-white/5"
                        )}
                      >
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-10 w-10" />
                        </div>
                        <span className="text-lg font-bold">Meio a Meio</span>
                        <span className="mt-1 text-xs text-gray-500">Escolher dois sabores</span>
                      </button>
                    </div>

                    {pizzaType === "inteira" && (
                      <div className="flex justify-center pt-6">
                        <button
                          onClick={handleConfirm}
                          className="flex items-center gap-3 rounded-2xl bg-primary px-16 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                        >
                          Adicionar ao pedido
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {step === "flavor" && (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setStep("type")}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                    >
                      ← Voltar para Tipo
                    </button>
                    
                    <div className="text-center py-2 border-b border-white/5">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                        {!flavor1 ? "Escolha o 1º sabor" : !flavor2 ? "Escolha o 2º sabor" : "Sabores selecionados!"}
                      </h3>
                      {flavor1 && (
                        <p className="mt-1 text-[10px] text-gray-400">
                          1º: <span className="text-primary font-bold">{flavor1.name}</span>
                          {flavor2 && <> | 2º: <span className="text-primary font-bold">{flavor2.name}</span></>}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {allPizzaFlavors.map((flavor) => {
                        const isSelected = flavor1?.id === flavor.id || flavor2?.id === flavor.id;
                        const isDisabled = flavor1?.id === flavor.id;

                        return (
                          <FlavorCard
                            key={flavor.id}
                            flavor={flavor}
                            isSelected={isSelected}
                            onClick={() => {
                              if (!flavor1) {
                                setFlavor1(flavor);
                              } else if (!flavor2 && flavor.id !== flavor1.id) {
                                setFlavor2(flavor);
                              } else if (flavor1.id === flavor.id) {
                                setFlavor1(null);
                                setFlavor2(null);
                              } else if (flavor2?.id === flavor.id) {
                                setFlavor2(null);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedSize && (
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                          {selectedSize.name}
                        </span>
                        {pizzaType && (
                          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {pizzaType === "inteira" ? "Inteira" : "Meio a Meio"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {step === "flavor" && flavor1 && flavor2 && (
                    <button
                      onClick={() => handleConfirm()}
                      className="flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                      Adicionar ao pedido
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
