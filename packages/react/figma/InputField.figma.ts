// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=7-380
// source=packages/react/src/components/InputField/InputField.tsx
// component=InputField
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const hideLabel = !instance.getBoolean('showLabel')
const required = instance.getBoolean('required')
const showOptional = instance.getBoolean('showOptional')
const size = instance.getEnum('size', { md: 'md', sm: 'sm', lg: 'lg' })
const state = instance.getEnum('state', {
  default: 'default',
  hover: 'hover',
  focus: 'focus',
  filled: 'filled',
  invalid: 'invalid',
  disabled: 'disabled',
})
const hint = instance.getBoolean('showHint') ? instance.getString('hint') : undefined
// In code, setting error makes the field invalid; Figma shows the text for state=invalid.
const error = state === 'invalid' ? instance.getString('error') : undefined
const placeholder = instance.getString('placeholder')
const value = state === 'filled' ? instance.getString('value') : undefined
const suffix = instance.getBoolean('showSuffix') ? instance.getString('suffix') : undefined
const password = instance.getBoolean('showPasswordToggle')

const swap = instance.getBoolean('showIconStart') ? instance.getInstanceSwap('iconStart') : null
const icon = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

export default {
  example: figma.code`<InputField label="${label}"${hideLabel ? ' hideLabel' : ''}${password ? ' type="password"' : ''}${size !== 'md' ? ` size="${size}"` : ''}${required ? ' required' : ''}${showOptional ? ' showOptional' : ''}${icon ? ` iconStart="${icon}"` : ''}${suffix ? ` suffix="${suffix}"` : ''}${hint ? ` hint="${hint}"` : ''}${error ? ` error="${error}"` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}${value ? ` defaultValue="${value}"` : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { InputField } from "@lockin/react"'],
  id: 'input-field',
  metadata: { nestable: true },
}
