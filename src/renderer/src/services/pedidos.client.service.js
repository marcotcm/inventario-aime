export const pedidosClientService = {
  async obtenerPedidos() {
    if (!window.api?.pedidos) return [];
    const res = await window.api.pedidos.obtener();
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async crearPedido(datos) {
    if (!window.api?.pedidos) return [];
    const res = await window.api.pedidos.crear(datos);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async recibirParcial(datosRecepcion) {
    if (!window.api?.pedidos) return [];
    const res = await window.api.pedidos.recibirParcial(datosRecepcion);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
};