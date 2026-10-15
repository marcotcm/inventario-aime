export class ProductoModel {
  constructor({ code, desc, marca, modelo, departamento, cat, loc, unit, min = 10, foto = null, stock = 0, serials = [] }) {
    this.code = code ? code.trim().toUpperCase() : '';
    this.desc = desc ? desc.trim() : '';
    this.marca = marca ? marca.trim() : 'N/A';
    this.modelo = modelo ? modelo.trim() : 'N/A';
    this.departamento = departamento ? departamento.trim().toUpperCase() : 'AIT';
    this.cat = cat || 'General';
    this.loc = loc || 'Almacén A';
    this.unit = unit || 'UND';
    this.min = Number(min) || 0;
    this.foto = foto || null;
    this.stock = Number(stock) || 0;
    this.status = this.stock <= this.min ? 'Crítico' : 'Stock OK';
    this.serials = Array.isArray(serials) ? serials : [];
  }

  static calcularEstado(stock, min) {
    return Number(stock) <= Number(min) ? 'Crítico' : 'Stock OK';
  }
}