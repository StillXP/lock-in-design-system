// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=6-343
// source=packages/react/src/components/RadioGroup/RadioGroup.tsx
// component=RadioGroup
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('label')
const description = instance.getBoolean('showDescription') ? instance.getString('description') : undefined
const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// One entry of RadioGroup's `options` array; RadioGroup reads it through metadata.
export default {
  example: figma.code`{ value: "${value}", label: "${label}"${description ? `, description: "${description}"` : ''} }`,
  id: 'radio',
  metadata: { nestable: true, props: { value, label, description } },
}
