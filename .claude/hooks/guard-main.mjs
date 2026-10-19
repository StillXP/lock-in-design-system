// PreToolUse hook (Bash/PowerShell): keeps commits and pushes off `main`.
// Work happens on a branch and lands through a pull request (see AGENTS.md, "Git workflow").
import { execFileSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { tool_input: toolInput = {}, cwd } = JSON.parse(input || '{}');

// Drop quoted text (commit messages, heredocs) so words inside them are not mistaken for git commands,
// then look at each statement on its own.
const statements = String(toolInput.command ?? '')
  .replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""')
  .split(/&&|\|\||[;|\n]/)
  .map((s) => s.trim());

const deny = (reason) => {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
};

let branch;
const onMain = () => {
  branch ??= (() => {
    try {
      return execFileSync('git', ['branch', '--show-current'], { cwd, encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  })();
  return ['main', 'master'].includes(branch);
};

for (const s of statements) {
  const sub = s.match(/^git\s+(?:-\S+\s+)*(push|commit|merge|rebase)\b/)?.[1];
  if (!sub) continue;
  if (sub === 'push') {
    if (/--force\b|--force-with-lease\b|(^|\s)-f(\s|$)/.test(s)) {
      deny('Blocked: no force pushes. Ask the user if one is really needed.');
    }
    const targetsMain = /(^|[\s:])(main|master)(\s|$)/.test(s);
    const noRemoteRef = !/\borigin\s+\S+/.test(s);
    if (targetsMain || (noRemoteRef && onMain())) {
      deny('Blocked: do not push to main. Push a branch and open a PR (gh pr create).');
    }
  } else if (onMain()) {
    deny('Blocked: you are on main. Create a branch first (git checkout -b type/short-description).');
  }
}
