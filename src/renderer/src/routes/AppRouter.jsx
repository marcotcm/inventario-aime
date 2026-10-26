import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Inventory } from '../pages/Inventory/Inventory';
import { Entries } from '../pages/Entries/Entries';
import { Exits } from '../pages/Exits/Exits';
import { Pedidos } from '../pages/Pedidos/Pedidos';
import { Providers } from '../pages/Providers/Providers';
import { Reports } from '../pages/Reports/Reports';
import { Settings } from '../pages/Settings/Settings';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventario" element={<Inventory />} />
      <Route path="/entradas" element={<Entries />} />
      <Route path="/salidas" element={<Exits />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/proveedores" element={<Providers />} />
      <Route path="/reportes" element={<Reports />} />
      <Route path="/ajustes" element={<Settings />} />
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};