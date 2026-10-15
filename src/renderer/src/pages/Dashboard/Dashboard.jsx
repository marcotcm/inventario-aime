import { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { DataCard } from '../../components/DataCard/DataCard';
import styles from './Dashboard.module.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MdLandscape, MdArrowUpward, MdArrowDownward, MdWarningAmber } from 'react-icons/md';

const STATUS_COLORS = {
  'Stock OK': '#22c55e',
  Crítico: '#f59e0b',
  'Sin stock': '#ef4444'
};

const formatNumber = (value) => new Intl.NumberFormat('es-VE').format(value ?? 0);

const formatDate = (dateTime) => {
  if (!dateTime) return '—';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return dateTime;
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.api.dashboard
      .obtenerResumen()
      .then((response) => {
        if (!response.ok) throw new Error(response.error || 'No se pudo obtener el resumen');
        setSummary(response.data);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const inventoryStatus = (summary?.inventoryStatus ?? []).map((item) => ({
    ...item,
    color: STATUS_COLORS[item.name] ?? '#94a3b8'
  }));
  const topExits = summary?.topExits ?? [];
  const recentMovements = summary?.recentMovements ?? [];

  return (
    <MainLayout>
      <h2 className={styles.dashboardTitle}>Dashboard - PETROBOSCAN</h2>

      {error ? (
        <p className={styles.messageError} role="alert">No se pudo cargar el dashboard: {error}</p>
      ) : !summary ? (
        <p className={styles.message} role="status">Cargando resumen del inventario...</p>
      ) : (
        <>
          <div className={styles.kpiGrid}>
            <KpiCard title="Materiales registrados" value={formatNumber(summary.totalMaterials)} icon={<MdLandscape size={24} color="#8b5cf6" />} />
            <KpiCard title="Unidades ingresadas este mes" value={formatNumber(summary.entriesThisMonth)} icon={<MdArrowUpward size={24} color="#16a34a" />} />
            <KpiCard title="Unidades egresadas este mes" value={formatNumber(summary.exitsThisMonth)} icon={<MdArrowDownward size={24} color="#dc2626" />} />
            <KpiCard title="Materiales críticos o agotados" value={formatNumber(inventoryStatus.filter((item) => item.name !== 'Stock OK').reduce((total, item) => total + item.value, 0))} icon={<MdWarningAmber size={24} color="#d97706" />} />
          </div>

          <div className={styles.twoColGrid}>
            <DataCard title="Estado actual del inventario">
              {inventoryStatus.length ? (
                <div className={styles.chartWithLegend}>
                  <div className={styles.pieChart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={inventoryStatus} innerRadius={48} outerRadius={82} dataKey="value" nameKey="name">
                          {inventoryStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.legend}>
                    {inventoryStatus.map((item) => (
                      <div className={styles.legendItem} key={item.name}>
                        <span className={styles.legendSwatch} style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <strong>{formatNumber(item.value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className={styles.message}>No hay materiales registrados.</p>
              )}
            </DataCard>

            <DataCard title="Materiales con más salidas este mes">
              {topExits.length ? (
                <div className={styles.barChart}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topExits} layout="vertical" margin={{ top: 4, right: 24, left: 12, bottom: 4 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <YAxis type="category" dataKey="code" width={86} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: 'var(--hover-bg)' }}
                        formatter={(value) => [formatNumber(value), 'Unidades egresadas']}
                        labelFormatter={(code) => topExits.find((item) => item.code === code)?.desc ?? code}
                      />
                      <Bar dataKey="quantity" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className={styles.message}>No hay salidas registradas este mes.</p>
              )}
            </DataCard>
          </div>

          <div className={styles.twoColGrid}>
            <DataCard title="Movimientos recientes">
              {recentMovements.length ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr><th>Materiales</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th><th>Responsable</th></tr>
                    </thead>
                    <tbody>
                      {recentMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td title={movement.materials}>{movement.materials}</td>
                          <td>{movement.type === 'ENTRADA' ? 'Entrada' : 'Salida'}</td>
                          <td>{formatNumber(movement.quantity)}</td>
                          <td>{formatDate(movement.dateTime || movement.date)}</td>
                          <td>{movement.responsible}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.message}>Todavía no hay movimientos registrados.</p>
              )}
            </DataCard>

            <DataCard title="Alertas de stock">
              {summary.lowStockMaterials.length ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr><th>Código / Material</th><th>Stock actual</th><th>Stock mínimo</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                      {summary.lowStockMaterials.map((material) => (
                        <tr key={material.code}>
                          <td>{material.code} — {material.desc}</td>
                          <td>{formatNumber(material.stock)}</td>
                          <td>{formatNumber(material.min)}</td>
                          <td className={styles.textRed}>{material.stock === 0 ? 'Sin stock' : 'Crítico'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.message}>No hay alertas de stock.</p>
              )}
            </DataCard>
          </div>
        </>
      )}
    </MainLayout>
  );
};
