Dialog that interrupts the current task for a focused decision or short form (confirm delete, edit score). Becomes a bottom sheet on small screens.

Atomic level: organism.

## Variants

- `dialog`: Standard modal with form or content.
- `alertdialog`: Confirmation requiring an explicit choice. Use when: Destructive or irreversible actions.
- `fullscreen`: Takes the whole viewport. Use when: Complex editors on mobile.

## Example

```jsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  role="alertdialog"
  title="Delete Team Rockets?"
  description="Their match history will be removed. This can't be undone."
  footer={<>
    <Button variant="secondary" onClick={() => setOpen(false)}>Keep team</Button>
    <Button variant="danger" onClick={deleteTeam}>Delete team</Button>
  </>}
/>
```

## Do

- Use a clear title that states the question or task ('Delete Team Rockets?').
- Label buttons with the outcome ('Delete team' / 'Keep team'), not 'Yes/No'.
- Keep content short; use a page for long flows.

## Don't

- Don't stack modals on top of modals.
- Don't use for non-critical info — use inline messages.
- Don't hide the close affordance without another clear way out.

## Related components

- `Button`: Footer actions.
- `Dropdown`: Often triggers confirmations.

## Accessibility

- Role: `dialog / alertdialog (native <dialog> opened with showModal()) / RN Modal with accessibilityViewIsModal`.
- Keyboard: Tab / Shift+Tab Cycle through focusable elements inside the dialog only.; Escape Close (calls onClose)..
- Focus: Focus moves into the dialog on open and returns to the triggering element on close.
- Don't open modals automatically on page load (IBM 3.2.1 On Focus / unexpected context change).
