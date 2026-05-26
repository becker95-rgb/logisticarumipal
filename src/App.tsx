import { useState, useEffect } from "react";
import { Truck, Calendar, Sparkles, RefreshCw, FileText, CheckCircle2 } from "lucide-react";

import { ParsedSheetData, Client } from "./types";
import { DEFAULT_SHEET_DATA, parseTSV, parseDevolucionesCSV } from "./utils/sheetParser";

import MetricCards from "./components/MetricCards";
import SheetSelector from "./components/SheetSelector";
import FirstPanelTable from "./components/FirstPanelTable";
import SecondPanelWeekly from "./components/SecondPanelWeekly";

const LOCAL_STORAGE_KEY_URL = "control_bultos_active_url";
const LOCAL_STORAGE_KEY_DELIVERED = "control_bultos_delivered_map";

export default function App() {
  const [sheetData, setSheetData] = useState<ParsedSheetData>(DEFAULT_SHEET_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"general" | "weekly" | "all">("all");

  // Load delivered map from localStorage on mount
  const [deliveredStatusMap, setDeliveredStatusMap] = useState<{ [name: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DELIVERED);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Apply delivered states whenever sheetData or deliveredStatusMap change
  const clientsWithDeliveryStatus = sheetData.clients.map((client) => ({
    ...client,
    delivered: !!deliveredStatusMap[client.name],
  }));

  // Save delivered status to localStorage and update state
  const handleToggleDelivered = (clientName: string) => {
    setDeliveredStatusMap((prev) => {
      const updated = { ...prev, [clientName]: !prev[clientName] };
      localStorage.setItem(LOCAL_STORAGE_KEY_DELIVERED, JSON.stringify(updated));
      return updated;
    });
  };

  // Safe fetch from our Express Proxy Backend
  const handleLoadSheetUrl = async (url: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.tsv) {
        throw new Error("El servidor no devolvió una planilla válida.");
      }

      // Parse TSV
      const parsed = parseTSV(data.tsv, url);
      
      // Try to fetch Sheet 2 ("Hoja 2") or DEVOLUCIONES tab automatically to sync returns
      let totalDevoluciones = 0;
      const sheetTabNames = ["Hoja 2", "DEVOLUCIONES", "Devoluciones", "Sheet2", "Sheet 2"];
      for (const tabName of sheetTabNames) {
        try {
          const returnsResponse = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(url)}&sheetName=${encodeURIComponent(tabName)}`);
          if (returnsResponse.ok) {
            const resData = await returnsResponse.json();
            if (resData.csv) {
              const parsedDev = parseDevolucionesCSV(resData.csv);
              if (parsedDev > 0) {
                totalDevoluciones = parsedDev;
                console.log(`Sincronizado con éxito: ${totalDevoluciones} devoluciones de la pestaña "${tabName}"`);
                break;
              }
            }
          }
        } catch (e) {
          console.warn(`No se pudo cargar la pestaña "${tabName}":`, e);
        }
      }

      parsed.totalDevoluciones = totalDevoluciones;
      
      // Update state
      setSheetData(parsed);
      setIsMockData(false);
      localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "No se pudo cargar la planilla. Por favor intenta de nuevo.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Default Demo Data
  const handleResetToDemo = () => {
    setSheetData(DEFAULT_SHEET_DATA);
    setIsMockData(true);
    setErrorMsg(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_URL);
  };

  // Try to load last successfully synced URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
    if (savedUrl) {
      handleLoadSheetUrl(savedUrl).catch(() => {
        // Fallback to demo if saved url loading fails silently
        setIsMockData(true);
      });
    }
  }, []);

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-relaxed selection:bg-blue-100 antialiased">
      {/* Professional Polish Header */}
      <header id="app-main-header" className="bg-white border-b border-slate-200 py-4 px-4 md:px-8 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Truck className="w-5 h-5 text-white m-auto" />
            </div>
            <div>
              <h1 id="app-header-title" className="text-xl font-extrabold text-blue-600 tracking-tight uppercase">
                LOGISTICA RUMIPAL
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                Control de Carga & Distribución de Bultos por Cliente • Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {!isMockData && (
              <button
                id="btn-restore-demo"
                onClick={handleResetToDemo}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1.5"
              >
                Cargar Demo
              </button>
            )}
            <div className="bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-3 flex items-center gap-2 font-mono text-[11px] text-slate-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Conectado
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main id="app-main-content" className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Google Sheet Sync URL input element */}
        <SheetSelector
          currentUrl={sheetData.activeUrl}
          onLoadUrl={handleLoadSheetUrl}
          isMockData={isMockData}
          isLoading={isLoading}
          errorMsg={errorMsg}
        />

        {/* Dynamic Metric Cards Statistics row */}
        <MetricCards
          clients={clientsWithDeliveryStatus}
          products={sheetData.products}
          totalDevoluciones={sheetData.totalDevoluciones || 0}
        />

        {/* Perspectives Nav (Tabs Navigation) */}
        <div id="tabs-navigation-panel" className="bg-white border border-slate-200 rounded-xl p-1 mb-6 inline-flex gap-1 w-full max-w-lg shadow-xs">
          <button
            id="tab-view-all"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Vista Completa
          </button>
          <button
            id="tab-view-general"
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "general"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Panel 1: Planilla
          </button>
          <button
            id="tab-view-weekly"
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "weekly"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Panel 2: Semanal
          </button>
        </div>

        {/* Content Layout per State Active Tab */}
        <div id="panels-grid-container" className="space-y-6">
          {(activeTab === "all" || activeTab === "general") && (
            <div id="section-general-table" className="animate-fade-in">
              <FirstPanelTable
                clients={clientsWithDeliveryStatus}
                products={sheetData.products}
              />
            </div>
          )}

          {(activeTab === "all" || activeTab === "weekly") && (
            <div id="section-weekly-timeline" className="animate-fade-in">
              <SecondPanelWeekly
                clients={clientsWithDeliveryStatus}
                products={sheetData.products}
                onToggleDelivered={handleToggleDelivered}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer Instructions / Guides */}
      <footer id="app-footer-guide" className="max-w-7xl mx-auto px-4 md:px-8 pb-12 mt-4">
        <div className="bg-slate-100 rounded-xl p-5 border border-slate-200/60">
          <h4 className="text-xs font-black text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            Guía de Uso Rápido
          </h4>
          <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-semibold text-slate-700">Compartir Planilla:</span> Tu Google Sheet debe estar configurado como "Cualquier persona con el enlace puede ver".
            </li>
            <li>
              <span className="font-semibold text-slate-700">Filtros Cruzados (Panel 1):</span> Puedes aislar por día de Carga, Reparto y Transportes específicos en tiempo real.
            </li>
            <li>
              <span className="font-semibold text-slate-700">Control de Entregas (Panel 2):</span> Haz clic en el casillero de check del cliente para tachar su orden una vez entregada. Las entregas se guardan de forma segura en tu navegador.
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
