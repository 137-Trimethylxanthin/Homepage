import type { APIRoute } from "astro";

export const prerender = false;

const IGNORABLE_PROTOCOL_PATTERN = /^(?:blob|data|javascript|mailto|tel):/i;
const PAGE_ROOT_COMBINATION_PATTERN = /\bhtml\s*[>+~ ]\s*body\b|\bbody\s*[>+~ ]\s*html\b/gi;
const PAGE_ROOT_TOKEN_PATTERN =
  /(^|[\s>+~,(])(:root|html|body)(?=($|[\s>+~.#[:]))/g;

function isHttpUrl(address: string): boolean {
  return /^https?:\/\//i.test(address);
}

function resolveReferenceUrl(value: string, baseUrl: string): string | null {
  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    trimmedValue.startsWith("#") ||
    IGNORABLE_PROTOCOL_PATTERN.test(trimmedValue)
  ) {
    return null;
  }

  try {
    return new URL(trimmedValue, baseUrl).toString();
  } catch {
    return null;
  }
}

function createProxyUrl(
  target: string,
  options: {
    scope?: string | null;
  } = {},
): string {
  const params = new URLSearchParams({ url: target });

  if (options.scope) {
    params.set("scope", options.scope);
  }

  return `/api/proxy?${params.toString()}`;
}

function scopeCssRootSelectors(cssText: string, scopeSelector: string): string {
  return cssText.replace(
    /(^|[{}])\s*([^@{}][^{}]*)\{/g,
    (fullMatch, prefix: string, selectorGroup: string) => {
      const scopedSelectors = selectorGroup
        .split(",")
        .map((selector) => scopeCssSelector(selector, scopeSelector))
        .join(", ");

      return `${prefix}${scopedSelectors}{`;
    },
  );
}

function scopeCssSelector(selector: string, scopeSelector: string): string {
  const trimmedSelector = selector.trim();

  if (!trimmedSelector) {
    return trimmedSelector;
  }

  return trimmedSelector
    .replace(PAGE_ROOT_COMBINATION_PATTERN, scopeSelector)
    .replace(
      PAGE_ROOT_TOKEN_PATTERN,
      (fullMatch, prefix: string) => `${prefix}${scopeSelector}`,
    );
}

function rewriteCssText(
  cssText: string,
  baseUrl: string,
  scopeSelector?: string | null,
): string {
  const rewrittenUrls = cssText
    .replace(
      /url\(\s*(['"]?)(.*?)\1\s*\)/gi,
      (fullMatch, quote: string, url: string) => {
        const resolvedUrl = resolveReferenceUrl(url, baseUrl);

        if (!resolvedUrl) {
          return fullMatch;
        }

        const wrapper = quote || '"';

        return `url(${wrapper}${createProxyUrl(resolvedUrl)}${wrapper})`;
      },
    )
    .replace(
      /@import\s+(["'])(.*?)\1/gi,
      (fullMatch, quote: string, url: string) => {
        const resolvedUrl = resolveReferenceUrl(url, baseUrl);

        if (!resolvedUrl) {
          return fullMatch;
        }

        return `@import ${quote}${createProxyUrl(resolvedUrl, {
          scope: scopeSelector,
        })}${quote}`;
      },
    );

  return scopeSelector
    ? scopeCssRootSelectors(rewrittenUrls, scopeSelector)
    : rewrittenUrls;
}

async function proxyRequest(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("url")?.trim();
  const scope = requestUrl.searchParams.get("scope")?.trim();

  if (!target) {
    return new Response("Missing url parameter.", { status: 400 });
  }

  if (!isHttpUrl(target)) {
    return new Response("Only http and https URLs are supported.", {
      status: 400,
    });
  }

  try {
    const upstreamHeaders = new Headers();
    const accept = request.headers.get("accept");
    const contentType = request.headers.get("content-type");
    const requestBody =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    if (accept) {
      upstreamHeaders.set("accept", accept);
    }

    if (contentType && requestBody) {
      upstreamHeaders.set("content-type", contentType);
    }

    const upstreamResponse = await fetch(target, {
      method: request.method,
      headers: upstreamHeaders,
      body: requestBody,
      redirect: "follow",
    });
    const upstreamContentType =
      upstreamResponse.headers.get("content-type") ||
      "application/octet-stream";
    const responseHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": upstreamContentType,
      "X-Proxy-Final-Url": upstreamResponse.url || target,
    });

    if (upstreamContentType.includes("text/css")) {
      const body = rewriteCssText(
        await upstreamResponse.text(),
        upstreamResponse.url || target,
        scope,
      );

      return new Response(body, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });
    }

    if (
      upstreamContentType.startsWith("text/") ||
      upstreamContentType.includes("json") ||
      upstreamContentType.includes("xml") ||
      upstreamContentType.includes("javascript")
    ) {
      return new Response(await upstreamResponse.text(), {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });
    }

    return new Response(await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : String(error), {
      status: 502,
    });
  }
}

export const GET: APIRoute = ({ request }) => proxyRequest(request);
export const POST: APIRoute = ({ request }) => proxyRequest(request);
