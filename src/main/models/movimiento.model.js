export class MovimientoModel {
  constructor({ id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, aprobado_por, motivo, notas, items = [] }) {
    this.id = id;
    this.tipo = tipo;
    this.fecha = fecha;
    this.fechaHora = fecha_hora;
    this.proveedor = proveedor || null;
    this.factura = factura || null;
    this.trabajador = trabajador || null;
    this.aprobadoPor = aprobado_por || null;
    this.motivo = motivo || null;
    this.notas = notas || null;
    this.items = items;
  }
}