// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=6-202
// source=packages/react/src/components/Checkbox/Checkbox.tsx
// component=Checkbox
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const hideLabel = !instance.getBoolean('showLabel')
const description = instance.getBoolean('showDescription') ? instance.getString('description') : undefined
const checked = instance.getEnum('checked', { false: 'false', true: 'true', indeterminate: 'indeterminate' })
const state = instance.getEnum('state', { default: 'default', hover: 'hover', focus: 'focus', disabled: 'disabled', invalid: 'invalid' })
// In code, setting error makes the checkbox invalid; Figma shows the text for state=invalid.
const error = state === 'invalid' ? instance.getString('error') : undefined

export default {
  example: figma.code`<Checkbox label="${label}"${hideLabel ? ' hideLabel' : ''}${description ? ` description="${description}"` : ''}${error ? ` error="${error}"` : ''}${checked === 'true' ? ' checked' : ''}${checked === 'indeterminate' ? ' indeterminate' : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { Checkbox } from "@lockin/react"'],
  id: 'checkbox',
  metadata: { nestable: true },
}
