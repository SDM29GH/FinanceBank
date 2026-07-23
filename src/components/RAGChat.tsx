import React, { useState } from 'react';
import { Send, Bot, User, RefreshCw, ShieldCheck, DollarSign, Clock, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { RAGQueryResult } from '../types';

const PRESET_QUESTIONS = [
  {
    icon: Clock,
    label: 'Límite de Transferencia',
    question: '¿Cuál es el límite máximo de transferencia diaria en mi cuenta?'
  },
  {
    icon: ShieldCheck,
    label: 'Seguridad Nocturna',
    question: '¿Qué medidas de seguridad y límites aplican para transferencias en horario nocturno?'
  },
  {
    icon: DollarSign,
    label: 'Comisiones en Cajeros',
    question: '¿Cuáles son las comisiones aplicables por retiro de efectivo en cajeros automáticos del extranjero?'
  },
  {
    icon: HelpCircle,
    label: 'Protección de Datos',
    question: '¿Cómo puedo ejercer mis derechos ARCO para solicitar la eliminación o revisión de mis datos personales?'
  }
];

export const RAGChat: React.FC = () => {
  const [messages, setMessages] = useState<
    { id: string; sender: 'user' | 'agent'; text: string; timestamp: string }[]
  >([
    {
      id: 'welcome',
      sender: 'agent',
      text: '¡Hola! Bienvenida/o a FinanceBANK. Soy tu Asistente Virtual Oficial. Estoy capacitado para ayudarte con todas tus dudas sobre límites de cuenta, comisiones, transferencias, seguridad y políticas del banco. ¿En qué puedo orientarte hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const agentMsgId = `msg-agent-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      if (!res.ok) {
        throw new Error('Error al conectar con la central del banco');
      }

      const data: RAGQueryResult = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: agentMsgId,
          sender: 'agent',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: agentMsgId,
          sender: 'agent',
          text: `⚠️ Estimado cliente, ocurrió un inconveniente temporal: ${err.message || 'Error de servicio'}. Por favor intenta tu consulta nuevamente.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Atención Inteligente FinanceBANK
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Consultas de Cuenta, Tarifas & Seguridad
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Resuelve tus preguntas al instante con respuestas oficiales basadas en nuestros términos y condiciones, tabla de comisiones y políticas de protección al usuario.
          </p>
        </div>
      </div>

      {/* Quick Questions Grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Consultas frecuentes recomendadas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_QUESTIONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleSend(item.question)}
                disabled={loading}
                className="text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition group flex items-start space-x-3"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition block">
                    {item.label}
                  </span>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.question}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 min-h-[400px] max-h-[580px] overflow-y-auto flex flex-col space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center space-x-2 mb-1 px-1">
                {isUser ? (
                  <>
                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                    <span className="text-xs font-semibold text-slate-300">Tú</span>
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-blue-400">Asistente FinanceBANK</span>
                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed max-w-2xl shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 bg-slate-800/50 p-3 rounded-xl w-fit border border-slate-700/50 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs font-medium">
              Procesando tu consulta con las políticas del banco...
            </span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl focus-within:border-blue-500 transition"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Escribe tu consulta aquí (ej. ¿Cuál es la comisión por retiro en cajero internacional?)"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 transition shadow-lg shadow-blue-600/20 flex items-center space-x-2"
          >
            <span>Consultar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
