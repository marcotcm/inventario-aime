export class ProductoModel {
  constructor({ code, desc, cat, loc, unit, stock = 0, min = 10, serials = [] }) {
    this.code = code ? code.trim().toUpperCase() : '';
    this.desc = desc ? desc.trim() : '';
    this.cat = cat || 'General';
    this.loc = loc || 'Almacén A';
    this.unit = unit || 'UND';
    this.stock = Number(stock) || 0;
    this.min = Number(min) || 0;
    this.status = this.stock <= this.min ? 'Crítico' : 'Stock OK';
    this.serials = Array.isArray(serials) ? serials : [];
  }

  static calcularEstado(stock, min) {
    return Number(stock) <= Number(min) ? 'Crítico' : 'Stock OK';
  }
}