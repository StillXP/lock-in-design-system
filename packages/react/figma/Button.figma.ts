// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=5-422
// source=packages/react/src/components/Button/Button.tsx
// component=Button
import figma from 'figma'
const instance = figma.selectedInstance

const children = instance.getString('children')
const variant = instance.getEnum('variant', {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  danger: 'danger',
})
const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' })

// `state` is a Figma-only axis; only disabled and loading exist as props. In the loading
// variants the icon instances are the spinner, so icons are skipped there.
const state = instance.getEnum('state', {
  default: 'default',
  hover: 'hover',
  pressed: 'pressed',
  focus: 'focus',
  disabled: 'disabled',
  loading: 'loading',
})

// Icon names come from the Icon templates' metadata (packages/react/figma/icons).
function iconName(prop: string, show: string) {
  if (state === 'loading' || !instance.getBoolean(show)) return undefined
  const icon = instance.getInstanceSwap(prop)
  if (icon && icon.type === 'INSTANCE') return icon.executeTemplate().metadata?.props?.iconName
  return undefined
}
const iconStart = iconName('iconStart', 'showIconStart')
const iconEnd = iconName('iconEnd', 'showIconEnd')

export default {
  example: figma.code`<Button${variant !== 'primary' ? ` variant="${variant}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${iconStart ? ` iconStart="${iconStart}"` : ''}${iconEnd ? ` iconEnd="${iconEnd}"` : ''}${state === 'disabled' ? ' disabled' : ''}${state === 'loading' ? ' loading' : ''}>${children}</Button>`,
  imports: ['import { Button } from "@lockin/react"'],
  id: 'button',
  metadata: { nestable: true },
}
