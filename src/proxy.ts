/**
 * A stdio MCP server that forwards every tool request to the hosted GenReady
 * MCP endpoint.
 *
 * The tools live in one place (the hosted server). This package only bridges
 * clients that launch local commands, so a tool added or fixed on the server
 * reaches stdio users without a new release.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

export interface ProxyInfo {
  name: string;
  version: string;
}

/** Opens a connected client to the hosted endpoint. Called lazily, retried after a failure. */
export type UpstreamFactory = () => Promise<Client>;

const MAX_REASON_LENGTH = 200;

function connectionHint(err: unknown): string {
  const reason = (err instanceof Error ? err.message : String(err)).slice(0, MAX_REASON_LENGTH);
  return (
    `Could not connect to GenReady (${reason}). ` +
    'Check that GENREADY_API_KEY is set to a valid key from https://genready.ai/api-keys and that genready.ai is reachable. ' +
    'Retry once; if it fails again, stop and tell the user.'
  );
}

export function createProxyServer(connectUpstream: UpstreamFactory, info: ProxyInfo): Server {
  let upstream: Promise<Client> | null = null;

  const getUpstream = (): Promise<Client> => {
    if (!upstream) {
      upstream = connectUpstream().catch((err: unknown) => {
        upstream = null; // do not cache a failed connection
        throw err;
      });
    }
    return upstream;
  };

  const server = new Server(info, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    let client: Client;
    try {
      client = await getUpstream();
    } catch (err) {
      throw new McpError(ErrorCode.InternalError, connectionHint(err));
    }
    return client.listTools(request.params);
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    let client: Client;
    try {
      client = await getUpstream();
    } catch (err) {
      return { content: [{ type: 'text' as const, text: connectionHint(err) }], isError: true };
    }
    return client.callTool(request.params);
  });

  return server;
}
