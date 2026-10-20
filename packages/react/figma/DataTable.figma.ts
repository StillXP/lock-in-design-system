// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=12-809
// source=packages/react/src/components/DataTable/DataTable.tsx
// component=DataTable
import figma from 'figma'
const instance = figma.selectedInstance

const density = instance.getEnum('density', { default: 'default', compact: 'compact', comfortable: 'comfortable' })

const caption = instance.findText('Caption')
const captionText = caption && caption.type === 'TEXT' ? caption.textContent : undefined

// Columns come from the header cell templates. Rows are not derived: a cell has no column key.
const headers = instance
  .findConnectedInstances((node) => node.codeConnectId() === 'datatable-header-cell', { traverseInstances: true })
  .map((cell) => cell.executeTemplate().metadata?.props)
  .flatMap((props) => (props ? [props] : []))
const selectable = headers.some((props) => props.isCheckbox)
const columns = headers
  .filter((props) => !props.isCheckbox)
  .map((props) => `{ key: "${props.key}", header: "${props.header}"${props.sortable ? ', sortable: true' : ''} }`)
const columnsCode = columns.length ? `[${columns.join(', ')}]` : 'columns'

export default {
  example: figma.code`<DataTable caption="${captionText ?? 'Describe the table'}" columns={${columnsCode}} rows={rows} getRowId={(row) => row.id}${density !== 'default' ? ` density="${density}"` : ''}${selectable ? ' selectable' : ''} />`,
  imports: ['import { DataTable } from "@lockin/react"'],
  id: 'datatable',
  metadata: { nestable: true },
}
