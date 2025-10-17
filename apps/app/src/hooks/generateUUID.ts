import { FieldHook } from 'payload'
import { randomUUID } from 'crypto'

export const generateUUID: FieldHook = ({ value, operation }) => {
  if (operation === 'create' && !value) {
    return randomUUID()
  }
  return value
}

