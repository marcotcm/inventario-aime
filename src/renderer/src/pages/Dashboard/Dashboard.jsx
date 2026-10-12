import React from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { DataCard } from '../../components/DataCard/DataCard';
import styles from './Dashboard.module.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MdLandscape, MdArrowUpward, MdArrowDownward, MdAttachMoney } from 'react-icons/md';

export const Dashboard = () => {
  const pieData = [
    { name: 'Stock OK', value: 70, color: '#86efac' },
    { name: 'Bajo Stock', value: 18, color: '#fcd34d' },
    { name: 'Crítico', value: 12, color: '#fca5a5' },
  ];
  const barData = [
    { name: 'Tubería 6"', valor: 40 },
    { name: 'Válvula de Compuerta', valor: 25 },
    { name: 'Rodamientos SKF', valor: 15 },
  ];

  return (
    <MainLayout>
      <h2 className={styles.dashboardTitle}>Dashboard - PETROBOZCAN</h2>

      <div className={styles.kpiGrid}>
        <KpiCard title="Total Materiales Únicos" value="1,250" icon={<MdLandscape size={24} color="#8b5cf6" />} />
        <KpiCard title="Entradas Este Mes" value="155" icon={<MdArrowUpward size={24} color="#16a34a" />} />
        <KpiCard title="Salidas Este Mes" value="118" icon={<MdArrowDownward size={24} color="#dc2626" />} />
        <KpiCard title="Valor Estimado" value="$2.1M" icon={<MdAttachMoney size={24} color="#d97706" />} />
      </div>

      <div className={styles.twoColGrid}>
        <DataCard title="Estado del Inventario (Visión General)">
          <div style={{ height: '200px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={0} outerRadius={90} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: '13px', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#16a34a', fontSize: '18px' }}>■</span> Stock OK (70%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#d97706', fontSize: '18px' }}>■</span> Bajo Stock (18%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#dc2626', fontSize: '18px' }}>■</span> Crítico (12%)</div>
            </div>
          </div>
        </DataCard>

        <DataCard title='<span style="color: #dc2626">NEW!</span> Materiales Más Egresados (Último Mes)'>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--hover-bg)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'var(--text-primary)', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>

      <div className={styles.twoColGrid}>
        <DataCard title="Movimientos Recientes (Listado)">
          <table className={styles.dataTable}>
            <thead><tr><th>ID / Material</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th><th>Responsable</th></tr></thead>
            <tbody>
              <tr><td>PM-0015</td><td>Tubería 6" - Entrada</td><td>50</td><td>20-Oct</td><td>J. Pérez</td></tr>
              <tr><td>PM-0016</td><td>Tubería 6" - Salida</td><td>10</td><td>21-Oct</td><td>J. Pérez</td></tr>
              <tr><td>PM-0016</td><td>Tubería 6" - Entrada</td><td>50</td><td>21-Oct</td><td>J. Pérez</td></tr>
            </tbody>
          </table>
        </DataCard>

        <DataCard title="Alertas de Stock Crítico">
          <table className={styles.dataTable}>
            <thead><tr><th>ID / Material</th><th>Stock Actual</th><th>Stock Mínimo</th></tr></thead>
            <tbody>
              <tr className={styles.textRed}><td>PM-0005 Válvula de Compuerta</td><td>30</td><td>35</td></tr>
              <tr className={styles.textRed}><td>PM-0033 Lubricante ...</td><td>15</td><td>20</td></tr>
              <tr className={styles.textRed}><td>PM-0034 Lubricante ...</td><td>18</td><td>22</td></tr>
            </tbody>
          </table>
        </DataCard>
      </div>
    </MainLayout>
  );
};