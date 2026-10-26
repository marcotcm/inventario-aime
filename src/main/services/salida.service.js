import { salidaCrud } from '../crud/salida.crud';

export const salidaService = {
  listarMovimientos: (tipo) => salidaCrud.obtenerMovimientos(tipo),

  procesarEntrada: (datosEntrada) => {
    const { fecha, factura, items, notas } = datosEntrada;
    
    const proveedorPrincipal = items && items.length > 0 ? (items[0].proveedor || 'Múltiples Proveedores') : 'No especificado';

    if (!factura || !factura.trim()) throw new Error('El Nro. de Referencia/Factura es obligatorio.');
    if (!items || items.length === 0) throw new Error('Debe incluir al menos un material en la entrada.');

    return salidaCrud.procesarLoteStock(items, 'ENTRADA', {
      fecha,
      proveedor: proveedorPrincipal.trim(),
      factura: factura.trim(),
      notas: (notas || '').trim()
    });
  },

  procesarSalida: (datosSalida) => {
    const { fecha, trabajador, aprobadoPor, items, motivo } = datosSalida;
    if (!trabajador || !trabajador.trim()) throw new Error('Los datos del trabajador receptor son obligatorios.');
    if (!aprobadoPor || !aprobadoPor.trim()) throw new Error('El campo "Aprobado Por" es obligatorio.');
    if (!items || items.length === 0) throw new Error('Debe incluir al menos un material para retirar.');

    return salidaCrud.procesarLoteStock(items, 'SALIDA', {
      fecha,
      trabajador: trabajador.trim(),
      aprobadoPor: aprobadoPor.trim(),
      motivo: (motivo || '').trim()
    });
  }
};