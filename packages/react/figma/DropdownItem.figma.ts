// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=11-54
// source=packages/react/src/components/Dropdown/Dropdown.tsx
// component=Dropdown
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const tone = instance.getEnum('tone', { default: 'default', danger: 'danger' })
const state = instance.getEnum('state', { default: 'default', hover: 'hover', focus: 'focus', disabled: 'disabled' })
const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const disabled = state === 'disabled'

const swap = instance.getBoolean('showIcon') ? instance.getInstanceSwap('icon') : null
const icon = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

// One entry of Dropdown's `items` array; Dropdown reads it through metadata.
export default {
  example: figma.code`{ id: "${id}", label: "${label}"${icon ? `, icon: "${icon}"` : ''}${tone === 'danger' ? ', tone: "danger"' : ''}${disabled ? ', disabled: true' : ''} }`,
  id: 'dropdown-item',
  metadata: { nestable: true, props: { id, label, icon, tone, disabled } },
}
