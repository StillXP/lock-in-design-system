// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=7-380
// source=packages/react/src/components/InputField/InputField.tsx
// component=InputField
import figma from 'figma'
const instance = figma.selectedInstance

// label, required and showOptional live on the exposed Label row (Field / Label),
// the hint text on Hint (Field / Hint) and the error text on Error (Field / Error).
const labelRow = instance.findInstance('Label row')
const label = labelRow.getString('label')
const required = labelRow.getBoolean('required')
const showOptional = labelRow.getBoolean('showOptional')
const hideLabel = !instance.getBoolean('showLabel')
const size = instance.getEnum('size', { md: 'md', sm: 'sm', lg: 'lg' })
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
const value = state === 'filled' ? instance.getString('value') : undefined
const suffix = instance.getBoolean('showSuffix') ? instance.getString('suffix') : undefined
const password = instance.getBoolean('showPasswordToggle')

const swap = instance.getBoolean('showIconStart') ? instance.getInstanceSwap('iconStart') : null
const icon = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

export default {
  example: figma.code`<InputField label="${label}"${hideLabel ? ' hideLabel' : ''}${password ? ' type="password"' : ''}${size !== 'md' ? ` size="${size}"` : ''}${required ? ' required' : ''}${showOptional && !required ? ' showOptional' : ''}${icon ? ` iconStart="${icon}"` : ''}${suffix ? ` suffix="${suffix}"` : ''}${hint ? ` hint="${hint}"` : ''}${error ? ` error="${error}"` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}${value ? ` defaultValue="${value}"` : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { InputField } from "@stillxp/react"'],
  id: 'input-field',
  metadata: { nestable: true },
}
