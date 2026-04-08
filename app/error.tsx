"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold">Ops! Algo deu errado.</h2>
      <p className="mb-8 max-w-md text-gray-400">
        Ocorreu um erro inesperado. Tente novamente em instantes.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-xl bg-white/5 px-6 py-3 font-bold transition-all hover:bg-white/10"
        >
          Voltar ao Início
        </button>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
