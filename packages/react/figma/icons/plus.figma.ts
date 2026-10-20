// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=4-22
// source=packages/react/src/components/Icon/Icon.tsx
// component=Icon
import figma from 'figma'

export default {
  example: figma.code`<Icon name="plus" />`,
  imports: ['import { Icon } from "@lockin/react"'],
  id: 'icon-plus',
  metadata: { nestable: true, props: { iconName: 'plus' } },
}
