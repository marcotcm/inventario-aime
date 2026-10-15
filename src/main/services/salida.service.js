import { salidaCrud } from '../crud/salida.crud';

export const salidaService = {
  listarMovimientos: (tipo) => salidaCrud.obtenerMovimientos(tipo),

  procesarEntrada: (datosEntrada) => {
    const { fecha, proveedor, factura, items, notas } = datosEntrada;
    if (!proveedor || !proveedor.trim()) throw new Error('El nombre del Proveedor es obligatorio.');
    if (!factura || !factura.trim()) throw new Error('El Nro. de Referencia/Factura es obligatorio.');
    if (!items || items.length === 0) throw new Error('Debe incluir al menos un material en la entrada.');

    return salidaCrud.procesarLoteStock(items, 'ENTRADA', {
      fecha,
      proveedor: proveedor.trim(),
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