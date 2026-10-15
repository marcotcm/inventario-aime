import { productoCrud } from '../crud/producto.crud';

export const inventarioService = {
  listarInventario: (filtros = {}) => {
    let productos = productoCrud.obtenerTodos();

    if (filtros.departamento) {
      const dep = filtros.departamento.toUpperCase();
      if (dep === 'NINGUNO') return { items: [], totalItems: 0, totalPages: 1 }; 
      if (dep !== 'TODOS') {
        productos = productos.filter((p) => p.departamento === dep);
      }
    }

    if (filtros.search && filtros.search.trim() !== '') {
      const term = filtros.search.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.code.toLowerCase().includes(term) ||
          p.desc.toLowerCase().includes(term) ||
          (p.marca && p.marca.toLowerCase().includes(term))
      );
    }

    if (filtros.marca && filtros.marca.trim() !== '') {
      const marcaTerm = filtros.marca.toLowerCase();
      productos = productos.filter((p) => p.marca && p.marca.toLowerCase().includes(marcaTerm));
    }

    if (filtros.cat && filtros.cat !== 'Todas') {
      productos = productos.filter((p) => p.cat === filtros.cat);
    }

    if (filtros.loc && filtros.loc !== 'Todos los Almacenes') {
      productos = productos.filter((p) => p.loc === filtros.loc);
    }

    if (filtros.status && filtros.status !== 'Todos') {
      productos = productos.filter((p) => p.status === filtros.status);
    }

    const totalItems = productos.length;

    if (filtros.limit) {
      const limit = parseInt(filtros.limit);
      const page = filtros.page ? parseInt(filtros.page) : 1;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const startIndex = (page - 1) * limit;
      
      const itemsPaginados = productos.slice(startIndex, startIndex + limit);
      return { items: itemsPaginados, totalItems, totalPages };
    }

    return { items: productos, totalItems, totalPages: 1 };
  },

  crearMaterial: (datos) => {
    if (!datos.code || !datos.code.trim() || !datos.desc || !datos.desc.trim()) {
      throw new Error('El Código y la Descripción del material son obligatorios.');
    }
    return productoCrud.crear(datos);
  },
  actualizarMaterial: (code, datos) => {
    if (!code || !datos.desc || !datos.desc.trim()) {
      throw new Error('La descripción del material es obligatoria.');
    }
    return productoCrud.actualizar(code, datos);
  },
  actualizarSerialesStock: (code, serials) => {
    if (!code || !Array.isArray(serials)) {
      throw new Error('Datos de seriales inválidos.');
    }
    return productoCrud.actualizarSerialesStock(code, serials);
  }
};