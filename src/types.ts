export interface Client {
  id: string; // e.g. client name or unique identifier
  name: string;
  carga: string;         // e.g. "LUNES"
  entrega: string;       // e.g. "MARTES"
  transporte: string;    // e.g. "BARAQUET"
  colIndex: number;      // Column index in TSV
  delivered: boolean;    // Delivered check
}

export interface ProductRow {
  id: string;            // unique identifier
  name: string;
  packs: number;
  palets: number;
  stockFinal: number;
  clientQuantities: { [clientName: string]: number }; // bultos ordered by client
}

export interface ParsedSheetData {
  clients: Client[];
  products: ProductRow[];
  activeUrl: string;
  totalDevoluciones: number;
}

export const DAYS_OF_WEEK = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO"
];
