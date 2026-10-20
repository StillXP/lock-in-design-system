// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=5-604
// source=packages/react/src/components/Link/Link.tsx
// component=Link
import figma from 'figma'
const instance = figma.selectedInstance

const children = instance.getString('children')
const variant = instance.getEnum('variant', { inline: 'inline', standalone: 'standalone', subtle: 'subtle' })
const external = instance.getBoolean('external')

export default {
  example: figma.code`<Link href="/"${variant !== 'inline' ? ` variant="${variant}"` : ''}${external ? ' external' : ''}>${children}</Link>`,
  imports: ['import { Link } from "@lockin/react"'],
  id: 'link',
  metadata: { nestable: true },
}
