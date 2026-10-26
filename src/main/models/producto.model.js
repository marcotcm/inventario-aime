// src/main/models/producto.model.js
export class ProductoModel {
  constructor({ code, nombre, descripcion, marca, modelo, departamento, cat, loc, unit, min = 10, foto = null, stock = 0, status, serials = [], stockDetails = [], existencia_historica = 0 }) {
    this.code = code ? code.trim().toUpperCase() : '';
    this.nombre = nombre ? nombre.trim() : '';
    this.descripcion = descripcion ? descripcion.trim() : '';
    this.marca = marca ? marca.trim() : 'N/A';
    this.modelo = modelo ? modelo.trim() : 'N/A';
    this.departamento = departamento ? departamento.trim().toUpperCase() : 'AIT';
    this.cat = cat || 'General';
    this.loc = loc ? loc.trim() : '';
    this.unit = unit || 'UND';
    this.min = Number(min) || 0;
    this.foto = foto || null;
    this.stock = Number(stock) || 0;
    this.status = status || (this.stock <= this.min ? 'Crítico' : 'Stock OK');
    this.serials = Array.isArray(serials) ? serials : [];
    this.stockDetails = Array.isArray(stockDetails) ? stockDetails : [];
    this.existencia_historica = Number(existencia_historica) || 0;
  }

  static calcularEstado(stock, min) {
    return Number(stock) <= Number(min) ? 'Crítico' : 'Stock OK';
  }
}