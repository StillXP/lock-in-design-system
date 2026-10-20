// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=11-180
// source=packages/react/src/components/Dropdown/Dropdown.tsx
// component=Dropdown
import figma from 'figma'
const instance = figma.selectedInstance

const trigger = instance.getEnum('trigger', { labelled: 'labelled', overflow: 'overflow' })

// The trigger is a nested Button instance: its text is `label` and its variant and size are
// triggerVariant and triggerSize.
const button = instance.findInstance('Trigger')
const buttonInstance = button && button.type === 'INSTANCE' ? button : undefined
const label = buttonInstance ? buttonInstance.getString('children') : 'Actions'
const triggerVariant = buttonInstance
  ? buttonInstance.getEnum('variant', { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', danger: 'danger' })
  : 'secondary'
const triggerSize = buttonInstance ? buttonInstance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' }) : 'md'

// Items come from the Dropdown / Item templates inside the swapped-in Dropdown / Menu.
const items = instance
  .findConnectedInstances((node) => node.codeConnectId() === 'dropdown-item', { traverseInstances: true })
  .map((item) => item.executeTemplate().metadata?.props)
  .flatMap((props) => (props ? [props] : []))
  .map(
    (props) =>
      `{ id: "${props.id}", label: "${props.label}"${props.icon ? `, icon: "${props.icon}"` : ''}${props.tone === 'danger' ? ', tone: "danger"' : ''}${props.disabled ? ', disabled: true' : ''} }`,
  )
const itemsCode = items.length ? `[${items.join(', ')}]` : 'items'

export default {
  example: figma.code`<Dropdown label="${label}" items={${itemsCode}}${trigger === 'overflow' ? ' triggerIcon="more-horizontal"' : ''}${triggerVariant !== 'secondary' ? ` triggerVariant="${triggerVariant}"` : ''}${triggerSize !== 'md' ? ` triggerSize="${triggerSize}"` : ''} />`,
  imports: ['import { Dropdown } from "@lockin/react"'],
  id: 'dropdown',
  metadata: { nestable: true },
}
