import { ParsedSheetData, Client, ProductRow } from "../types";

// Helper to clean up numbers
export function parseNumberString(val: string): number {
  if (!val) return 0;
  // Google Sheets clean number string (decimals/thousands)
  // Remove periods if they look like thousands separators in Spanish, e.g., 12.140 -> 12140
  // Or commas e.g. 12,140
  let cleaned = val.trim().replace(/\s/g, "");
  
  // If number formatted like "12.140" or "7.600" (Argentine or European thousands)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "");
  } else if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, "");
  } else {
    // Standard replacement
    cleaned = cleaned.replace(/,/g, ".");
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Default/mock data matching the screenshot exactly
export const DEFAULT_SHEET_DATA: ParsedSheetData = {
  activeUrl: "https://docs.google.com/spreadsheets/d/1YMmd2Ug93UtRUNsEvqcXNRLw-zmOfcXTKxuRH4K0KJw/edit?gid=0#gid=0",
  totalDevoluciones: 142, // Default mock returns for logistica
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
    },
    {
      id: "prod_4",
      name: "RUMIPAL COLA 2250 CC X6",
      packs: 652,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 80, "CRF AZUL": 40, "YUNTA MENDOZA": 40, "OLIVO": 40, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_5",
      name: "RUMIPAL NARANJA 2250 CC X6",
      packs: 562,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 80, "CRF AZUL": 40, "YUNTA MENDOZA": 40, "OLIVO": 20, "CIPRIANO": 20, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_6",
      name: "RUMIPAL POMELO 2250 CC X6",
      packs: 402,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 0, "CRF AZUL": 0, "YUNTA MENDOZA": 0, "OLIVO": 20, "CIPRIANO": 20, "HEAVY? 14?": 0, "OFERTON": 80 }
    },
    {
      id: "prod_7",
      name: "RUMIPAL LIMON 2250 CC X6",
      packs: 342,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 0, "CRF AZUL": 0, "YUNTA MENDOZA": 0, "OLIVO": 20, "CIPRIANO": 40, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_8",
      name: "RUMIPAL LIMA LIMON 2250 CC X6",
      packs: 662,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 80, "CRF AZUL": 40, "YUNTA MENDOZA": 0, "OLIVO": 20, "CIPRIANO": 20, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_9",
      name: "RUMIPAL SODA 500 CC X9",
      packs: 20,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 0, "CRF AZUL": 0, "YUNTA MENDOZA": 0, "OLIVO": 0, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_10",
      name: "RUMIPAL SODA 1500 CC X6",
      packs: 550,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 0, "CRF AZUL": 0, "YUNTA MENDOZA": 0, "OLIVO": 0, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_11",
      name: "RUMIPAL AGUA 500 CC X9",
      packs: 2650,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 720, "CRF GODOY CRUZ": 180, "CRF AZUL": 180, "YUNTA MENDOZA": 0, "OLIVO": 30, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 360 }
    },
    {
      id: "prod_12",
      name: "RUMIPAL TONICA 1500 CC X6",
      packs: 781,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 110, "CRF AZUL": 55, "YUNTA MENDOZA": 0, "OLIVO": 0, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_13",
      name: "RUMIPAL POMELO POMELO 1500 CC X6",
      packs: 275,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 110, "CRF AZUL": 55, "YUNTA MENDOZA": 0, "OLIVO": 0, "CIPRIANO": 0, "HEAVY? 14?": 0, "OFERTON": 0 }
    },
    {
      id: "prod_14",
      name: "POMELO POMELO 500 CC X9",
      packs: 0,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_15",
      name: "INDIAN TONIC 500 CC X9",
      packs: 0,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_16",
      name: "CITRUS CITRUS 1500 CC X6",
      packs: 572,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "OLIVO": 22 }
    },
    {
      id: "prod_17",
      name: "RUMIPAL AGUA SAB. NARANJA 9X500 CC",
      packs: 180,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_18",
      name: "RUMIPAL AGUA SAB. NARANJA 6X1500 CC",
      packs: 1025,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_19",
      name: "RUMIPAL AGUA SAB. MANZANA 6X1500 CC",
      packs: 1350,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "OFERTON": 100 }
    },
    {
      id: "prod_20",
      name: "RUMIPAL AGUA SAB. POMELO 9X500 CC",
      packs: 180,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_21",
      name: "RUMIPAL AGUA SAB. POMELO 6X1500 CC",
      packs: 1050,
      palets: 0,
      stockFinal: 0,
      clientQuantities: {}
    },
    {
      id: "prod_22",
      name: "AGUA BIDON DESCARTABLE 6 L.",
      packs: 12140,
      palets: 0,
      stockFinal: 0,
      clientQuantities: { "GARZA": 0, "CRF GODOY CRUZ": 432, "CRF AZUL": 144, "YUNTA MENDOZA": 144, "OLIVO": 0, "CIPRIANO": 0, "OFERTON": 2160 }
    }
  ]
};

