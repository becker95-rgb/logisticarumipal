import { useState, useEffect } from "react";
import { Truck, Calendar, Sparkles, RefreshCw, FileText, CheckCircle2 } from "lucide-react";

import { ParsedSheetData, Client } from "./types";
import { DEFAULT_SHEET_DATA, parseTSV, parseDevolucionesCSVDetails } from "./utils/sheetParser";

import MetricCards from "./components/MetricCards";
import SheetSelector from "./components/SheetSelector";
import FirstPanelTable from "./components/FirstPanelTable";
import SecondPanelWeekly from "./components/SecondPanelWeekly";

const LOCAL_STORAGE_KEY_URL = "control_bultos_active_url";
const LOCAL_STORAGE_KEY_DELIVERED = "control_bultos_delivered_map";

function normalizeSheetText(raw: string): string {
  return raw.replace(/\r/g, "").trim();
}

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

  // Safe fetch from our Direct Google Sheets Integration
  const handleLoadSheetUrl = async (url: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let tsvUrl = url;
      if (url.includes('/edit')) {
        tsvUrl = url.split('/edit')[0] + '/export?format=tsv';
      } else if (!url.endsWith('/export?format=tsv')) {
        tsvUrl = url + '/export?format=tsv';
      }
      
      const response = await fetch(tsvUrl);
      if (!response.ok) {
        throw new Error(`Error al obtener la planilla: ${response.status}`);
      }
      
      const tsvText = await response.text();
      const normalizedMainSheet = normalizeSheetText(tsvText);
      const data = { tsv: tsvText };

      // Parse TSV
      const parsed = parseTSV(data.tsv, url);
      
      // Load returns exclusively from Sheet 2 ("Hoja 2").
      let totalDevoluciones = 0;
      let foundReturnsSheet = false;
      const sheetTabName = "Hoja 2";

      const baseSheetUrl = url.includes('/edit') ? url.split('/edit')[0] : url;
      try {
        const candidateUrls = [
          `${baseSheetUrl}/export?format=tsv&sheet=${encodeURIComponent(sheetTabName)}`,
          `${baseSheetUrl}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetTabName)}`,
        ];

        for (const returnsUrl of candidateUrls) {
          const returnsResponse = await fetch(returnsUrl);
          if (!returnsResponse.ok) continue;

          const returnsText = await returnsResponse.text();
          if (!returnsText || returnsText.trim() === "") continue;
          if (returnsText.trimStart().startsWith("<")) continue;

          // Some Google export URLs can ignore the sheet selector and return the main tab.
          // If content is identical to the already-loaded main sheet, skip it.
          if (normalizeSheetText(returnsText) === normalizedMainSheet) continue;

          const parsedDev = parseDevolucionesCSVDetails(returnsText);
          if (parsedDev.numericCellCount === 0) continue;

          totalDevoluciones = parsedDev.total;
          foundReturnsSheet = true;
          console.log(`Sincronizado con éxito: ${totalDevoluciones} devoluciones de la pestaña "${sheetTabName}"`);
          break;
        }

        if (!foundReturnsSheet) {
          console.warn(`No se pudo obtener contenido numérico desde la pestaña "${sheetTabName}"`);
        }
      } catch (e) {
        console.warn(`No se pudo cargar la pestaña "${sheetTabName}":`, e);
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
            General
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
            Semanal
          </button>
        </div>

        {/* Conditional Layout Panels */}
        {activeTab === "all" && (
          <div className="flex flex-col gap-8">
            <FirstPanelTable clients={clientsWithDeliveryStatus} products={sheetData.products} />
            <SecondPanelWeekly
              clients={clientsWithDeliveryStatus}
              products={sheetData.products}
              onToggleDelivered={handleToggleDelivered}
            />
          </div>
        )}
        {activeTab === "general" && (
          <FirstPanelTable clients={clientsWithDeliveryStatus} products={sheetData.products} />
        )}
        {activeTab === "weekly" && (
          <SecondPanelWeekly
            clients={clientsWithDeliveryStatus}
            products={sheetData.products}
            onToggleDelivered={handleToggleDelivered}
          />
        )}
      </main>
    </div>
  );
}
