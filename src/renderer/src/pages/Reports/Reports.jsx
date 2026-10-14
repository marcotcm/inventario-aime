import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { useReportExport } from '../../hooks/useReportExport';
import { 
  TopUsadosView, BajoStockView, HistorialEntradasView, 
  HistorialSalidasView, InventarioGeneralView 
} from '../../components/viewreportes/ReportViews';
import styles from './Reports.module.css';
import { MdOutput, MdInput, MdWarning, MdStarRate, MdPictureAsPdf, MdTableView, MdDashboard } from 'react-icons/md';

const generateContinuousDateRange = (startDateStr, endDateStr) => {
  const dates = [];
  let currentDate = new Date(startDateStr + 'T00:00:00');
  const endDate = new Date(endDateStr + 'T00:00:00');

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('TOP_USADOS');
  const [dateRange, setDateRange] = useState({ desde: '2026-10-01', hasta: '2026-10-15' });
  const { exportReport, isExporting } = useReportExport();

  const isRealTimeReport = activeTab === 'INVENTARIO' || activeTab === 'BAJO_STOCK';

  // --- DATOS SIMULADOS ---
  const mockDataTopUsados = [
    { Codigo: 'PM-0001', Material: 'Tubería de Acero 6"x6m', Categoria: 'Tubería', Cantidad: 310 },
    { Codigo: 'PM-0041', Material: 'Electrodos KG', Categoria: 'Soldadura', Cantidad: 205 },
    { Codigo: 'PM-0021', Material: 'Casco EPP', Categoria: 'EPP', Cantidad: 120 },
    { Codigo: 'PM-0005', Material: 'Válvula 4" ANSI', Categoria: 'Válvulas', Cantidad: 85 },
    { Codigo: 'PM-0033', Material: 'Lubricante LTR', Categoria: 'Fluidos', Cantidad: 75 },
    { Codigo: 'PM-0012', Material: 'Junta Espiralada', Categoria: 'Conexiones', Cantidad: 40 },
  ];

  const mockDataBajoStock = [
    { Codigo: 'PM-0005', Material: 'Válvula de Compuerta', Ubicacion: 'Almacén B', Stock: 3, Minimo: 5 },
    { Codigo: 'PM-0033', Material: 'Lubricante Multigrado', Ubicacion: 'Almacén B', Stock: 2, Minimo: 5 },
    { Codigo: 'PM-0052', Material: 'Grasa Litio', Ubicacion: 'Almacén A', Stock: 15, Minimo: 40 },
    { Codigo: 'PM-0060', Material: 'Tirro de Seguridad', Ubicacion: 'Almacén C', Stock: 0, Minimo: 10 },
  ];

  const mockDataEntradas = [
    { Fecha: '2026-10-02', Codigo: 'PM-0001', Material: 'Tubería de Acero', Cantidad: 300, Proveedor: 'Aceros Monagas', Factura: 'F-00928' },
    { Fecha: '2026-10-06', Codigo: 'PM-0012', Material: 'Empacadura 4"', Cantidad: 100, Proveedor: 'Conexiones Nac.', Factura: 'FA-771' },
    { Fecha: '2026-10-14', Codigo: 'PM-0041', Material: 'Electrodos KG', Cantidad: 50, Proveedor: 'Soldafacil', Factura: 'SF-312' },
  ];
  
  const mockDataSalidas = [
    { Fecha: '2026-10-03', Codigo: 'PM-0005', Material: 'Válvula 4"', Cantidad: 10, Trabajador: 'Ing. Carlos Mendoza (Pozo B-21)' },
    { Fecha: '2026-10-08', Codigo: 'PM-0021', Material: 'Casco EPP', Cantidad: 5, Trabajador: 'Sup. Juan García (Taller Central)' },
    { Fecha: '2026-10-14', Codigo: 'PM-0033', Material: 'Lubricante LTR', Cantidad: 20, Trabajador: 'Mnto. Luis Flores (Planta de Gas)' },
    { Fecha: '2026-10-15', Codigo: 'PM-0041', Material: 'Electrodos KG', Cantidad: 15, Trabajador: 'Ing. Carlos Mendoza (Pozo B-21)' },
  ];

  const mockDataInventario = [
    { Codigo: 'PM-0001', Material: 'Tubería 6"x6m', Categoria: 'Tubería', Ubicacion: 'Almacén A', Stock: 450, Estado: 'Stock OK' },
    { Codigo: 'PM-0005', Material: 'Válvula 4"', Categoria: 'Válvulas', Ubicacion: 'Almacén B', Stock: 3, Estado: 'Crítico' },
    { Codigo: 'PM-0021', Material: 'Casco EPP', Categoria: 'EPP', Ubicacion: 'Almacén C', Stock: 310, Estado: 'Stock OK' },
    { Codigo: 'PM-0012', Material: 'Empacadura Espiralada', Categoria: 'Conexiones', Ubicacion: 'Almacén A', Stock: 850, Estado: 'Stock OK' },
    { Codigo: 'PM-0033', Material: 'Lubricante LTR', Categoria: 'Fluidos', Ubicacion: 'Almacén B', Stock: 2, Estado: 'Crítico' },
  ];

  const dateRangeArray = generateContinuousDateRange(dateRange.desde, dateRange.hasta);

  const chartDataEntradas = dateRangeArray.map(dateStr => {
    const entradasDelDia = mockDataEntradas.filter(e => e.Fecha === dateStr);
    const totalQty = entradasDelDia.reduce((sum, e) => sum + e.Cantidad, 0);
    return { fecha: dateStr.substring(5), cantidad: totalQty }; 
  });

  const chartDataSalidas = dateRangeArray.map(dateStr => {
    const salidasDelDia = mockDataSalidas.filter(e => e.Fecha === dateStr);
    const totalQty = salidasDelDia.reduce((sum, e) => sum + e.Cantidad, 0);
    return { fecha: dateStr.substring(5), cantidad: totalQty };
  });

  const chartDataInventario = [
    { categoria: 'Tubería', totalStock: 450 }, { categoria: 'Válvulas', totalStock: 3 }, { categoria: 'EPP', totalStock: 310 }, { categoria: 'Conexiones', totalStock: 850 }, { categoria: 'Fluidos', totalStock: 2 }
  ];

  const getReportTitle = () => {
    switch(activeTab) {
      case 'TOP_USADOS': return 'TOP MATERIALES MÁS SOLICITADOS';
      case 'BAJO_STOCK': return 'MATERIALES EN ESTADO CRÍTICO (BAJO STOCK)';
      case 'HISTORIAL_ENTRADAS': return 'HISTORIAL GENERAL DE ENTRADAS';
      case 'HISTORIAL_SALIDAS': return 'HISTORIAL GENERAL DE SALIDAS';
      case 'INVENTARIO': return 'INVENTARIO GENERAL ACTUALIZADO';
      default: return 'REPORTE SELECCIONADO';
    }
  };

  const handleExport = (formato) => {
    let dataToExport = [];
    if (activeTab === 'TOP_USADOS') dataToExport = mockDataTopUsados;
    if (activeTab === 'BAJO_STOCK') dataToExport = mockDataBajoStock;
    if (activeTab === 'HISTORIAL_ENTRADAS') dataToExport = mockDataEntradas;
    if (activeTab === 'HISTORIAL_SALIDAS') dataToExport = mockDataSalidas;
    if (activeTab === 'INVENTARIO') dataToExport = mockDataInventario;
    
    const rangoReporte = isRealTimeReport 
      ? { desde: 'Actual', hasta: 'En Tiempo Real' }
      : dateRange;

    // Pasamos el ID del contenedor del gráfico
    exportReport(formato, activeTab, dataToExport, rangoReporte, 'report-chart-container');
  };

  return (
    <MainLayout>
      <div className={styles.controlPanel}>
        <div className={styles.sectionBlock}>
          <div className={styles.label}><span>Seleccionar Tipo de Reporte</span><span>▼</span></div>
          <div className={styles.typeSelector}>
            <button className={`${styles.typeBtn} ${activeTab === 'HISTORIAL_SALIDAS' ? styles.activeType : ''}`} onClick={() => setActiveTab('HISTORIAL_SALIDAS')}>
              <MdOutput size={20} /> Historial de<br/>Salidas
            </button>
            <button className={`${styles.typeBtn} ${activeTab === 'HISTORIAL_ENTRADAS' ? styles.activeType : ''}`} onClick={() => setActiveTab('HISTORIAL_ENTRADAS')}>
              <MdInput size={20} /> Historial de<br/>Entradas
            </button>
            <button className={`${styles.typeBtn} ${activeTab === 'INVENTARIO' ? styles.activeType : ''}`} onClick={() => setActiveTab('INVENTARIO')}>
              <MdDashboard size={20} /> Inventario<br/>General
            </button>
            <button className={`${styles.typeBtn} ${activeTab === 'BAJO_STOCK' ? styles.activeType : ''}`} onClick={() => setActiveTab('BAJO_STOCK')}>
              <MdWarning size={20} /> Materiales en<br/>Bajo Stock
            </button>
            <button className={`${styles.typeBtn} ${activeTab === 'TOP_USADOS' ? styles.activeType : ''}`} onClick={() => setActiveTab('TOP_USADOS')}>
              <MdStarRate size={20} /> Top Materiales<br/>Más Usados
            </button>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.label}>Filtro de Tiempo (Rango de Fechas)</div>
          {isRealTimeReport ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 15px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
              <MdWarning size={16} style={{marginRight: '6px'}}/> El rango de fechas está deshabilitado. Este reporte muestra los datos de inventario en estado actual.
            </div>
          ) : (
            <div className={styles.dateInputs}>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>Desde</span>
                <input type="date" className={styles.dateInput} value={dateRange.desde} onChange={e => setDateRange({...dateRange, desde: e.target.value})} />
              </div>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>Hasta</span>
                <input type="date" className={styles.dateInput} value={dateRange.hasta} onChange={e => setDateRange({...dateRange, hasta: e.target.value})} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.actionBlock}>
          <button className={styles.btnGenerate} disabled={isExporting}>
            <MdStarRate size={16} /> Generar Vista Previa
          </button>
          <div className={styles.exportGroup}>
            <button className={styles.btnExport} onClick={() => handleExport('PDF')} disabled={isExporting}>
              <MdPictureAsPdf size={16} color="#DC2626" /> Exportar PDF
            </button>
            <button className={styles.btnExport} onClick={() => handleExport('EXCEL')} disabled={isExporting}>
              <MdTableView size={16} color="#16A34A" /> Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          VISTA PREVIA DINÁMICA DE REPORTE: {getReportTitle()} {isRealTimeReport ? '(AL INSTANTE)' : ''}
        </div>
        
        {activeTab === 'TOP_USADOS' && <TopUsadosView data={mockDataTopUsados} />}
        {activeTab === 'BAJO_STOCK' && <BajoStockView data={mockDataBajoStock} />}
        {activeTab === 'HISTORIAL_ENTRADAS' && <HistorialEntradasView data={mockDataEntradas} chartData={chartDataEntradas} />}
        {activeTab === 'HISTORIAL_SALIDAS' && <HistorialSalidasView data={mockDataSalidas} chartData={chartDataSalidas} />}
        {activeTab === 'INVENTARIO' && <InventarioGeneralView data={mockDataInventario} chartData={chartDataInventario} />}

      </div>
    </MainLayout>
  );
};