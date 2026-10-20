// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=6-400
// source=packages/react/src/components/RadioGroup/RadioGroup.tsx
// component=RadioGroup
import figma from 'figma'
const instance = figma.selectedInstance

const legend = instance.getString('legend')
const orientation = instance.getEnum('orientation', { vertical: 'vertical', horizontal: 'horizontal' })
const value = instance.getEnum('value', { home: 'home', away: 'away', neutral: 'neutral' })
const error = instance.getBoolean('showError') ? instance.getString('error') : undefined

// Options come from the Radio templates. Figma has no option value, so it is the lowercased label.
const options = instance
  .findConnectedInstances((node) => node.codeConnectId() === 'radio', { traverseInstances: true })
  .map((radio) => radio.executeTemplate().metadata?.props)
  .flatMap((props) => (props ? [props] : []))
  .map(
    (props) =>
      `{ value: "${props.value}", label: "${props.label}"${props.description ? `, description: "${props.description}"` : ''} }`,
  )
const optionsCode = options.length ? `[${options.join(', ')}]` : 'options'

export default {
  example: figma.code`<RadioGroup legend="${legend}" options={${optionsCode}} defaultValue="${value}"${orientation !== 'vertical' ? ` orientation="${orientation}"` : ''}${error ? ` error="${error}"` : ''} />`,
  imports: ['import { RadioGroup } from "@lockin/react"'],
  id: 'radio-group',
  metadata: { nestable: true },
}
