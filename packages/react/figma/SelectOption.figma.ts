// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=9-247
// source=packages/react/src/components/Select/Select.tsx
// component=Select
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const state = instance.getEnum('state', { default: 'default', hover: 'hover', selected: 'selected', disabled: 'disabled' })
const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const disabled = state === 'disabled'

// One entry of Select's `options` array; Select reads it through metadata.
export default {
  example: figma.code`{ value: "${value}", label: "${label}"${disabled ? ', disabled: true' : ''} }`,
  id: 'select-option',
  metadata: { nestable: true, props: { value, label, disabled } },
}
