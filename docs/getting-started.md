# Getting started

> Install Lock In in a web (React) or mobile (React Native / Expo) project, apply light/dark mode, and connect your AI agent.

Lock In ships as five packages:

| Package | What it is | Platforms |
| --- | --- | --- |
| `@lockin/tokens` | Color, typography, spacing, radius, shadow, motion tokens. CSS variables, JS/TS objects, React Native values, JSON. | Web + native |
| `@lockin/icons` | Icon path data (24×24 stroke icons). | Web + native |
| `@lockin/react` | React components + one stylesheet. | Web |
| `@lockin/react-native` | The same components for iOS/Android, same props wherever possible. | Native |
| `@lockin/specs` | AI-readable JSON spec for every component. | Any |

![How the packages fit together: apps consume the React or React Native package; everything converges on tokens and icons.](./diagrams/package-map.svg)

More diagrams: [Architecture](./architecture.md).

## 1. Build the packages

From the design system repo:

```bash
npm install
npm run build        # tokens → icons → specs → react → react-native
```

The token build also runs the contrast checker; it fails if any semantic color pair drops below WCAG AA.

## 2. Use it in a project

The packages aren't published to npm yet. Pick one:

- Local link (fastest while iterating): in your project, `npm install ../path/to/design-system/packages/react ../path/to/design-system/packages/tokens`
- Git dependency / GitHub Packages: publish the `packages/*` folders to a private registry and install by version.

### Web (React: Vite, Next.js, etc.)

```tsx
// main.tsx — import tokens first, then component styles
import '@lockin/tokens/css';
import '@lockin/tokens/css/typography'; // optional .ds-text-* utility classes
import '@lockin/react/styles.css';

import { Button, InputField, setColorMode } from '@lockin/react';

export function JoinForm() {
  return (
    <form>
      <InputField label="Team name" required hint="3–24 characters" />
      <Button type="submit" variant="primary">Join tournament</Button>
    </form>
  );
}
```

`@lockin/react` targets bundlers (Vite, Next.js, webpack, Metro). It's ESM with extensionless internal imports.

Color mode. Dark mode follows the OS by default (`prefers-color-scheme`). To let users choose:

```ts
setColorMode('dark');   // or 'light' | 'system' — saved to localStorage
```

To avoid a flash of the wrong theme, add this to `<head>` before your CSS:

```html
<script>
  try { const m = localStorage.getItem('ds-color-mode'); if (m === 'light' || m === 'dark') document.documentElement.dataset.theme = m; } catch {}
</script>
```

Styling your own UI. Use the CSS variables, never raw hex values:

```css
.scoreboard {
  background: var(--ds-color-surface-default);
  color: var(--ds-color-text-primary);
  padding: var(--ds-space-lg);
  border-radius: var(--ds-radius-lg);
  font: var(--ds-typography-heading-md);
}
```

In CSS-in-JS, use the `cssVars` export so values stay theme-aware: `import { cssVars } from '@lockin/tokens'; cssVars.color.text.primary // "var(--ds-color-text-primary)"`.

### Mobile (React Native / Expo)

```bash
npx expo install react-native-svg
```

```tsx
import { ThemeProvider, Button, useTheme } from '@lockin/react-native';

export default function App() {
  return (
    <ThemeProvider mode="system" /* theme="arena" */>
      <Home />
    </ThemeProvider>
  );
}

function Home() {
  const { t } = useTheme(); // resolved tokens for the active mode
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background.default, padding: t.space.md }}>
      <Button onPress={startMatch}>Start match</Button>
    </View>
  );
}
```

Native tokens are plain numbers (`t.space.md === 16`) and RN-ready shadow objects (`...t.shadow.md`).

## 3. Connect your AI agent

The hub server exposes everything over MCP. See [MCP server & API](./mcp-server.md). For Claude Code, the repo includes a `.mcp.json`; from the repo root:

```bash
claude mcp list   # should show "lockin"
```

In another project, add:

```json
{
  "mcpServers": {
    "lockin": { "command": "npx", "args": ["tsx", "C:/path/to/design-system/apps/server/src/stdio.ts"] }
  }
}
```

Agents then call `search_design_system`, `get_component`, `get_tokens` and `check_contrast` instead of guessing.

## Next

- [Tokens](./tokens.md): what each token is for
- [Components](./components.md): conventions shared by every component
- [Theming](./theming.md): re-skin per project without losing consistency
- [Accessibility](./accessibility.md): the rules every screen must meet
