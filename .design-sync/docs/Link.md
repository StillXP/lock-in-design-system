Navigates to another page, screen, section or external URL. Underlined so it is identifiable without color.

Atomic level: atom.

## Variants

- `inline`: Underlined link within text. Use when: Links inside paragraphs and help text.
- `standalone`: Bolder, no underline until hover, trailing chevron. Use when: 'View all matches' at the end of a card.
- `subtle`: Secondary text color, underlined. Use when: Footers, legal text, metadata.

## Example

```jsx
<p>Read the <Link href="/rules">tournament rules</Link> before registering.</p>
<Link href="https://fifa.com" external>Official rules</Link>
<Link as={NextLink} href="/brackets" variant="standalone">View brackets</Link>
```

## Do

- Write link text that makes sense out of context.
- Use Link for anything that changes the URL or screen.
- Mark external links with external.

## Don't

- Don't use 'click here' or 'read more' without context.
- Don't style a Link like a Button for in-page actions; use Button.
- Don't remove the underline from inline links.

## Related components

- `Button`: Actions that don't navigate.
- `Tabs`: Switching views within the same page.

## Accessibility

- Role: `link (native <a href>) / accessibilityRole="link"`.
- Keyboard: Tab / Shift+Tab Move focus.; Enter Follow the link..
- Focus: Visible focus ring; underline remains.
- Always warn users when a link opens a new window (IBM 3.2.5 / G201).
