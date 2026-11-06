// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=6-529
// source=packages/react/src/components/Toggle/Toggle.tsx
// component=Toggle
import figma from 'figma'
const instance = figma.selectedInstance

// label, showLabel, description and showDescription live on the exposed Choice text instance.
const choice = instance.findInstance('Choice text')
const label = choice.getString('label')
const hideLabel = !choice.getBoolean('showLabel')
const description = choice.getBoolean('showDescription') ? choice.getString('description') : undefined
const size = instance.getEnum('size', { md: 'md', sm: 'sm' })
const checked = instance.getEnum('checked', { false: 'false', true: 'true' })
const state = instance.getEnum('state', { default: 'default', hover: 'hover', focus: 'focus', disabled: 'disabled' })

export default {
  example: figma.code`<Toggle label="${label}"${hideLabel ? ' hideLabel' : ''}${description ? ` description="${description}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${checked === 'true' ? ' checked' : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { Toggle } from "@stillxp/react"'],
  id: 'toggle',
  metadata: { nestable: true },
}
