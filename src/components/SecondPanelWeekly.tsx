import { useMemo } from "react";
import { CheckSquare, Square, Truck, Calendar, Package, ChevronRight, AlertCircle, ShoppingCart, Clock } from "lucide-react";
import { Client, ProductRow, DAYS_OF_WEEK } from "../types";

interface SecondPanelWeeklyProps {
  clients: Client[];
  products: ProductRow[];
  onToggleDelivered: (clientId: string) => void;
}

export default function SecondPanelWeekly({
  clients,
  products,
  onToggleDelivered,
}: SecondPanelWeeklyProps) {
  
  // Normalize days for robust matching
  const normalizeDay = (dayStr: string): string => {
    return dayStr
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // strip accents
  };

  const daysList = useMemo(() => {
    return DAYS_OF_WEEK.map(d => ({
      key: d,
      normalized: normalizeDay(d),
      displayName: d === "MIERCOLES" ? "MIÉRCOLES" : d === "SABADO" ? "SÁBADO" : d
    }));
  }, []);

  // Compute products and quantities for each client to display clean summaries on the cards
  const clientOrders = useMemo(() => {
    const orders: { [clientName: string]: { productName: string; quantity: number }[] } = {};

    clients.forEach((c) => {
      orders[c.name] = [];
    });

    products.forEach((prod) => {
      Object.entries(prod.clientQuantities).forEach(([clientName, qty]) => {
        if (qty > 0) {
          if (!orders[clientName]) {
            orders[clientName] = [];
          }
          orders[clientName].push({
            productName: prod.name,
            quantity: qty,
          });
        }
      });
    });

    return orders;
  }, [clients, products]);

  // Group clients by their normalized "ENTREGA" day
  const groupedClients = useMemo(() => {
    const groups: { [dayNormalized: string]: Client[] } = {};
    const unassigned: Client[] = [];

    // Initialize groups
    daysList.forEach((d) => {
      groups[d.normalized] = [];
    });

    clients.forEach((client) => {
      const normalizedEntrega = normalizeDay(client.entrega);
      const isKnownDay = daysList.some((d) => d.normalized === normalizedEntrega);

      if (isKnownDay) {
        groups[normalizedEntrega].push(client);
      } else {
        unassigned.push(client);
      }
    });

    return { groups, unassigned };
  }, [clients, daysList]);

  return (
    <div id="second-panel-card" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Panel Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
            <Calendar className="w-4 h-4 m-auto" />
          </div>
          <div>
            <h3 id="panel-2-heading" className="text-md font-bold text-slate-800 tracking-tight">
              Panel 2: Cronograma Semanal y Control de Entregas
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Clientes ordenados cronológicamente por día de entrega con checkbox interactivo.
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Scroll Board */}
      <div className="p-5 overflow-x-auto bg-slate-50/40">
        <div className="flex gap-4 pb-4 min-w-[1200px]">
          {daysList.map((dayObj) => {
            const dayClients = groupedClients.groups[dayObj.normalized] || [];
            const deliveredCount = dayClients.filter((c) => c.delivered).length;

            return (
              <div
                key={dayObj.key}
                id={`kanban-col-${dayObj.key}`}
                className="flex-1 min-w-[280px] max-w-[340px] bg-slate-100/60 rounded-xl p-3 border border-slate-200 flex flex-col h-[600px]"
              >
                {/* Day title */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      {dayObj.displayName}
                    </h4>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-100 font-mono">
                    {deliveredCount}/{dayClients.length}
                  </span>
                </div>

                {/* Clients list for this day */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {dayClients.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-content-center text-slate-400 text-center p-4">
                      <Clock className="w-4 h-4 mb-1 opacity-55" />
                      <span className="text-[10px] font-medium leading-tight">Sin entregas para hoy</span>
                    </div>
                  ) : (
                    dayClients.map((client) => {
                      const items = clientOrders[client.name] || [];
                      const totalBultosForClient = items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <div
                          key={client.id}
                          id={`client-card-${client.id}`}
                          className={`group border rounded-lg p-3 bg-white transition-all duration-300 relative shadow-sm ${
                            client.delivered
                              ? "border-green-200 bg-green-50/10 shadow-none saturate-50 animate-fade-in"
                              : "border-slate-200/85 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5"
                          }`}
                        >
                          {/* Simplified Content info layout for each client */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-bold block uppercase tracking-tight text-slate-900 leading-tight truncate ${
                                  client.delivered ? "line-through text-slate-405" : ""
                                }`}
                                title={client.name}
                              >
                                {client.name}
                              </span>
                              
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded mr-0.5">
                                  <Truck className="w-2.5 h-2.5 mr-0.5 text-blue-500 shrink-0" />
                                  {client.transporte}
                                </span>
                                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-mono">
                                  <Calendar className="w-2.5 h-2.5 mr-0.5 text-slate-500 shrink-0" />
                                  Carga: {client.carga}
                                </span>
                                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-blue-50/50 border border-blue-100/10 text-slate-700 rounded font-sans">
                                  <Package className="w-2.5 h-2.5 mr-0.5 text-blue-500 shrink-0" />
                                  {totalBultosForClient} Bultos
                                </span>
                              </div>
                            </div>

                            {/* DELIVERED CHECKBOX */}
                            <button
                              id={`btn-delivery-check-${client.id}`}
                              onClick={() => onToggleDelivered(client.name)}
                              title={client.delivered ? "Marcar como pendiente" : "Marcar como entregado"}
                              className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                                client.delivered
                                  ? "bg-green-100 hover:bg-green-200 text-green-800"
                                  : "bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200"
                              }`}
                            >
                              {client.delivered ? (
                                <CheckSquare className="w-5 h-5 flex-shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 flex-shrink-0" />
                              )}
                            </button>
                          </div>
                          
                          {client.delivered && (
                            <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] rounded-lg pointer-events-none flex items-center justify-center">
                              <div className="bg-green-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5" /> Entregado
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          {/* Unassigned drawer / OTROS column if any */}
          {groupedClients.unassigned.length > 0 && (
            <div id="kanban-col-unassigned" className="flex-1 min-w-[280px] max-w-[340px] bg-amber-50/30 rounded-xl p-3 border border-amber-200/50 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <h4 className="text-xs font-black text-amber-800 tracking-wider">
                    OTROS / SIN DÍA
                  </h4>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200 font-mono">
                  {groupedClients.unassigned.filter((c) => c.delivered).length}/{groupedClients.unassigned.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {groupedClients.unassigned.map((client) => {
                  const items = clientOrders[client.name] || [];
                  const totalBultosForClient = items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div
                      key={client.id}
                      className={`relative border rounded-lg p-3 bg-white transition-all shadow-sm ${
                        client.delivered 
                          ? "border-green-200 bg-green-50/10 shadow-none saturate-50 animate-fade-in" 
                          : "border-slate-200/85 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-bold block uppercase tracking-tight text-slate-905 truncate ${client.delivered ? "line-through text-slate-400" : ""}`} title={client.name}>
                            {client.name}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded mr-0.5">
                              <Truck className="w-2.5 h-2.5 mr-0.5 text-blue-500 shrink-0" />
                              {client.transporte}
                            </span>
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-mono">
                              <Calendar className="w-2.5 h-2.5 mr-0.5 text-slate-500 shrink-0" />
                              Carga: {client.carga}
                            </span>
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-blue-50/50 border border-blue-100/10 text-slate-700 rounded font-sans">
                              <Package className="w-2.5 h-2.5 mr-0.5 text-blue-500 shrink-0" />
                              {totalBultosForClient} Bultos
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleDelivered(client.name)}
                          className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                            client.delivered
                              ? "bg-green-100 hover:bg-green-200 text-green-800"
                              : "bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200"
                          }`}
                        >
                          {client.delivered ? <CheckSquare className="w-5 h-5 flex-shrink-0" /> : <Square className="w-5 h-5 flex-shrink-0" />}
                        </button>
                      </div>

                      {client.delivered && (
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] rounded-lg pointer-events-none flex items-center justify-center">
                          <div className="bg-green-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" /> Entregado
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
