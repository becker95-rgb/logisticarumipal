import React, { useState, useMemo } from "react";
import { Filter, Search, Table, HelpCircle, Truck, Calendar, ChevronDown } from "lucide-react";
import { Client, ProductRow, DAYS_OF_WEEK } from "../types";

interface FirstPanelTableProps {
  clients: Client[];
  products: ProductRow[];
}

// Resolver for standard packs-per-palet ratios
export function getProductDivisor(name: string, originalPacks: number, originalPalets: number): number {
  if (originalPalets > 0 && originalPacks > 0) {
    const calculatedDivisor = originalPacks / originalPalets;
    const rounded = Math.round(calculatedDivisor);
    if (rounded > 0) return rounded;
  }
  
  const uName = name.toUpperCase();
  if (uName.includes("BIDON")) return 144;
  if (uName.includes("550") || uName.includes("500 CC")) return 180;
  if (uName.includes("AGUA SAB.") && uName.includes("1500 CC")) return 100;
  if (uName.includes("1500 CC")) return 110;
  return 80; // default configuration (2000 CC, 2250 CC, Sifones etc.)
}

// Custom Multi-Select Dropdown with Checkboxes to allow clicking multiple days at once
interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  icon: React.ReactNode;
}

function MultiSelectDropdown({ label, options, selectedValues, onChange, icon }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]); // Empty = selects all
  };

  const isAll = selectedValues.length === 0 || selectedValues.length === options.length;

  return (
    <div className="relative">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-[11px] text-slate-400 pointer-events-none z-10">
          {icon}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-semibold cursor-pointer text-left h-[38px]"
        >
          <span className="truncate max-w-[150px]">
            {isAll ? "TODOS LOS DÍAS" : selectedValues.join(", ")}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {!isAll && (
              <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">
                {selectedValues.length} tildados
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-30 p-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase px-1">
              <span>Tildar días ({selectedValues.length})</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-blue-600 hover:text-blue-800 cursor-pointer font-bold uppercase tracking-wider text-[8px]"
              >
                Ver todos
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin pr-1">
              {options.map((opt) => {
                const isChecked = selectedValues.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(opt)}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500/15 cursor-pointer shrink-0"
                    />
                    <span className="font-semibold text-slate-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function FirstPanelTable({ clients, products }: FirstPanelTableProps) {
  // Filter States: Carga & Entrega now support multiselect!
  const [cargaFilters, setCargaFilters] = useState<string[]>([]);
  const [entregaFilters, setEntregaFilters] = useState<string[]>([]);
  const [transporteFilter, setTransporteFilter] = useState<string>("ALL");
  const [productSearch, setProductSearch] = useState<string>("");

  // Get unique Carriers (Transportes) directly from the spreadsheet columns
  const uniqueTransportes = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.transporte && c.transporte !== "S/D") {
        set.add(c.transporte);
      }
    });
    return Array.from(set);
  }, [clients]);

  // Unique Carga Days present in the data
  const uniqueCargaDays = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.carga && c.carga !== "S/D") set.add(c.carga);
    });
    return Array.from(set);
  }, [clients]);

  // Unique Entrega Days present in the data
  const uniqueEntregaDays = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.entrega && c.entrega !== "S/D") set.add(c.entrega);
    });
    return Array.from(set);
  }, [clients]);

  // Filter Clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchCarga = cargaFilters.length === 0 || cargaFilters.includes(client.carga);
      const matchEntrega = entregaFilters.length === 0 || entregaFilters.includes(client.entrega);
      const matchTransporte = transporteFilter === "ALL" || client.transporte === transporteFilter;
      return matchCarga && matchEntrega && matchTransporte;
    });
  }, [clients, cargaFilters, entregaFilters, transporteFilter]);

  // Filter Products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const searchLower = productSearch.toLowerCase();
    return products.filter((prod) => prod.name.toLowerCase().includes(searchLower));
  }, [products, productSearch]);

  // Total Bultos currently filtered
  const filteredTotals = useMemo(() => {
    const totals: { [clientName: string]: number } = {};
    filteredClients.forEach((client) => {
      totals[client.name] = 0;
    });

    filteredProducts.forEach((prod) => {
      filteredClients.forEach((client) => {
        totals[client.name] += prod.clientQuantities[client.name] || 0;
      });
    });

    return totals;
  }, [filteredClients, filteredProducts]);

  // Dynamic totals for packs and palets per product row, and aggregated totals for the bottom row
  const rowMetricsAndTotals = useMemo(() => {
    let grandTotalPacks = 0;
    let grandTotalPalets = 0;
    
    const rowCalculations = filteredProducts.map((prod) => {
      const packsSum = filteredClients.reduce((sum, client) => {
        return sum + (prod.clientQuantities[client.name] || 0);
      }, 0);
      
      const divisor = getProductDivisor(prod.name, prod.packs, prod.palets);
      const paletsCalculated = packsSum > 0 && divisor > 0 ? packsSum / divisor : 0;
      
      grandTotalPacks += packsSum;
      grandTotalPalets += paletsCalculated;
      
      return {
        productId: prod.id,
        packs: packsSum,
        palets: paletsCalculated
      };
    });

    return {
      rowCalculations: rowCalculations.reduce((acc, curr) => {
        acc[curr.productId] = { packs: curr.packs, palets: curr.palets };
        return acc;
      }, {} as { [id: string]: { packs: number; palets: number } }),
      grandTotalPacks,
      grandTotalPalets
    };
  }, [filteredProducts, filteredClients]);

  const clearFilters = () => {
    setCargaFilters([]);
    setEntregaFilters([]);
    setTransporteFilter("ALL");
    setProductSearch("");
  };

  const hasActiveFilters =
    cargaFilters.length > 0 ||
    entregaFilters.length > 0 ||
    transporteFilter !== "ALL" ||
    productSearch !== "";

  return (
    <div id="first-panel-card" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-8">
      {/* Panel Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
            <Table className="w-4 h-4 m-auto" />
          </div>
          <div>
            <h3 id="panel-1-heading" className="text-md font-bold text-slate-800 tracking-tight">
              Panel 1: Planilla General de Carga y Clientes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Filtra y visualiza la carga por transportes, choferes y días de reparto en tiempo real.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-lg cursor-pointer transition-all self-start sm:self-center"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Buscar Producto */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Buscar Producto
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              id="filter-search-product"
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Soda, cerveza, agua..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-semibold"
            />
          </div>
        </div>

        {/* Filtrar por Día Carga (Multiselect checklist!) */}
        <MultiSelectDropdown
          label="Día de Carga (Tildar)"
          options={uniqueCargaDays}
          selectedValues={cargaFilters}
          onChange={setCargaFilters}
          icon={<Calendar className="w-4 h-4" />}
        />

        {/* Filtrar por Día Entrega (Multiselect checklist!) */}
        <MultiSelectDropdown
          label="Día de Entrega (Tildar)"
          options={uniqueEntregaDays}
          selectedValues={entregaFilters}
          onChange={setEntregaFilters}
          icon={<Calendar className="w-4 h-4" />}
        />

        {/* Filtrar por Transporte */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Transporte / Chofer
          </label>
          <div className="relative">
            <Truck className="w-4 h-4 absolute left-3 top-[11px] text-slate-400 pointer-events-none" />
            <select
              id="filter-carrier"
              value={transporteFilter}
              onChange={(e) => setTransporteFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-semibold cursor-pointer appearance-none h-[38px]"
            >
              <option value="ALL">TODOS LOS TRANSPORTES</option>
              {uniqueTransportes.map((trans) => (
                <option key={trans} value={trans}>
                  {trans}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Spreadsheet Table Container */}
      <div className="overflow-x-auto max-w-full">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/20">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-content-center text-slate-400 mx-auto mb-3">
              <Filter className="w-6 h-6 m-auto" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">No se encontraron clientes</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ningún cliente coincide con los filtros especificados. Modifica la búsqueda para ver más datos.
            </p>
          </div>
        ) : (
          <table id="planilla-main-table" className="w-full border-collapse text-left text-xs bg-white">
            <thead>
              {/* Row 1: CARGA */}
              <tr className="bg-slate-50 border-b border-slate-100">
                <th colSpan={4} className="p-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-200 bg-slate-100/30">
                  Ref Carga
                </th>
                {filteredClients.map((client) => (
                  <th
                    key={`carga-${client.id}`}
                    className="p-3 text-center border-r border-slate-100 min-w-[124px] font-mono text-[10px] font-bold text-slate-500"
                  >
                    <span className="bg-slate-200/50 px-2 py-0.5 rounded text-slate-600 block">
                      {client.carga}
                    </span>
                  </th>
                ))}
              </tr>

              {/* Row 2: ENTREGA */}
              <tr className="bg-slate-50 border-b border-slate-100">
                <th colSpan={4} className="p-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-200 bg-slate-100/30">
                  Ref Entrega
                </th>
                {filteredClients.map((client) => (
                  <th
                    key={`entrega-${client.id}`}
                    className="p-3 text-center border-r border-slate-100 font-mono text-[10px] font-bold text-slate-500 animate-fade-in"
                  >
                    <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded block">
                      {client.entrega}
                    </span>
                  </th>
                ))}
              </tr>

              {/* Row 3: TRANSPORTE */}
              <tr className="bg-slate-50 border-b border-slate-100">
                <th colSpan={4} className="p-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-200 bg-slate-100/30">
                  Ref Transporte
                </th>
                {filteredClients.map((client) => {
                  // Get first 10 characters or whole carrier
                  const cleanTrans = client.transporte.length > 8 ? `${client.transporte.substring(0, 8)}...` : client.transporte;
                  return (
                    <th
                      key={`trans-${client.id}`}
                      className="p-3 text-center border-r border-slate-100 leading-tight"
                      title={client.transporte}
                    >
                      <span className="inline-block px-2.5 py-1 bg-blue-600 border border-blue-700 text-white rounded text-[9px] font-bold uppercase tracking-wide shadow-xs max-w-full truncate">
                        {cleanTrans}
                      </span>
                    </th>
                  );
                })}
              </tr>

              {/* Row 4: COLUMN HEADERS */}
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold shadow-xs">
                <th className="p-3 border-r border-slate-200 min-w-[180px] text-slate-800">
                  PRODUCTO
                </th>
                <th className="p-3 border-r border-slate-100 text-right text-slate-500 min-w-[70px]">
                  Packs
                </th>
                <th className="p-3 border-r border-slate-100 text-right text-slate-500 min-w-[70px]">
                  Palets
                </th>
                <th className="p-3 border-r border-slate-200 text-right text-slate-800 min-w-[90px] bg-slate-250">
                  STOCK FINAL
                </th>
                {filteredClients.map((client) => (
                  <th
                    key={`header-${client.id}`}
                    className="p-3 text-center font-bold text-slate-850 uppercase tracking-tight border-r border-slate-200 min-w-[124px] bg-slate-50/50 border-b-2 border-b-slate-300"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="truncate max-w-[110px]" title={client.name}>
                        {client.name}
                      </span>
                      {client.delivered && (
                        <span className="bg-green-100 text-green-800 px-1.5 py-0.2 rounded text-[8px] font-extrabold tracking-wider border border-green-250">
                          ✔ ENTREGADO
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {filteredProducts.map((prod, rowIdx) => {
                const metrics = rowMetricsAndTotals.rowCalculations[prod.id] || { packs: 0, palets: 0 };
                return (
                  <tr
                    key={prod.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/10"
                    }`}
                  >
                    <td className="p-3 font-medium text-slate-900 bg-white border-r border-slate-200 shadow-sm sticky left-0 z-10 max-w-[240px] truncate" title={prod.name}>
                      {prod.name}
                    </td>
                    <td className="p-3 text-right text-slate-700 font-calibri font-bold border-r border-slate-100 bg-slate-50/20">
                      {metrics.packs > 0 ? metrics.packs.toLocaleString() : "-"}
                    </td>
                    <td className="p-3 text-right text-slate-700 font-calibri font-bold border-r border-slate-100 bg-slate-50/20">
                      {metrics.palets > 0 ? parseFloat(metrics.palets.toFixed(2)).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 text-right text-slate-800 font-bold font-calibri border-r border-slate-200 bg-slate-50/40">
                      {prod.stockFinal > 0 ? prod.stockFinal.toLocaleString() : "-"}
                    </td>
                    {filteredClients.map((client) => {
                      const qty = prod.clientQuantities[client.name] || 0;
                      return (
                        <td
                          key={`cell-${prod.id}-${client.id}`}
                          className={`p-3 text-center border-r border-slate-100 font-calibri text-xs ${
                            qty > 0 && client.delivered
                              ? "bg-slate-50 text-slate-400 line-through font-medium"
                              : qty > 0
                              ? "bg-blue-50/45 font-semibold text-blue-800"
                              : "text-slate-300"
                          }`}
                        >
                          {qty > 0 ? qty.toLocaleString() : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              
              {/* Summary Bottom Row (Total Bultos for currently listed products & clients) */}
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-t-slate-200">
                <td className="p-3 font-bold border-r border-slate-200 shadow-sm sticky left-0 z-10 bg-slate-100">
                  TOTAL BULTOS
                </td>
                <td className="p-3 text-right border-r border-slate-100 text-slate-900 font-calibri font-extrabold bg-slate-100/80">
                  {rowMetricsAndTotals.grandTotalPacks > 0 ? rowMetricsAndTotals.grandTotalPacks.toLocaleString() : "0"}
                </td>
                <td className="p-3 text-right border-r border-slate-100 text-slate-900 font-calibri font-extrabold bg-slate-100/80">
                  {rowMetricsAndTotals.grandTotalPalets > 0 ? parseFloat(rowMetricsAndTotals.grandTotalPalets.toFixed(2)).toLocaleString() : "0"}
                </td>
                <td className="p-3 text-right border-r border-slate-200 bg-slate-100 font-calibri text-slate-400">
                  -
                </td>
                {filteredClients.map((client) => {
                  const bultosSum = filteredTotals[client.name] || 0;
                  return (
                    <td
                      key={`total-${client.id}`}
                      className={`p-3 text-center border-r border-slate-100 font-calibri font-black ${
                        client.delivered
                          ? "bg-slate-100 text-slate-400 line-through"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      {bultosSum > 0 ? `${bultosSum.toLocaleString()} B` : "0 B"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
