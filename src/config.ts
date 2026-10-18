/**
 * Environment configuration for the stdio proxy.
 *
 *   GENREADY_API_KEY  required
 *   GENREADY_MCP_URL  optional, the hosted MCP endpoint (default https://genready.ai/mcp)
 *   GENREADY_API_URL  optional, legacy: its origin is used when GENREADY_MCP_URL is unset
 */
export const PACKAGE_VERSION = '1.2.1';
export const DEFAULT_MCP_URL = 'https://genready.ai/mcp';

export interface ProxyConfig {
  apiKey: string;
  mcpUrl: URL;
}

export type ConfigResult = { ok: true; config: ProxyConfig } | { ok: false; error: string };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function resolveConfig(env: Record<string, string | undefined>): ConfigResult {
  const apiKey = env.GENREADY_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: 'GENREADY_API_KEY is required. Create a key at https://genready.ai/api-keys.',
    };
  }

  let mcpUrl: URL;
  try {
    if (env.GENREADY_MCP_URL) {
      mcpUrl = new URL(env.GENREADY_MCP_URL);
    } else if (env.GENREADY_API_URL) {
      mcpUrl = new URL('/mcp', new URL(env.GENREADY_API_URL).origin);
    } else {
      mcpUrl = new URL(DEFAULT_MCP_URL);
    }
  } catch {
    return { ok: false, error: 'GENREADY_MCP_URL (or GENREADY_API_URL) is not a valid URL.' };
  }

  // The API key travels in a header on every request.
  const isLocalHttp = mcpUrl.protocol === 'http:' && LOCAL_HOSTS.has(mcpUrl.hostname);
  if (mcpUrl.protocol !== 'https:' && !isLocalHttp) {
    return {
      ok: false,
      error: `Refusing to send the API key to ${mcpUrl.origin}: use https (plain http is allowed only for localhost).`,
    };
  }

  return { ok: true, config: { apiKey, mcpUrl } };
}
