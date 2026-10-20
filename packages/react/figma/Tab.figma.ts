// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=10-93
// source=packages/react/src/components/Tabs/Tabs.tsx
// component=Tabs
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const badge = instance.getBoolean('showBadge') ? instance.getString('badge') : undefined
const state = instance.getEnum('state', {
  selected: 'selected',
  unselected: 'unselected',
  hover: 'hover',
  focus: 'focus',
  disabled: 'disabled',
})
const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const disabled = state === 'disabled'

const swap = instance.getBoolean('showIcon') ? instance.getInstanceSwap('icon') : null
const icon = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

// One entry of Tabs' `items` array; Tabs reads it through metadata.
export default {
  example: figma.code`{ id: "${id}", label: "${label}"${icon ? `, icon: "${icon}"` : ''}${badge ? `, badge: "${badge}"` : ''}${disabled ? ', disabled: true' : ''} }`,
  id: 'tab',
  metadata: { nestable: true, props: { id, label, icon, badge, disabled } },
}
