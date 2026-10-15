export class ProveedorModel {
  constructor({ id, nombre, rif, telefono, created_at }) {
    this.id = id;
    this.nombre = nombre ? nombre.trim() : '';
    this.rif = rif ? rif.trim() : '';
    this.telefono = telefono ? telefono.trim() : '';
    this.created_at = created_at;
  }
}