// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=12-257
// source=packages/react/src/components/DataTable/DataTable.tsx
// component=DataTable
import figma from 'figma'
const instance = figma.selectedInstance

const header = instance.getString('header')
const type = instance.getEnum('type', { text: 'text', checkbox: 'checkbox' })
const sort = instance.getEnum('sort', { none: 'none', unsorted: 'unsorted', ascending: 'ascending', descending: 'descending' })
const key = header.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const sortable = sort !== 'none'

// One entry of DataTable's `columns` array; DataTable reads it through metadata. The checkbox
// cell is the select-all column, which in code comes from `selectable` instead.
export default {
  example: figma.code`{ key: "${key}", header: "${header}"${sortable ? ', sortable: true' : ''} }`,
  id: 'datatable-header-cell',
  metadata: { nestable: true, props: { key, header, sortable, isCheckbox: type === 'checkbox' } },
}
