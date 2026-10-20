// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=5-543
// source=packages/react/src/components/Button/Button.tsx
// component=Button
import figma from 'figma'
const instance = figma.selectedInstance

const variant = instance.getEnum('variant', { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', danger: 'danger' })
const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' })
const state = instance.getEnum('state', { default: 'default', hover: 'hover', pressed: 'pressed', disabled: 'disabled', loading: 'loading' })

// In state=loading the icon is the spinner, so there is no name to read.
const swap = instance.getInstanceSwap('iconStart')
const icon = state !== 'loading' && swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

export default {
  example: figma.code`<Button iconOnly${icon ? ` iconStart="${icon}"` : ''} aria-label="Describe the action"${variant !== 'primary' ? ` variant="${variant}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${state === 'disabled' ? ' disabled' : ''}${state === 'loading' ? ' loading' : ''} />`,
  imports: ['import { Button } from "@lockin/react"'],
  id: 'button-icon-only',
  metadata: { nestable: true },
}
