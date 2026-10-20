// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=4-184
// source=packages/react/src/components/Icon/Icon.tsx
// component=Icon
import figma from 'figma'

export default {
  example: figma.code`<Icon name="user" />`,
  imports: ['import { Icon } from "@lockin/react"'],
  id: 'icon-user',
  metadata: { nestable: true, props: { iconName: 'user' } },
}
