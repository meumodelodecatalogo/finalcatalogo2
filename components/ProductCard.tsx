"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Plus, Star, Split } from "lucide-react";
import { Product, PIZZARIA_CONFIG } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { isPizzaCategory } from "@/lib/utils";
import PizzaSelectionModal from "./HalfAndHalfModal";

interface ProductCardProps {
  product: Product;
  allProducts?: Product[];
}

function ProductCard({ product, allProducts = [] }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isPizza = isPizzaCategory(product.category);
  const fallbackImage = "/images/fallback.webp";

  const startingPrice = isPizza 
    ? (product.priceSmall || product.priceMedium || product.priceLarge || product.price)
    : product.price;

  const handleAddClick = () => {
    if (isPizza) {
      setIsModalOpen(true);
    } else {
      try {
        addToCart(product);
      } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        alert("Não foi possível adicionar o item ao carrinho.");
      }
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <img
            src={imgError ? fallbackImage : product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          {product.tags?.includes("Mais Pedida") && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-1 text-[10px] font-bold text-black">
              <Star className="h-3 w-3 fill-current" />
              MAIS PEDIDA
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-tight text-white">{product.name}</h3>
            <div className="flex flex-col items-end">
              {isPizza && (
                <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider leading-none mb-0.5">
                  A partir de
                </span>
              )}
              <span className="text-xl font-bold text-primary">
                R$ {startingPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
          <p className="mb-6 line-clamp-2 text-sm text-gray-400">
            {product.description}
          </p>
          
          <div className="mt-auto flex items-center justify-end">
            <button 
              onClick={handleAddClick}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform hover:scale-110 active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.div>

      {isPizza && (
        <PizzaSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          firstFlavor={product}
          allProducts={allProducts}
        />
      )}
    </>
  );
}

export default memo(ProductCard);
