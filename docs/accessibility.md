# Accessibility

> Lock In targets WCAG 2.1 Level AA, aligned with the IBM Accessibility Requirements. What the system guarantees, what you are still responsible for, and how to test.

**References**
- W3C WCAG 2.1 quick reference: https://www.w3.org/WAI/WCAG21/quickref/
- IBM Accessibility Requirements: https://www.ibm.com/able/requirements/requirements/ — IBM's checklist adopts WCAG 2.1 AA (plus EN 301 549 and US Section 508 items), so requirement numbers below match both.
- WAI-ARIA Authoring Practices (patterns for Tabs, Menu Button, Dialog, Switch): https://www.w3.org/WAI/ARIA/apg/

## What the system guarantees

| Area | Guarantee | WCAG / IBM |
| --- | --- | --- |
| Text contrast | Every semantic text/background pair ≥ 4.5:1 in light and dark, in every theme. Enforced by `npm run check:contrast` and by the hub on every token edit. | 1.4.3 |
| Non-text contrast | Form control borders (`border.strong`), focus rings, icons and selected indicators ≥ 3:1. | 1.4.11 |
| Not color alone | Status tags include icons; errors include an icon and text; links are underlined; selected tabs use an indicator bar and weight; toggles show a glyph. | 1.4.1 |
| Resize & reflow | Font sizes are rem; layouts reflow to 320px; DataTable can stack into cards. | 1.4.4, 1.4.10 |
| Text spacing | No fixed heights on text containers; body line height 1.5. | 1.4.12 |
| Keyboard | Every component is fully operable by keyboard following WAI-ARIA patterns (see each spec's `accessibility.keyboard`). | 2.1.1, 2.1.2 |
| Focus visible | 2px `color.focus.ring` outline with 2px offset on `:focus-visible`; never removed. | 2.4.7 |
| Focus order & management | Modal moves focus in and returns it; Dropdown returns focus to its trigger; Tabs use roving tabindex. | 2.4.3 |
| Target size | Hit areas ≥ 44×44px on touch (exceeds 2.5.8's 24px and meets 2.5.5 AAA). | 2.5.5 |
| Name, role, value | Native elements first (`button`, `input`, `select`, `dialog`, `table`); ARIA only where needed (`role="switch"`, `menu`, `tablist`). | 4.1.2 |
| Labels | Form components require `label`; hint/error linked via `aria-describedby`. | 1.3.1, 3.3.2 |
| Errors | `error` sets `aria-invalid`, shows text explaining the fix. | 3.3.1, 3.3.3 |
| Status messages | DataTable announces sorting via a polite live region. | 4.1.3 |
| Motion | Durations become 0ms with `prefers-reduced-motion`; native sheets honor Reduce Motion. | 2.3.3 |
| High contrast | `forced-colors` styles keep boundaries and selection visible in Windows High Contrast. | 1.4.11 |
| Native | All RN components set `accessibilityRole`, `accessibilityState`, labels/hints, and 44pt targets. | 4.1.2, 2.5.5 |

## What you are responsible for

The system can't know your content. On every screen:

1. **Page structure** — one `<h1>`, headings in order, landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`). (1.3.1, 2.4.6)
2. **Page title & language** — a unique `<title>` and `<html lang="en">`. (2.4.2, 3.1.1)
3. **Skip link** — "Skip to main content" as the first focusable element. (2.4.1)
4. **Alt text** — meaningful images get `alt`; decorative images get `alt=""`. Icons are decorative unless given `label`. (1.1.1)
5. **Link and button text** — describes the destination/action out of context ("View Group A standings", not "Click here"). (2.4.4)
6. **Input purpose** — set `autoComplete` on personal-data fields (`email`, `name`, `tel`, `street-address`). (1.3.5)
7. **Error summary** — on submit, move focus to the first invalid field or an error summary. (3.3.1)
8. **Live updates** — announce async results ("12 matches found", "Score saved") with `aria-live="polite"` / `accessibilityLiveRegion`. Scores updating in real time should not announce every tick. (4.1.3)
9. **Timeouts** — games and checkouts with time limits must let users extend or turn them off. (2.2.1)
10. **Flashing** — nothing flashes more than 3 times per second (watch game effects and confetti). (2.3.1)
11. **Custom colors** — any color pairing not in `contrast-pairs.json` must be checked (`GET /api/contrast` or MCP `check_contrast`). Data-viz series also need labels or patterns.
12. **Consistent navigation** — same navigation in the same order across pages. (3.2.3, 3.2.4)

## Implementation rules

- Prefer native HTML elements over ARIA. A `<button>` is always better than `<div role="button">`.
- Never remove the focus outline. If it clashes, adjust `color.focus.ring` in the theme.
- Don't put interactive elements inside other interactive elements (a button inside a link).
- `hideLabel` instead of omitting labels.
- Don't open modals on page load or on focus. Don't change context on input (`Select` must not navigate). (3.2.1, 3.2.2)
- On React Native, group related text into a single accessible element (`accessible` + `accessibilityLabel`) so screen readers don't read fragments.

## Testing checklist

Run before shipping a screen:

- [ ] **Keyboard only**: Tab through everything. Every control reachable, operable, focus always visible, nothing trapped, order logical.
- [ ] **Screen reader**: NVDA + Firefox or JAWS + Chrome (Windows), VoiceOver + Safari (macOS/iOS), TalkBack (Android). Names, roles and states announced correctly.
- [ ] **Zoom to 200%** and a **320px-wide viewport**: no loss of content, no horizontal scroll except data tables.
- [ ] **Dark mode** and **every theme you use**.
- [ ] **Windows High Contrast** (forced colors).
- [ ] **Reduced motion** on.
- [ ] **Automated**: axe DevTools or IBM Equal Access Accessibility Checker (browser extension) — fix all violations, review "needs review" items.
- [ ] **Mobile**: iOS Accessibility Inspector / Android Accessibility Scanner; dynamic type at the largest size.

Automated tools catch roughly a third of issues. The manual checks above are not optional.

## Reporting issues

Found an accessibility gap? Fix it in the spec or token mapping right away — accessibility bugs take priority over new features.
