import React, { useState } from "react";
import { FileSpreadsheet, RefreshCw, Link, Check, AlertCircle } from "lucide-react";

interface SheetSelectorProps {
  currentUrl: string;
  onLoadUrl: (url: string) => Promise<void>;
  isMockData: boolean;
  isLoading: boolean;
  errorMsg: string | null;
}

export default function SheetSelector({
  currentUrl,
  onLoadUrl,
  isMockData,
  isLoading,
  errorMsg,
}: SheetSelectorProps) {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [synced, setSynced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSynced(false);
    try {
      await onLoadUrl(urlInput.trim());
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    } catch (err) {
      // Handled in parent
    }
  };

  return (
    <div id="sheet-selector-container" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 id="sheet-selector-title" className="text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Sincronizar Google Sheet
            </h2>
            {isMockData ? (
              <span id="badge-mock-data" className="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-200 animate-pulse">
                Datos de Demostración
              </span>
            ) : (
              <span id="badge-live-data" className="bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-green-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                Sincronizado
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Ingresa la URL pública de tu planilla de Google ("Cualquier persona con el enlace puede leer").
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl w-full flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Link className="w-4 h-4" />
            </div>
            <input
              id="sheet-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-750 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-600 focus:bg-white transition-all font-medium"
            />
          </div>
          <button
            id="sheet-submit-button"
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              synced
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : synced ? (
              <Check className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoading ? "Cargando..." : synced ? "¡Listo!" : "Sincronizar"}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div id="sheet-error-alert" className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div>
            <span className="font-semibold">Error al conectar:</span> {errorMsg}
            <span className="block mt-0.5 text-red-600/80">
              Verifica que el enlace sea correcto y que la planilla esté compartida con "Cualquier persona con el enlace puede leer".
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
