"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import { categories, Product } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/services/products";

import CartButton from "@/components/CartButton";
import CartSidebar from "@/components/CartSidebar";
import { useCart } from "@/context/CartContext";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const { toast } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const sheetProducts = await getProducts();
        setProducts(sheetProducts || []);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setError("Não foi possível carregar o cardápio. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => 
    products.filter(
      (product) => product.category === activeCategory && product.active
    ),
    [products, activeCategory]
  );

  return (
    <main className="min-h-screen pb-24">
      <Header />
      <Hero />
      <CategoryTabs 
        id="menu"
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{activeCategory}</h2>
          <p className="text-gray-400">Confira nossas opções selecionadas para você.</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-gray-500">Carregando cardápio...</p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="max-w-xs text-xl font-bold text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-white/5 px-6 py-2 text-sm font-bold transition-all hover:bg-white/10"
            >
              Tentar Novamente
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 className="text-xl font-bold">Cardápio em atualização</h3>
            <p className="mt-2 text-gray-500">Estamos preparando novidades deliciosas para você.</p>
          </div>
        ) : (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    allProducts={products}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-xl text-gray-500">Nenhum produto encontrado nesta categoria.</p>
              </div>
            )}
          </>
        )}
      </div>

      <CartButton />
      <Suspense fallback={null}>
        <CartSidebar />
      </Suspense>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-[200] flex items-center gap-3 rounded-2xl bg-green-500 px-6 py-4 font-bold text-white shadow-2xl shadow-green-500/20"
          >
            <CheckCircle2 className="h-5 w-5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-white/5 bg-black/40 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
              D
            </div>
            <span className="text-lg font-bold tracking-tight">
              DI CAZA<span className="text-primary"> PIZZARIA</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Di Caza Pizzaria. Todos os direitos reservados. <br />
            A verdadeira experiência da pizza artesanal.
          </p>
        </div>
      </footer>
    </main>
  );
}
