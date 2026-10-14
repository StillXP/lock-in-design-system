// MCP over stdio for local agents (Claude Code, Cursor, etc.).
// Runs as the local user, so it is granted DS_STDIO_ROLE (default: editor).
// IMPORTANT: stdout carries the protocol — log only to stderr.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config.js';
import { openDb } from './db.js';
import { createMcpServer } from './mcp.js';
import { DesignSystemStore } from './store.js';

const db = openDb(config.dataDir);
const store = new DesignSystemStore(db);
const server = createMcpServer(store, db, { id: 'local', name: process.env.USER ?? process.env.USERNAME ?? 'local', role: config.stdioRole });

await server.connect(new StdioServerTransport());
console.error(`Lock In MCP (stdio) ready — role: ${config.stdioRole}`);
