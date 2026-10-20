// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=10-167
// source=packages/react/src/components/Tabs/Tabs.tsx
// component=Tabs
import figma from 'figma'
const instance = figma.selectedInstance

const variant = instance.getEnum('variant', { line: 'line', contained: 'contained' })
const value = instance.getEnum('value', { overview: 'overview', standings: 'standings', fixtures: 'fixtures' })

// Items come from the Tabs / Tab templates. `content` is not in Figma, so it is left as a stub.
const items = instance
  .findConnectedInstances((node) => node.codeConnectId() === 'tab', { traverseInstances: true })
  .map((tab) => tab.executeTemplate().metadata?.props)
  .flatMap((props) => (props ? [props] : []))
  .map(
    (props) =>
      `{ id: "${props.id}", label: "${props.label}", content: <p>${props.label}</p>${props.icon ? `, icon: "${props.icon}"` : ''}${props.badge ? `, badge: "${props.badge}"` : ''}${props.disabled ? ', disabled: true' : ''} }`,
  )
const itemsCode = items.length ? `[${items.join(', ')}]` : 'items'

export default {
  example: figma.code`<Tabs aria-label="Describe the tabs" items={${itemsCode}} defaultValue="${value}"${variant !== 'line' ? ` variant="${variant}"` : ''} />`,
  imports: ['import { Tabs } from "@lockin/react"'],
  id: 'tabs',
  metadata: { nestable: true },
}
