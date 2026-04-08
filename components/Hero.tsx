"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden sm:h-[650px] lg:h-[750px]">
      {/* Background Image with optimized overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1920&auto=format&fit=crop"
          alt="Pizza Artesanal Di Caza"
          className="h-full w-full object-cover scale-105 animate-slow-zoom"
          referrerPolicy="no-referrer"
        />
        {/* Multi-layer gradient for maximum text readability and depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:via-[#0a0a0a]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20" />
      </div>

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 backdrop-blur-xl border border-white/10"
          >
            <span className="flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-200">
              Forno a Lenha • Massa Artesanal
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="mb-4 text-6xl font-black leading-[0.9] tracking-tighter text-white sm:text-8xl lg:text-9xl">
              Di Caza <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent italic font-serif">
                  Pizzaria
                </span>
                <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-transparent rounded-full opacity-50" />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-gray-300 sm:text-2xl"
          >
            Sabor artesanal direto do forno para você. <br className="hidden sm:block" />
            A verdadeira experiência da pizza premium em cada fatia.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-5"
          >
            <button
              onClick={() => {
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-10 py-5 text-lg font-black text-white shadow-[0_20px_50px_rgba(234,88,12,0.3)] transition-all hover:scale-105 hover:shadow-orange-600/40 active:scale-95"
            >
              <span className="relative z-10">FAZER PEDIDO</span>
              <ChevronRight className="relative z-10 h-6 w-6 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </button>
            
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-6 py-5 backdrop-blur-md border border-white/10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gray-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-white">+500 pedidos</p>
                <p className="text-xs text-gray-400">realizados hoje</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20" />
    </section>
  );
}
