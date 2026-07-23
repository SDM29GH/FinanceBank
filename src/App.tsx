import React from 'react';
import { Navbar } from './components/Navbar';
import { RAGChat } from './components/RAGChat';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Navbar />

      {/* Main Bank Agent Interface */}
      <main className="flex-1 pb-12">
        <RAGChat />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🏦 NeonBank Fintech • Canal Oficial de Atención Virtual</span>
          <span className="font-mono text-[11px] text-slate-600">
            © 2026 NeonBank S.A. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}
