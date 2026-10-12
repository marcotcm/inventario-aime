import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { Inventory } from '../pages/Inventory/Inventory'
import { Entries } from '../pages/Entries/Entries' // Nueva vista
import { Exits } from '../pages/Exits/Exits'       // Nueva vista

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventario" element={<Inventory />} />
      <Route path="/entradas" element={<Entries />} />
      <Route path="/salidas" element={<Exits />} />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}