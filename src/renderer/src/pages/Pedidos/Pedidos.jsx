// src/renderer/src/pages/Pedidos/Pedidos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { ReceiveModal } from '../../components/Modals/ReceiveModal';
import { pedidosClientService } from '../../services/pedidos.client.service';
import styles from './Pedidos.module.css';
import { MdRefresh, MdAddBox, MdDoneAll, MdTimer } from 'react-icons/md';

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);

  const cargarPedidos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await pedidosClientService.obtenerPedidos();
      setPedidos(data || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const agrupados = {};
  pedidos.forEach((pedido) => {
    const numOrden = pedido.orden_numero || 'SIN-ORDEN';
    if (!agrupados[numOrden]) agrupados[numOrden] = [];
    
    const detallesPorCodigo = {};
    pedido.detalles.forEach((det) => {
      if (!detallesPorCodigo[det.code]) detallesPorCodigo[det.code] = [];
      detallesPorCodigo[det.code].push(det);
    });

    Object.keys(detallesPorCodigo).forEach(code => {
      const detallesCode = detallesPorCodigo[code];
      let acumulado = 0;
      
      detallesCode.forEach(det => {
        acumulado += det.qty_recibida;
        det.total_acumulado = acumulado;
      });

      detallesCode.reverse();

      detallesCode.forEach((det, idx) => {
        agrupados[numOrden].push({
          ...det,
          pedido_id: pedido.id,
          ordenNumero: numOrden,
          proveedorGeneral: pedido.proveedor,
          fechaCreacion: pedido.fecha_creacion,
          estadoGeneral: pedido.estado,
          esElMasRecienteDelCodigo: idx === 0,
          totalRecibidoGlobalDelCodigo: acumulado
        });
      });
    });
  });

  const gruposFiltrados = Object.entries(agrupados).filter(([numOrden, items]) => {
    let totalSolicitadaOrden = 0;
    let totalRecibidaOrden = 0;

    items.forEach(item => {
      if (item.esElMasRecienteDelCodigo) {
        totalSolicitadaOrden += item.qty_solicitada;
        totalRecibidaOrden += item.totalRecibidoGlobalDelCodigo;
      }
    });
    
    if (filtroEstado === 'TODOS') return true;
    if (filtroEstado === 'EN_CERO') return totalRecibidaOrden === 0;
    if (filtroEstado === 'COMPLETADOS') return totalRecibidaOrden >= totalSolicitadaOrden;
    if (filtroEstado === 'INCOMPLETOS') return totalRecibidaOrden > 0 && totalRecibidaOrden < totalSolicitadaOrden;
    return true;
  });

  const filasPlanas = [];
  gruposFiltrados.forEach(([numOrden, items]) => {
    items.forEach((item, idx) => {
      filasPlanas.push({
        ...item,
        itemIndex: idx + 1,
        esPrimero: idx === 0,
        rowSpan: items.length
      });
    });
  });

  const abrirModalRecepcion = (fila) => {
    setFilaSeleccionada(fila);
    setIsReceiveModalOpen(true);
  };

  const handleGuardarRecepcion = async (datosRecepcion) => {
    await pedidosClientService.recibirParcial(datosRecepcion);
    await cargarPedidos();
  };

  return (
    <MainLayout>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>SEGUIMIENTO DE PEDIDOS Y ÓRDENES DE COMPRA</h2>
        <div className={styles.actions}>
          
          <div className={styles.filterButtonGroup}>
            <button 
              className={filtroEstado === 'TODOS' ? styles.filterBtnActive : styles.filterBtn} 
              onClick={() => setFiltroEstado('TODOS')}
            >
              Todos
            </button>
            <button 
              className={filtroEstado === 'EN_CERO' ? styles.filterBtnActive : styles.filterBtn} 
              onClick={() => setFiltroEstado('EN_CERO')}
            >
              En Cero
            </button>
            <button 
              className={filtroEstado === 'INCOMPLETOS' ? styles.filterBtnActive : styles.filterBtn} 
              onClick={() => setFiltroEstado('INCOMPLETOS')}
            >
              Incompletos
            </button>
            <button 
              className={filtroEstado === 'COMPLETADOS' ? styles.filterBtnActive : styles.filterBtn} 
              onClick={() => setFiltroEstado('COMPLETADOS')}
            >
              Completados
            </button>
          </div>

          <button className={styles.btnOutline} onClick={cargarPedidos}>
            <MdRefresh size={18} /> Actualizar
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {cargando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando órdenes de compra...
          </div>
        ) : filasPlanas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay pedidos activos bajo el filtro seleccionado.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>#ORDEN</th>
                  <th>FECHA PEDIDO</th>
                  <th>PROVEEDOR</th>
                  <th>MATERIAL / NOMBRE</th>
                  <th>MARCA</th>
                  <th>CANT. SOLIC.</th>
                  <th>CANT. RECIBIDA</th>
                  <th>TOTAL RECIBIDO</th>
                  <th>FECHA REC.</th>
                  <th>RECEPTOR</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filasPlanas.map((fila) => {
                  const estaCompletoDelTodo = fila.totalRecibidoGlobalDelCodigo >= fila.qty_solicitada;
                  const esHistorial = !fila.esElMasRecienteDelCodigo;
                  const keyUnica = `${fila.pedido_id}-${fila.code}-${fila.id}`;

                  return (
                    <tr key={keyUnica} style={{ opacity: esHistorial ? 0.75 : 1, backgroundColor: esHistorial ? 'var(--bg-main)' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>{fila.itemIndex}</td>
                      
                      {fila.esPrimero && (
                        <td rowSpan={fila.rowSpan} style={{ fontWeight: '700', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                          {fila.ordenNumero}
                        </td>
                      )}
                      
                      {fila.esPrimero && (
                        <td rowSpan={fila.rowSpan} style={{ verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                          {new Date(fila.fechaCreacion).toLocaleDateString()}
                        </td>
                      )}

                      {fila.esPrimero && (
                        <td rowSpan={fila.rowSpan} style={{ verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                          {fila.proveedorGeneral}
                        </td>
                      )}
                      
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontWeight: '600' }}>{fila.code}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{fila.material_nombre}</div>
                      </td>
                      <td>{fila.material_marca}</td>
                      
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{fila.qty_solicitada} {fila.unit}</td>
                      <td style={{ textAlign: 'center' }}>{fila.qty_recibida > 0 ? `+${fila.qty_recibida}` : 0} {fila.unit}</td>
                      
                      <td 
                        style={{ 
                          textAlign: 'center', 
                          fontWeight: '800', 
                          fontSize: '14px',
                          color: estaCompletoDelTodo ? '#22c55e' : '#f59e0b'
                        }}
                      >
                        {fila.total_acumulado}
                      </td>

                      <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {fila.fecha_recepcion ? new Date(fila.fecha_recepcion).toLocaleDateString() : 'Pendiente'}
                      </td>
                      <td style={{ fontSize: '11px', maxWidth: '120px' }}>
                        {fila.receptor || '---'}
                      </td>
                      
                      <td style={{ textAlign: 'center' }}>
                        {estaCompletoDelTodo ? (
                           <MdDoneAll size={20} color="#22c55e" title="Completado" />
                        ) : (
                           <MdTimer size={20} color="#f59e0b" title="Pendiente" />
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {!estaCompletoDelTodo && fila.esElMasRecienteDelCodigo && (
                          <button 
                            className={styles.btnAction}
                            onClick={() => abrirModalRecepcion(fila)}
                          >
                            <MdAddBox size={16} /> Recibir
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReceiveModal 
        isOpen={isReceiveModalOpen}
        onClose={() => { setIsReceiveModalOpen(false); setFilaSeleccionada(null); }}
        fila={filaSeleccionada}
        onSave={handleGuardarRecepcion}
      />
    </MainLayout>
  );
};