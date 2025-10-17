import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const EmployeeTimesheet: CollectionConfig = {
  slug: 'employee_timesheets',
  labels: { singular: 'Employee Timesheet', plural: 'Employee Timesheets' },
  admin: { useAsTitle: 'uuid' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'etaid', type: 'text' },
    { name: 'full_eaid', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { name: 'started_at', type: 'text' },
    { name: 'ended_at', type: 'text' },
    { name: 'duration', type: 'number' },
    { name: 'data_in', type: 'json' },
  ],
}

export default EmployeeTimesheet


