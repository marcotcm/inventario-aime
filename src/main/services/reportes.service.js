import { BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs'; // NPM INSTALL EXCELJS

export const reportesService = {
  exportar: async (formato, tipoReporte, data, dateRange, chartImageStr = '') => {
    const defaultName = `Reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}`;

    // Filtrar los datos estrictamente por el rango de fechas (Solo para historiales)
    let dataToExport = data;
    if (dateRange && dateRange.desde !== 'Actual' && (tipoReporte === 'HISTORIAL_ENTRADAS' || tipoReporte === 'HISTORIAL_SALIDAS')) {
      const startDate = new Date(dateRange.desde + 'T00:00:00');
      const endDate = new Date(dateRange.hasta + 'T23:59:59');
      
      dataToExport = data.filter(row => {
         if(!row.Fecha) return true;
         // Asumiendo formato DD-MM-YYYY (o ajusta según tu formato)
         // Para este ejemplo, si viene YYYY-MM-DD
         const rowDate = new Date(row.Fecha + 'T12:00:00'); 
         return rowDate >= startDate && rowDate <= endDate;
      });
    }

    if (formato === 'EXCEL') {
      return await exportarExcel(defaultName, tipoReporte, dataToExport, dateRange, chartImageStr);
    } else if (formato === 'PDF') {
      return await exportarPDF(defaultName, tipoReporte, dataToExport, dateRange, chartImageStr);
    }
  }
};

async function exportarExcel(defaultName, tipoReporte, data, dateRange, chartImageStr) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Exportar Reporte a Excel',
    defaultPath: `${defaultName}.xlsx`,
    filters: [{ name: 'Archivo Excel', extensions: ['xlsx'] }]
  });

  if (canceled || !filePath) return { exported: false };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PDVSA Petrobozcan';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Reporte');

  // Estilo General (Sin cuadrícula de fondo)
  worksheet.views = [{ showGridLines: false }];

  // Encabezados del Documento
  worksheet.mergeCells('A1', 'E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `REPORTE: ${tipoReporte.replace(/_/g, ' ')}`;
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFD32F2F' } }; // Rojo PDVSA
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.mergeCells('A2', 'E2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = `RANGO: ${dateRange.desde} hasta ${dateRange.hasta}`;
  metaCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.addRow([]); // Fila 3 vacía

  let startDataRow = 4;

  // Insertar Gráfico si existe
  if (chartImageStr && chartImageStr.startsWith('data:image')) {
     try {
       const base64Data = chartImageStr.replace(/^data:image\/\w+;base64,/, "");
       const imageId = workbook.addImage({
         base64: base64Data,
         extension: 'png',
       });
       // El gráfico ocupará desde la fila 4 hasta la 18
       worksheet.addImage(imageId, {
         tl: { col: 0, row: 3 },
         ext: { width: 600, height: 250 }
       });
       startDataRow = 20; // Los datos empezarán después del gráfico
     } catch (e) {
       console.error("Error insertando imagen en Excel:", e);
     }
  }

  // Título de la tabla
  const tableTitleRow = worksheet.getRow(startDataRow);
  worksheet.mergeCells(`A${startDataRow}`, `E${startDataRow}`);
  tableTitleRow.getCell(1).value = 'DETALLE DE REGISTROS';
  tableTitleRow.getCell(1).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  tableTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  tableTitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  tableTitleRow.height = 25;

  startDataRow++;

  if (data.length > 0) {
    // Definir Columnas y Anchos
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((h) => {
       let maxLen = h.length;
       data.forEach(row => {
          if(row[h]) {
             const len = String(row[h]).length;
             if (len > maxLen) maxLen = len;
          }
       });
       return {
          header: h.toUpperCase(),
          key: h,
          width: Math.min(Math.max(maxLen + 5, 12), 40) // Min 12, Max 40
       };
    });

    // Restaurar cabeceras en la fila correcta
    const headerRow = worksheet.getRow(startDataRow);
    headerRow.values = headers.map(h => h.toUpperCase());
    
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      cell.border = { 
          top: { style: 'medium', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'medium', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 20;

    // Agregar Datos
    data.forEach((row, index) => {
      const dataRow = worksheet.addRow(row);
      const isEven = index % 2 === 0;
      
      dataRow.eachCell((cell) => {
        // Filas alternas (Cebreado)
        cell.fill = { 
           type: 'pattern', 
           pattern: 'solid', 
           fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF1F5F9' } 
        };
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E293B' } };
        cell.border = { 
           bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
           left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
           right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        
        // Alinear números a la derecha, textos a la izquierda
        if (typeof cell.value === 'number') {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
    });

  } else {
    worksheet.addRow(['No hay datos para este reporte en el rango de fechas seleccionado.']);
  }

  await workbook.xlsx.writeFile(filePath);
  return { exported: true, filePath };
}

async function exportarPDF(defaultName, tipoReporte, data, dateRange, chartImageStr) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar Reporte PDF',
    defaultPath: `${defaultName}.pdf`,
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return { exported: false };

  // Incrustar el gráfico si existe
  const chartHtml = chartImageStr 
    ? `<div class="chart-wrapper"><img src="${chartImageStr}" alt="Gráfico del reporte" /></div>` 
    : '';

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; margin: 0; }
        .header { border-bottom: 4px solid #D32F2F; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo-title { display: flex; flex-direction: column; }
        .logo { color: #D32F2F; font-size: 28px; font-weight: 900; margin-bottom: 4px; letter-spacing: 1px;}
        .title { font-size: 18px; font-weight: 800; color: #0F172A; text-transform: uppercase; }
        .meta { color: #475569; font-size: 11px; text-align: right; line-height: 1.5; }
        
        .chart-wrapper { text-align: center; margin-bottom: 30px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; }
        .chart-wrapper img { max-width: 100%; height: auto; max-height: 350px; }
        
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
        th { background-color: #334155; color: #F8FAFC; padding: 10px 12px; text-align: left; font-weight: 700; text-transform: uppercase; border: 1px solid #334155; }
        td { padding: 10px 12px; border: 1px solid #E2E8F0; color: #1E293B; vertical-align: middle; }
        tr:nth-child(even) td { background-color: #F8FAFC; }
        
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #64748B; border-top: 1px solid #CBD5E1; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-title">
          <div class="logo">❖ PDVSA</div>
          <div class="title">REPORTE: ${tipoReporte.replace(/_/g, ' ')}</div>
        </div>
        <div class="meta">
          <strong>Rango Evaluado:</strong> ${dateRange.desde} al ${dateRange.hasta}<br/>
          <strong>Fecha Emisión:</strong> ${new Date().toLocaleString()}
        </div>
      </div>
      
      ${chartHtml}

      <table>
        <thead>
          <tr>${data.length > 0 ? Object.keys(data[0]).map(k => `<th>${k}</th>`).join('') : '<th>DATOS</th>'}</tr>
        </thead>
        <tbody>
          ${data.length > 0 
            ? data.map(row => `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`).join('') 
            : '<tr><td style="text-align: center; padding: 20px; font-weight: bold; color: #D32F2F;">No hay datos registrados en el rango de fechas seleccionado.</td></tr>'
          }
        </tbody>
      </table>

      <div class="footer">
        Sistema de Gestión de Inventario - PDVSA Petróleos de Venezuela, S.A. (Petrobozcan) - Módulo de Reportes
      </div>
    </body>
    </html>
  `;

  const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlTemplate)}`);
  
  const pdfBuffer = await win.webContents.printToPDF({ 
    printBackground: true, 
    marginsType: 0, 
    pageSize: 'A4',
    landscape: true 
  });
  
  fs.writeFileSync(filePath, pdfBuffer);
  win.close();

  return { exported: true, filePath };
}