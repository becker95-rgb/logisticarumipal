import { ParsedSheetData, Client, ProductRow } from "../types";

// Helper to clean up numbers
export function parseNumberString(val: string): number {
  if (!val) return 0;
  let cleaned = val.trim().replace(/\s/g, "");
  
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "");
  } else if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, "");
  } else {
    cleaned = cleaned.replace(/,/g, ".");
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Default/mock data matching the spreadsheet exactly
export const DEFAULT_SHEET_DATA: ParsedSheetData = {
  activeUrl: "https://docs.google.com/spreadsheets/d/1YMmd2Ug93UtRUNsEvqcXNRLw-zmOfcXTKxuRH4K0KJw/edit?gid=0#gid=0",
  totalDevoluciones: 142, 
  clients: [
    { id: "GARZA", name: "GARZA", carga: "LUNES", entrega: "MARTES", transporte: "BARAQUET", colIndex: 4, delivered: false },
    { id: "CRF_GODOY_CRUZ", name: "CRF GODOY CRUZ", carga: "LUNES", entrega: "LUNES", transporte: "BARAQUET", colIndex: 5, delivered: false },
    { id: "CRF_AZUL", name: "CRF AZUL", carga: "LUNES", entrega: "LUNES", transporte: "BARAQUET", colIndex: 6, delivered: false },
    { id: "YUNTA_MENDOZA", name: "YUNTA MENDOZA", carga: "LUNES", entrega: "LUNES", transporte: "BARAQUET", colIndex: 7, delivered: false },
    { id: "OLIVO", name: "OLIVO", carga: "MARTES", entrega: "JUEVES", transporte: "BARAQUET", colIndex: 8, delivered: false },
    { id: "CIPRIANO", name: "CIPRIANO", carga: "MARTES", entrega: "VIERNES", transporte: "BARAQUET", colIndex: 9, delivered: false },
    { id: "HEAVY_14", name: "HEAVY? 14?", carga: "VIERNES", entrega: "JUEVES", transporte: "BARAQUET", colIndex: 10, delivered: false },
    { id: "OFERTON", name: "OFERTON", carga: "MARTES", entrega: "SABADO", transporte: "BARAQUET", colIndex: 11, delivered: false }
  ],
  products: [
    {
      id: "prod_1",
      name: "RUMIPAL SIFON DESC. 2000CC X6",
      packs: 7600,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 320, "CRF GODOY CRUZ": 0, "CRF AZUL": 160, "YUNTA MENDOZA": 160, "OLIVO": 80, "CIPRIANO": 400, "HEAVY? 14?": 0, "OFERTON": 400 }
    },
    {
      id: "prod_2",
      name: "RUMIPAL SODA 2250 CC X6",
      packs: 560,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 0, "CRF AZUL": 0, "YUNTA MENDOZA": 0, "OLIVO": 0, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_3",
      name: "RUMIPAL AGUA 2000 CC X6",
      packs: 3440,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 1120, "CRF GODOY CRUZ": 80, "CRF AZUL": 80, "YUNTA MENDOZA": 0, "OLIVO": 160, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    }
  ]
};

// TSV Parser function
export function parseTSV(tsvText: string, activeUrl: string): ParsedSheetData {
  if (!tsvText || tsvText.trim() === "") {
    return { ...DEFAULT_SHEET_DATA, activeUrl };
  }

  try {
    const rawLines = tsvText.split(/\r?\n/);
    const rows = rawLines.map(line => line.split("\t"));

    if (rows.length < 5) {
      return { ...DEFAULT_SHEET_DATA, activeUrl };
    }

    // Corrección de índices de fila según la estructura real del Google Sheet
    const cargaRow = rows[0] || [];
    const entregaRow = rows[1] || [];
    const transporteRow = rows[2] || [];
    const productoRowHeaders = rows[3] || [];

    const clients: Client[] = [];
    const startColIndex = 4;

    // 1. Extraer dinámicamente todos los clientes de las columnas superiores
    for (let colIndex = startColIndex; colIndex < productoRowHeaders.length; colIndex++) {
      const clientName = productoRowHeaders[colIndex]?.trim();
      if (clientName && clientName !== "" && clientName !== "TOTAL") {
        clients.push({
          id: clientName.replace(/\s+/g, '_'),
          name: clientName,
          carga: cargaRow[colIndex]?.trim() || "",
          entrega: entregaRow[colIndex]?.trim() || "",
          transporte: transporteRow[colIndex]?.trim() || "",
          colIndex: colIndex,
          delivered: false
        });
      }
    }

    // 2. Procesar las filas de productos
    const products: ProductRow[] = [];
    for (let rowIndex = 4; rowIndex < rows.length; rowIndex++) {
      const currentRow = rows[rowIndex];
      if (!currentRow || currentRow.length === 0) continue;

      const productName = currentRow[0]?.trim();
      if (!productName || productName === "" || productName.toLowerCase().includes("total")) continue;

      const clientQuantities: { [clientName: string]: number } = {};
      
      // Mapear la cantidad que corresponde a cada cliente detectado
      clients.forEach(client => {
        const qtyString = currentRow[client.colIndex];
        clientQuantities[client.name] = qtyString ? parseNumberString(qtyString) : 0;
      });

      products.push({
        id: `prod_${rowIndex}`,
        name: productName,
        packs: parseNumberString(currentRow[1]),
        palets: parseNumberString(currentRow[2]),
        stockFinal: parseNumberString(currentRow[3]),
        clientQuantities: clientQuantities
      });
    }

    return {
      activeUrl,
      totalDevoluciones: 0,
      clients: clients.length > 0 ? clients : DEFAULT_SHEET_DATA.clients,
      products: products.length > 0 ? products : DEFAULT_SHEET_DATA.products
    };

  } catch (error) {
    console.error("Error crítico procesando planilla TSV:", error);
    return { ...DEFAULT_SHEET_DATA, activeUrl };
  }
}

interface ParsedDevolucionesSummary {
  total: number;
  numericCellCount: number;
}

export function parseDevolucionesCSVDetails(tsvText: string): ParsedDevolucionesSummary {
  if (!tsvText || tsvText.trim() === "") return { total: 0, numericCellCount: 0 };
  try {
    const rows = tsvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (rows.length === 0) return { total: 0, numericCellCount: 0 };

    const hasTabDelimiter = rows.some((line) => line.includes("\t"));
    const delimiterRegex = hasTabDelimiter ? /\t/ : /[,;]/;
    const table = rows.map((line) => line.split(delimiterRegex).map((cell) => cell.trim()));

    // Skip header row and sum all numeric values found in the sheet body.
    const dataRows = table.length > 1 ? table.slice(1) : table;

    let total = 0;
    let numericCellCount = 0;
    dataRows.forEach((row) => {
      row.forEach((cell) => {
        if (!cell) return;
        const compact = cell.replace(/\s/g, "");
        const isSimpleNumber = /^-?\d+(?:[.,]\d+)?$/.test(compact);
        const isThousandSeparated = /^-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?$/.test(compact);
        if (!isSimpleNumber && !isThousandSeparated) return;
        numericCellCount += 1;
        total += parseNumberString(cell);
      });
    });

    return { total: Math.round(total), numericCellCount };
  } catch (e) {
    return { total: 0, numericCellCount: 0 };
  }
}

// Devuelve un número entero con las devoluciones parseadas
export function parseDevolucionesCSV(tsvText: string): number {
  return parseDevolucionesCSVDetails(tsvText).total;
}
