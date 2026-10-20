// url=https://www.figma.com/design/1dgB7LeRgTrVIenTmmrlvr/Lock-In?node-id=13-254
// source=packages/react/src/components/Modal/Modal.tsx
// component=Modal
import figma from 'figma'
const instance = figma.selectedInstance

const title = instance.getString('title')
const description = instance.getBoolean('showDescription') ? instance.getString('description') : undefined
const hideCloseButton = !instance.getBoolean('showCloseButton')
const role = instance.getEnum('role', { dialog: 'dialog', alertdialog: 'alertdialog' })
// bottomSheet is automatic below 640px in code, so it is not a size.
const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', bottomSheet: 'md' })

// The body and the two footer buttons are nested instances, rendered through their own templates.
const swap = instance.getBoolean('showChildren') ? instance.getInstanceSwap('children') : null
const body = swap && swap.type === 'INSTANCE' ? swap.executeTemplate().example : undefined
const secondary = instance.findInstance('Secondary action')
const secondaryCode = secondary && secondary.type === 'INSTANCE' ? secondary.executeTemplate().example : undefined
const primary = instance.findInstance('Primary action')
const primaryCode = primary && primary.type === 'INSTANCE' ? primary.executeTemplate().example : undefined

export default {
  example: figma.code`<Modal open onClose={() => {}} title="${title}"${description ? ` description="${description}"` : ''}${role !== 'dialog' ? ` role="${role}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${hideCloseButton ? ' hideCloseButton' : ''} footer={<>${secondaryCode}${primaryCode}</>}>${body}</Modal>`,
  imports: ['import { Modal } from "@lockin/react"'],
  id: 'modal',
  metadata: { nestable: true },
}
