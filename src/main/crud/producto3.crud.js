import { db } from '../database/connection';
import { ProductoModel } from '../models/producto.model';

export const productoCrud = {
  obtenerTodos: () => {
    const data = db.read();
    return data.productos;
  },

  obtenerMovimientos: (tipo) => {
    const data = db.read();
    if (tipo) {
      return data.movimientos.filter(m => m.tipo === tipo);
    }
    return data.movimientos;
  },

  obtenerPorCodigo: (code) => {
    const data = db.read();
    return data.productos.find((p) => p.code.toUpperCase() === code.toUpperCase());
  },

  crear: (nuevoProducto) => {
    const data = db.read();
    const codigoLimpio = (nuevoProducto.code || '').trim().toUpperCase();

    if (!codigoLimpio || !(nuevoProducto.desc || '').trim()) {
      throw new Error('El código y la descripción del material son obligatorios.');
    }

    const existe = data.productos.some((p) => p.code.toUpperCase() === codigoLimpio);
    if (existe) {
      throw new Error(`El código de material ${codigoLimpio} ya existe en el inventario.`);
    }

    const stockInicial = Number(nuevoProducto.stock) || 0;
    const rawSerials = Array.isArray(nuevoProducto.serials) ? nuevoProducto.serials : [];
    const serialesLimpios = rawSerials.map((s) => String(s).trim()).filter((s) => s !== '');

    if (stockInicial > 0 && serialesLimpios.length !== stockInicial) {
      throw new Error(`No puede dejar seriales en blanco. Debe ingresar los ${stockInicial} serial(es) iniciales.`);
    }

    const setUnicos = new Set(serialesLimpios.map((s) => s.toUpperCase()));
    if (setUnicos.size !== serialesLimpios.length) {
      throw new Error('Ha ingresado seriales repetidos en el mismo material.');
    }

    const modelo = new ProductoModel({
      ...nuevoProducto,
      code: codigoLimpio,
      serials: serialesLimpios
    });

    data.productos.unshift(modelo);
    db.write(data);
    return modelo;
  },

  procesarLoteStock: (items, tipo, datosMovimiento) => {
    const data = db.read();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Debe agregar al menos un material a la lista.');
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const numFila = i + 1;
      const code = (item.code || '').trim().toUpperCase();
      const cant = Number(item.qty);

      if (!code) {
        throw new Error(`Fila #${numFila}: Debe seleccionar un material o quitar la fila con el botón X.`);
      }

      if (!cant || isNaN(cant) || cant <= 0) {
        throw new Error(`Fila #${numFila} (${code}): La cantidad debe ser mayor a 0.`);
      }

      const rawSerials = Array.isArray(item.serials) ? item.serials : [];
      if (rawSerials.length !== cant) {
        throw new Error(`Fila #${numFila} (${code}): La cantidad de campos de serial no coincide con la cantidad (${cant}).`);
      }

      const serialesEnviados = rawSerials.map((s) => String(s).trim());
      const tieneVacios = serialesEnviados.some((s) => s === '');
      if (tieneVacios) {
        throw new Error(`Fila #${numFila} (${code}): No puede dejar campos de serial en blanco.`);
      }

      const setFila = new Set(serialesEnviados.map((s) => s.toUpperCase()));
      if (setFila.size !== serialesEnviados.length) {
        throw new Error(`Fila #${numFila} (${code}): Ha escrito seriales duplicados.`);
      }

      const index = data.productos.findIndex((p) => p.code.toUpperCase() === code);
      if (index === -1) {
        throw new Error(`Fila #${numFila}: El material con código ${code} no existe.`);
      }

      const prod = data.productos[index];
      const serialesActualesUpper = (prod.serials || []).map((s) => s.toUpperCase());

      if (tipo === 'ENTRADA') {
        for (const s of serialesEnviados) {
          if (serialesActualesUpper.includes(s.toUpperCase())) {
            throw new Error(`Fila #${numFila} (${prod.code}): El serial "${s}" ya existe en el inventario.`);
          }
        }
        prod.stock += cant;
        prod.serials = [...(prod.serials || []), ...serialesEnviados];
      } else if (tipo === 'SALIDA') {
        if (prod.stock < cant) {
          throw new Error(`Fila #${numFila} (${prod.code}): Stock insuficiente. Disponible: ${prod.stock}, Solicitado: ${cant}.`);
        }
        for (const s of serialesEnviados) {
          const existeEnProd = (prod.serials || []).some(
            (existente) => existente.toUpperCase() === s.toUpperCase()
          );
          if (!existeEnProd) {
            throw new Error(`Fila #${numFila} (${prod.code}): El serial "${s}" no se encuentra en el stock disponible.`);
          }
        }
        const retirarUpper = serialesEnviados.map((s) => s.toUpperCase());
        prod.stock -= cant;
        prod.serials = (prod.serials || []).filter((s) => !retirarUpper.includes(s.toUpperCase()));
      }

      prod.status = ProductoModel.calcularEstado(prod.stock, prod.min);
      data.productos[index] = prod;
    }

    const nuevoMov = {
      id: `MOV-${Date.now()}`,
      fechaHora: new Date().toISOString(),
      tipo,
      ...datosMovimiento,
      items
    };
    data.movimientos.unshift(nuevoMov);

    db.write(data);
    return data.productos;
  }
};