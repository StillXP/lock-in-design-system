// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=4-232
// source=packages/react/src/components/Icon/Icon.tsx
// component=Icon
import figma from 'figma'

export default {
  example: figma.code`<Icon name="cart" />`,
  imports: ['import { Icon } from "@lockin/react"'],
  id: 'icon-cart',
  metadata: { nestable: true, props: { iconName: 'cart' } },
}
