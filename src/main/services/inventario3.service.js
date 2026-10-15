import { productoCrud } from '../crud/producto.crud';

export const inventarioService = {
  listarInventario: (filtros = {}) => {
    let productos = productoCrud.obtenerTodos();

    // Filtro por Departamento
    if (filtros.departamento) {
      const dep = filtros.departamento.toUpperCase();
      if (dep === 'NINGUNO') return { items: [], totalItems: 0, totalPages: 1 }; 
      if (dep !== 'TODOS') {
        productos = productos.filter((p) => p.departamento === dep);
      }
    }

    // Buscador general (Ahora incluye la MARCA)
    if (filtros.search && filtros.search.trim() !== '') {
      const term = filtros.search.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.code.toLowerCase().includes(term) ||
          p.desc.toLowerCase().includes(term) ||
          (p.marca && p.marca.toLowerCase().includes(term))
      );
    }

    // Filtro específico por Marca
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

    // PAGINACIÓN EN EL BACKEND
    if (filtros.limit) {
      const limit = parseInt(filtros.limit);
      const page = filtros.page ? parseInt(filtros.page) : 1;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const startIndex = (page - 1) * limit;
      
      const itemsPaginados = productos.slice(startIndex, startIndex + limit);
      return { items: itemsPaginados, totalItems, totalPages };
    }

    // Si no envían límite (ej. para Modales o Exportación), se devuelve todo bajo la misma estructura
    return { items: productos, totalItems, totalPages: 1 };
  },

  listarMovimientos: (tipo) => {
    return productoCrud.obtenerMovimientos(tipo);
  },

  crearMaterial: (datos) => {
    if (!datos.code || !datos.code.trim() || !datos.desc || !datos.desc.trim()) {
      throw new Error('El Código y la Descripción del material son obligatorios.');
    }
    return productoCrud.crear(datos);
  },

  procesarEntrada: (datosEntrada) => {
    const { fecha, proveedor, factura, items, notas } = datosEntrada;
    if (!proveedor || !proveedor.trim()) throw new Error('El nombre del Proveedor es obligatorio.');
    if (!factura || !factura.trim()) throw new Error('El Nro. de Referencia/Factura es obligatorio.');
    if (!items || items.length === 0) throw new Error('Debe incluir al menos un material en la entrada.');

    return productoCrud.procesarLoteStock(items, 'ENTRADA', {
      fecha: fecha || new Date().toISOString().split('T')[0],
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

    return productoCrud.procesarLoteStock(items, 'SALIDA', {
      fecha: fecha || new Date().toISOString().split('T')[0],
      trabajador: trabajador.trim(),
      aprobadoPor: aprobadoPor.trim(),
      motivo: (motivo || '').trim()
    });
  }
};