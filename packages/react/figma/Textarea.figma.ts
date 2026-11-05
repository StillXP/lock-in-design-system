// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=177-226
// source=packages/react/src/components/Textarea/Textarea.tsx
// component=Textarea
import figma from 'figma'
const instance = figma.selectedInstance

// label, required and showOptional live on the exposed Label row (Field / Label),
// the hint text on Hint (Field / Hint) and the error text on Error (Field / Error).
const labelRow = instance.findInstance('Label row')
const label = labelRow.getString('label')
const required = labelRow.getBoolean('required')
const showOptional = labelRow.getBoolean('showOptional')
const hideLabel = !instance.getBoolean('showLabel')
const rows = instance.getEnum('rows', { '3': '3', '5': '5' })
const state = instance.getEnum('state', {
  default: 'default',
  hover: 'hover',
  focus: 'focus',
  filled: 'filled',
  invalid: 'invalid',
  disabled: 'disabled',
})
const hint = instance.getBoolean('showHint') ? instance.findInstance('Hint').getString('text') : undefined
// In code, setting error makes the field invalid; Figma shows the text for state=invalid.
const error = state === 'invalid' ? instance.findInstance('Error').getString('message') : undefined
const placeholder = instance.getString('placeholder')
const value = state === 'filled' || state === 'invalid' ? instance.getString('value') : undefined
// Figma holds sample counter text ("86 / 500"); code needs the limit.
const count = instance.getBoolean('showCount') ? instance.getString('count') : undefined
const limit = count ? count.split('/').pop()?.trim() : undefined

export default {
  example: figma.code`<Textarea label="${label}"${hideLabel ? ' hideLabel' : ''}${required ? ' required' : ''}${showOptional && !required ? ' showOptional' : ''}${rows !== '3' ? ` rows={${rows}}` : ''}${limit ? ` maxLength={${limit}} showCount` : ''}${hint ? ` hint="${hint}"` : ''}${error ? ` error="${error}"` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}${value ? ` defaultValue="${value}"` : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { Textarea } from "@stillxp/react"'],
  id: 'textarea',
  metadata: { nestable: true },
}