// TSV Parser function
export function parseTSV(tsvText: string, activeUrl: string): ParsedSheetData {
  if (!tsvText || tsvText.trim() === "") {
    throw new Error("El archivo TSV está vacío.");
  }

  // Split lines
  const rawLines = tsvText.split(/\r?\n/);
  const rows = rawLines.map(line => line.split("\t"));

  if (rows.length < 4) {
    throw new Error("Estructura de planilla incorrecta. Debe contener al menos las filas de Carga, Entrega, Transporte y Producto.");
  }

  const cargaRow = rows[0];
  const entregaRow = rows[1];
  const transporteRow = rows[2];
  const headerRow = rows[3];

  // A4: PRODUCTO, B4: packs, C4: PALETS, D4: STOCK FINAL (or similar columns)
  // Let's identify clients starting from the column where the row 0/1/2 or 4 represents a client
  // The first 4 columns correspond to "PRODUCTO", "packs", "PALETS", "STOCK FINAL"
  // Let's scan available client columns. Any column from E (index 4) onwards
  const clients: Client[] = [];
  const maxCols = Math.max(cargaRow.length, entregaRow.length, transporteRow.length, headerRow.length);

  for (let c = 4; c < maxCols; c++) {
    const clientNameRaw = headerRow[c];
    if (!clientNameRaw || clientNameRaw.trim() === "") {
      continue; // Skip empty client columns
    }
    
    const clientName = clientNameRaw.trim();
    const cargaDay = (cargaRow[c] || "").trim().toUpperCase();
    const entregaDay = (entregaRow[c] || "").trim().toUpperCase();
    const transporte = (transporteRow[c] || "").trim().toUpperCase();

    clients.push({
      id: `client_${c}_${clientName.replace(/\s+/g, "_")}`,
      name: clientName,
      carga: cargaDay || "S/D",
      entrega: entregaDay || "S/D",
      transporte: transporte || "S/D",
      colIndex: c,
      delivered: false // Updated from localStorage in App
    });
  }

  // Parse Products (Row index 4 onwards)
  const products: ProductRow[] = [];
  for (let r = 4; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || !row[0] || row[0].trim() === "") {
      continue; // Skip empty product row
    }

    const productName = row[0].trim();
    // Skip if it is total row or similar
    if (productName.toLowerCase().startsWith("total") || productName.toLowerCase().includes("resumen")) {
      continue;
    }

    const packs = parseNumberString(row[1] || "0");
    const palets = parseNumberString(row[2] || "0");
    const stockFinal = parseNumberString(row[3] || "0");

    const clientQuantities: { [clientName: string]: number } = {};
    clients.forEach(client => {
      const colVal = row[client.colIndex];
      if (colVal && colVal.trim() !== "") {
        const qty = parseNumberString(colVal);
        if (qty > 0) {
          clientQuantities[client.name] = qty;
        }
      }
    });

    products.push({
      id: `prod_${r}_${productName.replace(/\s+/g, "_")}`,
      name: productName,
      packs,
      palets,
      stockFinal,
      clientQuantities
    });
  }

  return {
    clients,
    products,
    activeUrl,
    totalDevoluciones: 0
  };
}

// Function to parse the returned CSV/TSV from Hoja 2 and sum up any numeric values that represent returns
export function parseDevolucionesCSV(csvText: string): number {
  if (!csvText || csvText.trim() === "") return 0;

  // Split lines
  const rawLines = csvText.split(/\r?\n/);
  let totalReturns = 0;

  for (const line of rawLines) {
    if (!line.trim()) continue;
    
    // Split by tab (if TSV) or comma (if standard CSV)
    const cells = line.includes("\t") ? line.split("\t") : line.split(",");
    
    for (const rawCell of cells) {
      const cell = rawCell.trim().replace(/^["']|["']$/g, "").trim();
      if (!cell) continue;

      const parsed = parseNumberString(cell);
      
      // Filter out years (like 2024, 2025, 2026) or standard dates
      if (parsed > 0 && parsed !== 2024 && parsed !== 2025 && parsed !== 2026 && parsed !== 2027) {
        // Confirm it consists of digits (and optional decimals/negative sign)
        const cleanDigitsOnly = cell.replace(/[-+.,\s]/g, "");
        if (/^\d+$/.test(cleanDigitsOnly)) {
          // If the cell value looks like a year (e.g., between 2000 and 2100), skip it
          if (parsed >= 2000 && parsed <= 2100) {
            continue;
          }
          totalReturns += parsed;
        }
      }
    }
  }

  return totalReturns;
}
