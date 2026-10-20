// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=8-137
// source=packages/react/src/components/Search/Search.tsx
// component=Search
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const showLabel = instance.getBoolean('showLabel')
const placeholder = instance.getString('placeholder')
const size = instance.getEnum('size', { md: 'md', sm: 'sm', lg: 'lg' })
const state = instance.getEnum('state', {
  empty: 'empty',
  filled: 'filled',
  focus: 'focus',
  loading: 'loading',
  disabled: 'disabled',
})
const value = state === 'filled' ? instance.getString('value') : undefined

export default {
  example: figma.code`<Search${showLabel ? ` label="${label}" showLabel` : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${value ? ` defaultValue="${value}"` : ''}${state === 'loading' ? ' loading' : ''}${state === 'disabled' ? ' disabled' : ''} />`,
  imports: ['import { Search } from "@lockin/react"'],
  id: 'search',
  metadata: { nestable: true },
}
