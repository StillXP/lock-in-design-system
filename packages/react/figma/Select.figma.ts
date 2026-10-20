// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=9-236
// source=packages/react/src/components/Select/Select.tsx
// component=Select
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const hideLabel = !instance.getBoolean('showLabel')
const placeholder = instance.getString('placeholder')
const hint = instance.getBoolean('showHint') ? instance.getString('hint') : undefined
const size = instance.getEnum('size', { md: 'md', sm: 'sm', lg: 'lg' })
const state = instance.getEnum('state', {
  default: 'default',
  hover: 'hover',
  focus: 'focus',
  filled: 'filled',
  invalid: 'invalid',
  disabled: 'disabled',
  open: 'open',
})
// In code, setting error makes the select invalid; Figma shows the text for state=invalid.
const error = state === 'invalid' ? instance.getString('error') : undefined
const value = state === 'filled' ? instance.getString('value') : undefined

// Options come from the Select / Option templates inside the swapped-in Select / Menu.
const options = instance
  .findConnectedInstances((node) => node.codeConnectId() === 'select-option', { traverseInstances: true })
  .map((option) => option.executeTemplate().metadata?.props)
  .flatMap((props) => (props ? [props] : []))
  .map((props) => `{ value: "${props.value}", label: "${props.label}"${props.disabled ? ', disabled: true' : ''} }`)
const optionsCode = options.length ? `[${options.join(', ')}]` : 'options'

export default {
  example: figma.code`<Select label="${label}"${hideLabel ? ' hideLabel' : ''} options={${optionsCode}}${placeholder ? ` placeholder="${placeholder}"` : ''}${value ? ` defaultValue="${value}"` : ''}${hint ? ` hint="${hint}"` : ''}${error ? ` error="${error}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { Select } from "@lockin/react"'],
  id: 'select',
  metadata: { nestable: true },
}
