export const inventarioClientService = {
  async obtenerInventario(filtros = {}) {
    if (!window.api?.inventario) return [];
    const res = await window.api.inventario.obtener(filtros);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async obtenerMovimientos(tipo) {
    if (!window.api?.inventario) return [];
    const res = await window.api.inventario.obtenerMovimientos(tipo);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async crearNuevoMaterial(material) {
    const res = await window.api.inventario.crear(material);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async registrarEntrada(datos) {
    const res = await window.api.inventario.registrarEntrada(datos);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async registrarSalida(datos) {
    const res = await window.api.inventario.registrarSalida(datos);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async exportarInventario() {
    const res = await window.api.inventario.exportar();
    if (!res.ok) throw new Error(res.error);
    return res;
  },
  async actualizarMaterial(code, datos) {
    const res = await window.api.inventario.actualizar(code, datos);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
};