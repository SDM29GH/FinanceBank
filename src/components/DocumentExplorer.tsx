import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Layers, BookOpen, Upload, Hash, Search } from 'lucide-react';
import { FintechDocument } from '../types';

export const DocumentExplorer: React.FC = () => {
  const [documents, setDocuments] = useState<FintechDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<FintechDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doc Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'terms' | 'security' | 'fees' | 'privacy' | 'limits' | 'custom'>('custom');
  const [newContent, setNewContent] = useState('');
  const [addingDoc, setAddingDoc] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
      if (data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setAddingDoc(true);
    try {
      const res = await fetch('/api/documents/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          filename: `${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setShowAddModal(false);
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Error adding document:', err);
    } finally {
      setAddingDoc(false);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase">
              Base de Conocimiento RAG
            </span>
            <span className="text-xs text-slate-400 font-mono">PyPDF Vector Store</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Documentación Bancaria Indexada ({documents.length} Archivos PDF)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Explora las páginas, secciones y extractos de texto indexados por el motor de fragmentación (Text Splitter) de LangChain.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo PDF / Documento</span>
        </button>
      </div>

      {/* Main Grid: File List (Left) + Content Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List Side */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar documento PDF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-mono text-blue-400 font-medium">
                        {doc.filename}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {doc.pagesCount} Pág{doc.pagesCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold mt-2 text-slate-100 line-clamp-1">{doc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{doc.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Details & Pages */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                    {selectedDoc.filename}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Procesado con PyPDFLoader
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedDoc.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedDoc.description}</p>
              </div>

              {/* Pages & Text Extract */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Páginas Extraídas del Archivo PDF:
                </h3>

                {selectedDoc.pages.map((page) => (
                  <div key={page.pageNumber} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
                      <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" /> Página {page.pageNumber} de {selectedDoc.pagesCount}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {page.content.length} caracteres
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap pt-1">
                      {page.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Selecciona un documento PDF para ver su contenido extraído.
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-1">Agregar Nuevo Documento al Agente RAG</h2>
            <p className="text-xs text-slate-400 mb-4">
              Ingresa el título y contenido del documento. El backend lo fragmentará con LangChain para indexación instantánea.
            </p>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Política de Crédito y Préstamos Personales"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="custom">Personalizado</option>
                  <option value="terms">Términos y Condiciones</option>
                  <option value="security">Seguridad y Fraudes</option>
                  <option value="fees">Tarifas y Comisiones</option>
                  <option value="limits">Límites y FAQ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contenido de las Políticas / Cláusulas
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escribe o pega aquí el texto de las políticas normativas del banco..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingDoc}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  {addingDoc ? 'Procesando RAG...' : 'Indexar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
