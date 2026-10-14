import { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './Modals.module.css'
import { MdClose } from 'react-icons/md'

const emptyMaterial = {
  code: '',
  name: '',
  description: '',
  category: '',
  unit: 'UND',
  minimumStock: '0',
  location: '',
  initialStock: '0'
}

export const MaterialModal = ({ isOpen, onClose, onSave }) => {
  const [material, setMaterial] = useState(emptyMaterial)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleClose = () => {
    setMaterial(emptyMaterial)
    setError('')
    onClose()
  }

  const handleChange = (event) => {
    setMaterial((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await onSave(material)
      handleClose()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
    >
      <form
        className={styles.sidePanel}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Material</div>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label htmlFor="material-code">Código *</label>
            <input id="material-code" name="code" className={styles.input} value={material.code} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-name">Nombre *</label>
            <input id="material-name" name="name" className={styles.input} value={material.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-description">Descripción</label>
            <textarea id="material-description" name="description" className={styles.textarea} rows="2" value={material.description} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-category">Categoría</label>
            <input id="material-category" name="category" className={styles.input} value={material.category} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-unit">Unidad de medida *</label>
            <input id="material-unit" name="unit" className={styles.input} value={material.unit} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-minimum-stock">Stock mínimo</label>
            <input id="material-minimum-stock" name="minimumStock" type="number" min="0" step="any" className={styles.input} value={material.minimumStock} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-location">Ubicación del stock inicial</label>
            <input id="material-location" name="location" className={styles.input} value={material.location} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="material-initial-stock">Stock inicial</label>
            <input id="material-initial-stock" name="initialStock" type="number" min="0" step="any" className={styles.input} value={material.initialStock} onChange={handleChange} />
          </div>
          {error && <p role="alert">{error}</p>}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnSecondary} onClick={handleClose}>Cancelar</button>
          <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar material'}
          </button>
        </div>
      </form>
    </div>
  )
}

MaterialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}
