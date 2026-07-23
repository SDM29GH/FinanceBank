import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileCode, Terminal, Layers, BookOpen, ExternalLink } from 'lucide-react';
import { PYTHON_REPO_FILES } from '../data/pythonCode';
import { CodeFile } from '../types';

export const PythonCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PYTHON_REPO_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    PYTHON_REPO_FILES.forEach((f) => handleDownloadFile(f));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
              Repositorio GitHub
            </span>
            <span className="text-xs text-slate-400 font-mono">fintech-rag-agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Código Fuente del Agente en Python & LangChain
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Estructura completa del repositorio con código modular en Python, lectura PyPDF, API FastAPI, Dockerfile y scripts de deploy en OCI Compute.
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Código (.zip / Archivos)</span>
        </button>
      </div>

      {/* Main Grid: File Tree (Left) + Code Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Browser Side */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Estructura de Archivos
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {PYTHON_REPO_FILES.length} archivos
            </span>
          </div>

          <div className="space-y-1.5">
            {PYTHON_REPO_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-600/10 border border-blue-500 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="text-xs font-mono truncate">{file.name}</span>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Side */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {/* File Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white font-mono">{selectedFile.path}</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium border border-blue-500/30 transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Code Container */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-[550px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
