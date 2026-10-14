import { useState } from 'react';

export const useReportExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Pasamos el ID del contenedor del gráfico como parámetro opcional
  const exportReport = async (formato, tipoReporte, data, dateRange, chartElementId = 'report-chart-container') => {
    if (!window.api?.reportes) {
      alert("Error: La API de reportes no está conectada.");
      return;
    }

    try {
      setIsExporting(true);
      
      let chartImageStr = '';
      
      // Capturar el gráfico en Base64 si existe en la pantalla
      if (chartElementId) {
          const svgElement = document.querySelector(`#${chartElementId} .recharts-surface`);
          if (svgElement) {
              const clone = svgElement.cloneNode(true);
              // Forzamos fondo blanco transparente por si acaso
              clone.style.backgroundColor = '#FFFFFF';
              const xml = new XMLSerializer().serializeToString(clone);
              const svg64 = btoa(unescape(encodeURIComponent(xml)));
              chartImageStr = `data:image/svg+xml;base64,${svg64}`;
          }
      }

      // Enviamos el Base64 al backend (sirve para PDF y EXCEL)
      const res = await window.api.reportes.exportar({ formato, tipoReporte, data, dateRange, chartImageStr });
      
      if (res.exported) {
        alert(`Reporte ${formato} exportado exitosamente en:\n${res.filePath}`);
      }
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportReport, isExporting };
};