import React from 'react';
import styles from '../../pages/Reports/Reports.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, AreaChart, Area } from 'recharts';

const CHART_COLORS = ['#D32F2F', '#2C3E50', '#27AE60', '#F59E0B', '#8B5CF6', '#0284C7'];

export const TopUsadosView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.Cantidad - a.Cantidad);

  return (
    <>
      <div id="report-chart-container" className={styles.chartContainer}>
        <div className={styles.chartTitle}>Top 5 Materiales Más Solicitados (Egresados)</div>
        <div style={{ width: '100%', maxWidth: '650px', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis dataKey="Material" type="category" tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }} width={140} />
              <Tooltip cursor={{fill: 'var(--hover-bg)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Bar dataKey="Cantidad" radius={[0, 4, 4, 0]} barSize={20}>
                {sortedData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla (Oculta en PDF, se exporta como datos crudos) */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead><tr><th>CÓDIGO</th><th>DESCRIPCIÓN DEL MATERIAL</th><th>CATEGORÍA</th><th>CANTIDAD EGRESADA</th></tr></thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx}>
                <td style={{fontWeight:'600', color: 'var(--text-primary)'}}>{row.Codigo}</td>
                <td>{row.Material}</td>
                <td>{row.Categoria}</td>
                <td style={{fontWeight:'800', color:'var(--pdvsa-red)'}}>{row.Cantidad} UND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const BajoStockView = ({ data }) => {
  const criticalData = data.filter(d => d.Stock <= d.Minimo).sort((a, b) => a.Stock - b.Stock);

  return (
    <>
      <div id="report-chart-container" className={styles.chartContainer}>
        <div className={styles.chartTitle}>Comparativa: Stock Actual vs Mínimo Ideal</div>
        <div style={{ width: '100%', maxWidth: '700px', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={criticalData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="Material" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip cursor={{fill: 'var(--hover-bg)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, marginTop: '10px' }} />
              <Bar dataKey="Stock" fill="#D32F2F" name="Stock Actual" radius={[4, 4, 0, 0]} barSize={25} />
              <Bar dataKey="Minimo" fill="#F59E0B" name="Stock Mínimo Ideal" radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead><tr><th>CÓDIGO</th><th>DESCRIPCIÓN DEL MATERIAL</th><th>UBICACIÓN</th><th>STOCK ACTUAL</th><th>MÍNIMO</th><th>ESTADO</th></tr></thead>
          <tbody>
            {criticalData.map((row, idx) => (
              <tr key={idx}>
                <td style={{fontWeight:'600', color: 'var(--text-primary)'}}>{row.Codigo}</td>
                <td>{row.Material}</td>
                <td>{row.Ubicacion}</td>
                <td style={{fontWeight:'800', color: '#D32F2F'}}>{row.Stock}</td>
                <td style={{fontWeight:'600', color: '#F59E0B'}}>{row.Minimo}</td>
                <td><span className={styles.badgeCritical}>Crítico</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const HistorialEntradasView = ({ data, chartData }) => (
  <>
    <div id="report-chart-container" className={styles.chartContainer}>
      <div className={styles.chartTitle}>Volumen de Entradas Diarias</div>
      <div style={{ width: '100%', maxWidth: '800px', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27AE60" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#27AE60" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="fecha" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: 'var(--text-secondary)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
            <Area type="monotone" dataKey="cantidad" stroke="#27AE60" strokeWidth={3} fill="url(#colorIn)" name="Unidades Ingresadas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead><tr><th>FECHA</th><th>CÓDIGO</th><th>MATERIAL</th><th>CANTIDAD</th><th>PROVEEDOR</th><th>FACTURA</th></tr></thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.Fecha}</td>
              <td style={{fontWeight:'600'}}>{row.Codigo}</td>
              <td>{row.Material}</td>
              <td style={{fontWeight:'800', color:'#27AE60'}}>+ {row.Cantidad}</td>
              <td>{row.Proveedor}</td>
              <td>{row.Factura}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export const HistorialSalidasView = ({ data, chartData }) => (
  <>
    <div id="report-chart-container" className={styles.chartContainer}>
      <div className={styles.chartTitle}>Volumen de Salidas (Egresos) Diarias</div>
      <div style={{ width: '100%', maxWidth: '800px', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <defs>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="fecha" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: 'var(--text-secondary)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
            <Area type="monotone" dataKey="cantidad" stroke="#D32F2F" strokeWidth={3} fill="url(#colorOut)" name="Unidades Retiradas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead><tr><th>FECHA</th><th>CÓDIGO</th><th>MATERIAL</th><th>CANTIDAD</th><th>TRABAJADOR / ÁREA</th></tr></thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.Fecha}</td>
              <td style={{fontWeight:'600'}}>{row.Codigo}</td>
              <td>{row.Material}</td>
              <td style={{fontWeight:'800', color:'#D32F2F'}}>- {row.Cantidad}</td>
              <td>{row.Trabajador}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export const InventarioGeneralView = ({ data, chartData }) => (
  <>
    <div id="report-chart-container" className={styles.chartContainer}>
      <div className={styles.chartTitle}>Resumen de Stock por Categoría (Actual)</div>
      <div style={{ width: '100%', maxWidth: '600px', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="categoria" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-secondary)' }} />
            <Tooltip cursor={{fill: 'var(--hover-bg)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
            <Bar dataKey="totalStock" fill="#2C3E50" name="Total Unidades" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead><tr><th>CÓDIGO</th><th>MATERIAL</th><th>CATEGORÍA</th><th>ALMACÉN</th><th>STOCK</th><th>ESTADO</th></tr></thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td style={{fontWeight:'600'}}>{row.Codigo}</td>
              <td>{row.Material}</td>
              <td>{row.Categoria}</td>
              <td>{row.Ubicacion}</td>
              <td style={{fontWeight:'800'}}>{row.Stock}</td>
              <td>
                <span className={row.Estado === 'Stock OK' ? styles.badgeOk : styles.badgeCritical}>
                  {row.Estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);