"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PIZZARIA_CONFIG } from "@/lib/data";

function CartItem({ 
  item, 
  updateQuantity, 
  removeFromCart 
}: { 
  item: any; 
  updateQuantity: (id: string, delta: number) => void; 
  removeFromCart: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "/images/fallback.webp";

  return (
    <div className="flex gap-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={imgError ? fallbackImage : item.imageUrl}
          alt={item.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <h3 className="font-bold leading-tight">{item.name}</h3>
          <button 
            onClick={() => removeFromCart(item.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {item.isHalfAndHalf && item.flavors && (
          <div className="mt-1 flex flex-col gap-0.5">
            {item.flavors.map((flavor: any) => (
              <span key={flavor.id} className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {flavor.name}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mb-2 mt-1">
          R$ {item.price.toFixed(2).replace(".", ",")}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-1">
            <button 
              onClick={() => updateQuantity(item.id, -1)}
              className="text-gray-400 hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold w-4 text-center">
              {item.quantity}
            </span>
            <button 
              onClick={() => updateQuantity(item.id, 1)}
              className="text-gray-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="font-bold text-primary">
            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CartSidebar() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    totalPrice,
    clearCart
  } = useCart();

  const searchParams = useSearchParams();
  const mesa = searchParams.get("mesa");
  const [observations, setObservations] = useState("");
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    if (isCartOpen && !orderCode) {
      setOrderCode(Math.random().toString(36).substring(2, 7).toUpperCase());
    }
  }, [isCartOpen, orderCode]);

  const generateWhatsAppMessage = () => {
    try {
      const now = new Date();
      const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      
      let message = `🍕 *Pedido Di Caza Pizzaria* 🍕\n`;
      message += `--------------------------\n`;
      message += `🆔 *Código:* #${orderCode || "N/A"}\n`;
      message += `⏰ *Horário:* ${time}\n`;
      if (mesa) message += `🪑 *Mesa:* ${mesa}\n`;
      message += `\n*Itens:*\n`;

      cart.forEach((item) => {
        message += `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")})\n`;
        if (item.isHalfAndHalf && item.flavors) {
          item.flavors.forEach(flavor => {
            message += `  - Metade ${flavor.name}\n`;
          });
        }
      });

      message += `\n--------------------------\n`;
      if (observations.trim()) {
        message += `📝 *Observações:* ${observations}\n\n`;
      }
      message += `💰 *Total Final: R$ ${totalPrice.toFixed(2).replace(".", ",")}*`;

      return encodeURIComponent(message);
    } catch (error) {
      console.error("Erro ao gerar mensagem do WhatsApp:", error);
      return "";
    }
  };

  const handleCheckout = () => {
    try {
      const phone = PIZZARIA_CONFIG.whatsapp;
      const message = generateWhatsAppMessage();
      
      if (!message) {
        alert("Ocorreu um erro ao preparar seu pedido. Tente novamente.");
        return;
      }

      const url = `https://wa.me/${phone}?text=${message}`;
      
      // Use window.open with fallback
      const newWindow = window.open(url, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Fallback if popup is blocked
        window.location.href = url;
      }
      
      // Clear cart and close sidebar after order
      setTimeout(() => {
        clearCart();
        setObservations("");
        setIsCartOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Não foi possível redirecionar para o WhatsApp. Verifique se o navegador permite popups.");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-[#0f0f0f] shadow-2xl border-l border-white/5"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Seu Carrinho</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-2 hover:bg-white/5 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white/5 p-6">
                      <ShoppingBag className="h-12 w-12 text-gray-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-400">
                      Seu carrinho está vazio
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-primary font-bold hover:underline"
                    >
                      Voltar para o cardápio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <CartItem 
                        key={item.id} 
                        item={item} 
                        updateQuantity={updateQuantity} 
                        removeFromCart={removeFromCart} 
                      />
                    ))}

                    {/* Observations */}
                    <div className="mt-8 border-t border-white/5 pt-6">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
                        <MessageSquare className="h-4 w-4" />
                        Observações do Pedido
                      </div>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Ex: Sem cebola, trocar por borda de catupiry..."
                        className="w-full rounded-2xl bg-white/5 p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-white/5 bg-white/[0.02] p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-gray-400">Total do Pedido</span>
                    <span className="text-2xl font-bold">
                      R$ {totalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Finalizar Pedido
                  </button>
                  <p className="mt-4 text-center text-xs text-gray-500">
                    Você será redirecionado para o WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
