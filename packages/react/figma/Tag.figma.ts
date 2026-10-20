// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=5-893
// source=packages/react/src/components/Tag/Tag.tsx
// component=Tag
import figma from 'figma'
const instance = figma.selectedInstance

const children = instance.getString('children')
const tone = instance.getEnum('tone', { neutral: 'neutral', brand: 'brand', info: 'info', success: 'success', warning: 'warning', danger: 'danger' })
const variant = instance.getEnum('variant', { subtle: 'subtle', solid: 'solid', outline: 'outline' })
const size = instance.getEnum('size', { md: 'md', sm: 'sm' })
const onRemove = instance.getBoolean('onRemove')

const swap = instance.getBoolean('showIcon') ? instance.getInstanceSwap('icon') : null
const icon = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().metadata?.props?.iconName : undefined

export default {
  example: figma.code`<Tag${tone !== 'neutral' ? ` tone="${tone}"` : ''}${variant !== 'subtle' ? ` variant="${variant}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${icon ? ` icon="${icon}"` : ''}${onRemove ? ' onRemove={() => {}}' : ''}>${children}</Tag>`,
  imports: ['import { Tag } from "@lockin/react"'],
  id: 'tag',
  metadata: { nestable: true },
}
