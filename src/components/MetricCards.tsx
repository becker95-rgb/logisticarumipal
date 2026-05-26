import { Package, Users, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Client, ProductRow } from "../types";

interface MetricCardsProps {
  clients: Client[];
  products: ProductRow[];
  totalDevoluciones: number;
}

export default function MetricCards({ clients, products, totalDevoluciones }: MetricCardsProps) {
  // Aggregate stats
  const totalClients = clients.length;
  const deliveredClients = clients.filter((c) => c.delivered).length;
  const pendingClients = totalClients - deliveredClients;
  
  // Calculate total bultos and delivered bultos
  let totalBultos = 0;
  let deliveredBultos = 0;
  const deliveredNames = new Set(clients.filter((c) => c.delivered).map((c) => c.name));

  products.forEach((prod) => {
    Object.entries(prod.clientQuantities).forEach(([clientName, qty]) => {
      totalBultos += qty;
      if (deliveredNames.has(clientName)) {
        deliveredBultos += qty;
      }
    });
  });

  const deliveredPercent = totalClients > 0 ? Math.round((deliveredClients / totalClients) * 100) : 0;
  const deliveredBultosPercent = totalBultos > 0 ? Math.round((deliveredBultos / totalBultos) * 100) : 0;

  return (
    <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Bultos Card */}
      <div id="metric-card-bultos" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
        <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600 shrink-0">
          <Package className="w-5 h-5 m-auto" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Bultos</span>
          <span className="text-2xl font-extrabold text-slate-900 block tracking-tight leading-none">{totalBultos.toLocaleString()}</span>
          <span className="text-[10px] text-blue-600 font-bold mt-1.5 block">
            Entregados: {deliveredBultos.toLocaleString()} ({deliveredBultosPercent}%)
          </span>
        </div>
      </div>

      {/* Total Clientes Card */}
      <div id="metric-card-clientes" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
        <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0">
          <Users className="w-5 h-5 m-auto" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Clientes Activos</span>
          <span className="text-2xl font-extrabold text-slate-900 block tracking-tight leading-none">{totalClients}</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">columnas procesadas</span>
        </div>
      </div>

      {/* Delivered Check Circle Card */}
      <div id="metric-card-entregados" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
        <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center text-green-600 shrink-0">
          <CheckCircle2 className="w-5 h-5 m-auto" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Entregados</span>
          <span className="text-2xl font-extrabold text-slate-900 block tracking-tight leading-none">
            {deliveredClients} <span className="text-sm font-normal text-slate-400">/ {totalClients} Clt</span>
          </span>
          <div className="text-[10px] text-slate-500 font-bold mt-1.5 flex flex-col gap-0.5">
            <span>Bultos: {deliveredBultos.toLocaleString()} / {totalBultos.toLocaleString()}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${deliveredBultosPercent}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-bold text-green-600 font-mono">{deliveredBultosPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Delivery Clock Card */}
      <div id="metric-card-pendientes" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all border-l-2 border-l-orange-400">
        <div className="w-10 h-10 bg-orange-50 rounded flex items-center justify-center text-orange-600 shrink-0">
          <Clock className="w-5 h-5 m-auto" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pendientes</span>
          <span className="text-2xl font-extrabold text-slate-900 block tracking-tight leading-none">{pendingClients}</span>
          <span className="text-[10px] text-orange-600 font-bold mt-1.5 block">En reparto hoy</span>
        </div>
      </div>

      {/* Devoluciones Card */}
      <div id="metric-card-devoluciones" className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all border-l-2 border-l-purple-400">
        <div className="w-10 h-10 bg-purple-50 rounded flex items-center justify-center text-purple-600 shrink-0">
          <RotateCcw className="w-5 h-5 m-auto" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Devoluciones</span>
          <span className="text-2xl font-extrabold text-purple-700 block tracking-tight leading-none">
            {totalDevoluciones > 0 ? totalDevoluciones.toLocaleString() : "0"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-1.5 block">bultos retornados</span>
        </div>
      </div>
    </div>
  );
}
