// src/main/services/pedidos.service.js
import { pedidosCrud } from '../crud/pedidos.crud';

export const pedidosService = {
  listarPedidos: () => {
    return pedidosCrud.obtenerTodos();
  },

  crearPedido: (datos) => {
    if (!datos.items || datos.items.length === 0) {
      throw new Error('El pedido debe tener al menos un material.');
    }
    pedidosCrud.crearPedidoAutomático(datos);
    return pedidosCrud.obtenerTodos();
  },

  recibirParcial: (datosRecepcion) => {
    const { pedidoId, code, cantidadRecibida, seriales, receptor, fechaRecepcion } = datosRecepcion;
    
    if (!pedidoId || !code) throw new Error('Faltan datos de referencia del pedido.');
    if (!cantidadRecibida || cantidadRecibida <= 0) throw new Error('La cantidad a recibir debe ser mayor a 0.');
    if (seriales.length !== cantidadRecibida) throw new Error('La cantidad de seriales no coincide con la cantidad recibida.');
    
    const serialesLimpios = seriales.map(s => s.trim());
    if (serialesLimpios.some(s => s === '')) throw new Error('No puede dejar seriales en blanco.');
    
    return pedidosCrud.actualizarRecepcionParcial(pedidoId, code.toUpperCase(), cantidadRecibida, serialesLimpios, receptor, fechaRecepcion);
  }
};