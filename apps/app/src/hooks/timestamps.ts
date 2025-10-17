import { FieldHook } from 'payload'

export const setCreatedAt: FieldHook = ({ value, operation }) => {
  if (operation === 'create' && !value) {
    return new Date().toISOString()
  }
  return value
}

export const setUpdatedAt: FieldHook = () => {
  return new Date().toISOString()
}

