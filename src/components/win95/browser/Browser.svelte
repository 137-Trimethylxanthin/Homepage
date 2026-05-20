<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import AddressBar from "./AddressBar.svelte";
  import Topbar from "./Topbar.svelte";
  import WebControls from "./WebControls.svelte";
  import BrowserStatusBar from "./BrowserStatusBar.svelte";

  const IGNORABLE_PROTOCOL_PATTERN = /^(?:blob|data|javascript|mailto|tel):/i;
  const STYLESHEET_SELECTOR = "link[rel~='stylesheet'][href], style";
  const PAGE_ROOT_CLASS = "browser-page-root";
  const PAGE_ROOT_SELECTOR = `.${PAGE_ROOT_CLASS}`;
  const BROWSER_FONT_STACK = `M95, W95FA, "MS Sans Serif", "Segoe UI", sans-serif`;
  const PAGE_ROOT_COMBINATION_PATTERN = /\bhtml\s*[>+~ ]\s*body\b|\bbody\s*[>+~ ]\s*html\b/gi;
  const PAGE_ROOT_TOKEN_PATTERN =
    /(^|[\s>+~,(])(:root|html|body)(?=($|[\s>+~.#[:]))/g;

  let {
    children,
    startPage = "/",
    localPaths = [],
  }: {
    children?: Snippet;
    startPage?: string;
    localPaths?: string[];
  } = $props();

  const initialAddress = (() => normalizeAddress(startPage))();

  let contentContainer: HTMLDivElement | null = null;
  let contentRoot: ShadowRoot | null = null;
  let currentAddress = $state(initialAddress);
  let currentDocumentAddress = $state(initialAddress);
  let renderedPageMarkup = "";
  let isLoading = $state(false);
  let statusMessage = $state("Done");

  let history = $state<string[]>([]);
  let historyIndex = $state(-1);
  let canGoBack = $derived(historyIndex > 0);
  let canGoForward = $derived(historyIndex < history.length - 1);

  onMount(() => {
    if (contentContainer) {
      contentRoot =
        contentContainer.shadowRoot || contentContainer.attachShadow({ mode: "open" });
    }

    contentRoot?.addEventListener("click", handleDocumentClick);
    contentRoot?.addEventListener("submit", handleDocumentSubmit);

    renderPageContent();
    void loadPageContent(initialAddress);

    return () => {
      contentRoot?.removeEventListener("click", handleDocumentClick);
      contentRoot?.removeEventListener("submit", handleDocumentSubmit);
    };
  });

  async function handleAddressChange(address: string): Promise<void> {
    await loadPageContent(address);
  }

  function goBack(): void {
    if (!canGoBack) return;
    historyIndex--;
    void loadPageContent(history[historyIndex], {}, true);
  }

  function goForward(): void {
    if (!canGoForward) return;
    historyIndex++;
    void loadPageContent(history[historyIndex], {}, true);
  }

  function normalizeAddress(address: string): string {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      return isHttpUrl(startPage) ? startPage : "/";
    }

    if (trimmedAddress.startsWith("/")) {
      return normalizeLocalPath(trimmedAddress);
    }

    if (isHttpUrl(trimmedAddress)) {
      return trimmedAddress;
    }

    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmedAddress)) {
      throw new Error(
        "Only local paths and http:// or https:// URLs are supported.",
      );
    }

    return `https://${trimmedAddress}`;
  }

  function normalizeLocalPath(path: string): string {
    if (!path || path === "/") {
      return "/";
    }

    const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;

    return withLeadingSlash.endsWith("/")
      ? withLeadingSlash.slice(0, -1)
      : withLeadingSlash;
  }

  function isHttpUrl(address: string): boolean {
    return /^https?:\/\//i.test(address);
  }

  async function loadPageContent(
    address: string,
    requestInit: RequestInit = {},
    skipHistory = false,
  ): Promise<void> {
    const normalizedAddress = normalizeAddress(address);
    const { url, init } = getPageRequest(normalizedAddress, requestInit);

    isLoading = true;
    statusMessage = "Connecting...";

    try {
      const res = await fetch(url, init);

      if (!res.ok) {
        throw new Error(`Failed to load page: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("Content-Type") || "";
      const resolvedAddress = getResolvedAddress(normalizedAddress, res);

      currentAddress = resolvedAddress;
      currentDocumentAddress = resolvedAddress;

      if (contentType.includes("text/html")) {
        const html = await res.text();
        setRenderedPageMarkup(rewriteDocumentHtml(html, resolvedAddress));
      } else {
        setRenderedPageMarkup(
          buildMessageMarkup(`Unsupported content type: ${contentType}`),
        );
      }

      if (!skipHistory) {
        history = [...history.slice(0, historyIndex + 1), resolvedAddress];
        historyIndex = history.length - 1;
      }

      statusMessage = "Page loaded";
      setTimeout(() => {
        if (statusMessage === "Page loaded") statusMessage = "Done";
      }, 2000);
    } catch (error) {
      setRenderedPageMarkup(buildErrorPageMarkup(error));
      statusMessage = "Done";
    } finally {
      isLoading = false;
    }
  }

  function getPageRequest(
    address: string,
    requestInit: RequestInit,
  ): { url: string; init: RequestInit } {
    if (!isHttpUrl(address)) {
      return { url: address, init: requestInit };
    }

    return {
      url: createProxyUrl(address),
      init: requestInit,
    };
  }

  function createProxyUrl(
    target: string,
    options: {
      scope?: string;
    } = {},
  ): string {
    const params = new URLSearchParams({ url: target });

    if (options.scope) {
      params.set("scope", options.scope);
    }

    return `/api/proxy?${params.toString()}`;
  }

  function getResolvedAddress(address: string, response: Response): string {
    if (!isHttpUrl(address)) {
      return address;
    }

    const finalAddress = response.headers.get("X-Proxy-Final-Url")?.trim();

    return finalAddress && isHttpUrl(finalAddress) ? finalAddress : address;
  }

  function rewriteDocumentHtml(html: string, pageUrl: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const baseUrl = getDocumentBaseUrl(document, pageUrl);
    const shouldProxyResources = isHttpUrl(pageUrl);

    for (const element of document.querySelectorAll("base")) {
      element.remove();
    }

    rewriteElementUrls(document, baseUrl, shouldProxyResources);
    rewriteDocumentCss(document, baseUrl, shouldProxyResources);

    const headMarkup = Array.from(
      document.head.querySelectorAll(STYLESHEET_SELECTOR),
    )
      .map((element) => element.outerHTML)
      .join("");

    return `${headMarkup}<div ${getPageRootAttributes(
      document,
      baseUrl,
      shouldProxyResources,
    )}>${document.body.innerHTML}</div>`;
  }

  function getDocumentBaseUrl(document: Document, fallbackUrl: string): string {
    const baseHref = document
      .querySelector("base[href]")
      ?.getAttribute("href")
      ?.trim();
    const resolvedBaseHref = baseHref
      ? resolveReferenceUrl(baseHref, fallbackUrl)
      : null;

    return resolvedBaseHref || fallbackUrl;
  }

  function rewriteElementUrls(
    document: Document,
    baseUrl: string,
    shouldProxyResources: boolean,
  ): void {
    for (const element of document.querySelectorAll("[href]")) {
      const value = element.getAttribute("href")?.trim();
      const resolvedValue = value ? resolveReferenceUrl(value, baseUrl) : null;

      if (!resolvedValue) {
        continue;
      }

      if (
        element instanceof HTMLLinkElement &&
        element.rel
          .split(/\s+/)
          .some((relValue) => relValue.toLowerCase() === "stylesheet")
      ) {
        element.setAttribute(
          "href",
          shouldProxyResources
            ? createProxyUrl(resolvedValue, { scope: PAGE_ROOT_SELECTOR })
            : resolvedValue,
        );
        continue;
      }

      element.setAttribute("href", resolvedValue);
    }

    for (const attribute of ["src", "poster", "data"]) {
      for (const element of document.querySelectorAll(`[${attribute}]`)) {
        const value = element.getAttribute(attribute)?.trim();
        const resolvedValue = value ? resolveReferenceUrl(value, baseUrl) : null;

        if (!resolvedValue) {
          continue;
        }

        element.setAttribute(
          attribute,
          shouldProxyResources ? createProxyUrl(resolvedValue) : resolvedValue,
        );
      }
    }

    for (const element of document.querySelectorAll("form[action]")) {
      const action = element.getAttribute("action")?.trim();
      const resolvedAction = action ? resolveReferenceUrl(action, baseUrl) : null;

      if (resolvedAction) {
        element.setAttribute("action", resolvedAction);
      }
    }

    for (const element of document.querySelectorAll("[srcset]")) {
      const srcset = element.getAttribute("srcset");

      if (!srcset) {
        continue;
      }

      element.setAttribute(
        "srcset",
        rewriteSrcset(srcset, baseUrl, shouldProxyResources),
      );
    }
  }

  function rewriteDocumentCss(
    document: Document,
    baseUrl: string,
    shouldProxyResources: boolean,
  ): void {
    for (const styleElement of document.querySelectorAll("style")) {
      styleElement.textContent = rewriteCssText(
        styleElement.textContent || "",
        baseUrl,
        shouldProxyResources,
        PAGE_ROOT_SELECTOR,
      );
    }

    for (const element of document.querySelectorAll("[style]")) {
      const styleValue = element.getAttribute("style");

      if (!styleValue) {
        continue;
      }

      element.setAttribute(
        "style",
        rewriteCssText(styleValue, baseUrl, shouldProxyResources),
      );
    }
  }

  function rewriteCssText(
    cssText: string,
    baseUrl: string,
    shouldProxyResources: boolean,
    scopeSelector?: string,
  ): string {
    const rewrittenUrls = cssText
      .replace(
        /url\(\s*(['"]?)(.*?)\1\s*\)/gi,
        (fullMatch, quote: string, url: string) => {
          const rewrittenUrl = rewriteCssResourceUrl(
            url,
            baseUrl,
            shouldProxyResources,
          );

          if (!rewrittenUrl) {
            return fullMatch;
          }

          const wrapper = quote || '"';

          return `url(${wrapper}${rewrittenUrl}${wrapper})`;
        },
      )
      .replace(
        /@import\s+(["'])(.*?)\1/gi,
        (fullMatch, quote: string, url: string) => {
          const resolvedUrl = resolveReferenceUrl(url, baseUrl);

          if (!resolvedUrl) {
            return fullMatch;
          }

          const rewrittenUrl = shouldProxyResources
            ? createProxyUrl(resolvedUrl, { scope: PAGE_ROOT_SELECTOR })
            : resolvedUrl;

          return `@import ${quote}${rewrittenUrl}${quote}`;
        },
      );

    return scopeSelector
      ? scopeCssRootSelectors(rewrittenUrls, scopeSelector)
      : rewrittenUrls;
  }

  function rewriteCssResourceUrl(
    url: string,
    baseUrl: string,
    shouldProxyResources: boolean,
  ): string | null {
    const resolvedUrl = resolveReferenceUrl(url, baseUrl);

    if (!resolvedUrl) {
      return null;
    }

    return shouldProxyResources ? createProxyUrl(resolvedUrl) : resolvedUrl;
  }

  function scopeCssRootSelectors(
    cssText: string,
    scopeSelector: string,
  ): string {
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

  function rewriteSrcset(
    srcset: string,
    baseUrl: string,
    shouldProxyResources: boolean,
  ): string {
    return srcset
      .split(",")
      .map((candidate) => {
        const trimmedCandidate = candidate.trim();

        if (!trimmedCandidate) {
          return trimmedCandidate;
        }

        const separatorIndex = trimmedCandidate.search(/\s/);
        const rawUrl =
          separatorIndex === -1
            ? trimmedCandidate
            : trimmedCandidate.slice(0, separatorIndex);
        const descriptor =
          separatorIndex === -1 ? "" : trimmedCandidate.slice(separatorIndex);
        const resolvedUrl = resolveReferenceUrl(rawUrl, baseUrl);

        if (!resolvedUrl) {
          return trimmedCandidate;
        }

        const rewrittenUrl = shouldProxyResources
          ? createProxyUrl(resolvedUrl)
          : resolvedUrl;

        return `${rewrittenUrl}${descriptor}`;
      })
      .join(", ");
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

  function getPageRootAttributes(
    document: Document,
    baseUrl: string,
    shouldProxyResources: boolean,
  ): string {
    const classNames = new Set([PAGE_ROOT_CLASS]);
    const rootClasses = document.documentElement.getAttribute("class");
    const bodyClasses = document.body.getAttribute("class");
    const dir =
      document.body.getAttribute("dir") ||
      document.documentElement.getAttribute("dir");
    const lang =
      document.documentElement.getAttribute("lang") ||
      document.body.getAttribute("lang");
    const styles: string[] = [];
    const rootStyle = document.documentElement.getAttribute("style")?.trim();
    const bodyStyle = document.body.getAttribute("style")?.trim();
    const bodyColor = document.body.getAttribute("bgcolor")?.trim();
    const textColor = document.body.getAttribute("text")?.trim();
    const backgroundImage = document.body.getAttribute("background")?.trim();

    for (const classListValue of [rootClasses, bodyClasses]) {
      if (!classListValue) {
        continue;
      }

      for (const className of classListValue.split(/\s+/)) {
        if (className) {
          classNames.add(className);
        }
      }
    }

    if (bodyColor) {
      styles.push(`background-color: ${bodyColor}`);
    }

    if (textColor) {
      styles.push(`color: ${textColor}`);
    }

    if (backgroundImage) {
      const resolvedBackground = resolveReferenceUrl(backgroundImage, baseUrl);

      if (resolvedBackground) {
        styles.push(
          `background-image: url("${shouldProxyResources ? createProxyUrl(resolvedBackground) : resolvedBackground}")`,
        );
      }
    }

    if (rootStyle) {
      styles.push(rootStyle);
    }

    if (bodyStyle) {
      styles.push(bodyStyle);
    }

    const attributes = [
      `class="${escapeHtmlAttribute(Array.from(classNames).join(" "))}"`,
    ];

    if (styles.length > 0) {
      attributes.push(`style="${escapeHtmlAttribute(styles.join("; "))}"`);
    }

    if (dir) {
      attributes.push(`dir="${escapeHtmlAttribute(dir)}"`);
    }

    if (lang) {
      attributes.push(`lang="${escapeHtmlAttribute(lang)}"`);
    }

    return attributes.join(" ");
  }

  function buildMessageMarkup(message: string, color = "#000"): string {
    return `<div class="${PAGE_ROOT_CLASS}" style="min-height: 100%; color: ${escapeHtmlAttribute(color)}; padding: 1rem;">${escapeHtml(
      message,
    )}</div>`;
  }

  function buildErrorPageMarkup(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return `<div class="${PAGE_ROOT_CLASS}" style="min-height:100%;background:#c0c0c0;font-family:${BROWSER_FONT_STACK};display:flex;align-items:flex-start;justify-content:center;padding:4rem 1rem;">
      <div style="background:#fff;border:2px solid #808080;padding:2rem;max-width:520px;width:100%;">
        <h2 style="font-size:14px;margin:0 0 0.75rem;font-weight:700;">The page cannot be displayed</h2>
        <p style="margin:0 0 0.75rem;line-height:1.4;">The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or you may need to adjust your browser settings.</p>
        <hr style="border:none;border-top:1px solid #808080;margin:1rem 0;">
        <p style="margin:0;font-size:11px;color:#666;">${escapeHtml(message)}</p>
      </div>
    </div>`;
  }

  function escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeHtmlAttribute(value: string): string {
    return escapeHtml(value).replaceAll('"', "&quot;");
  }

  function setRenderedPageMarkup(markup: string): void {
    renderedPageMarkup = markup;
    renderPageContent();
  }

  function renderPageContent(): void {
    if (!contentRoot) {
      return;
    }

    contentRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 100%;
        }

        .${PAGE_ROOT_CLASS} {
          min-height: 100%;
          box-sizing: border-box;
        }
      </style>
      ${renderedPageMarkup}
      <style>
        .${PAGE_ROOT_CLASS}.${PAGE_ROOT_CLASS},
        .${PAGE_ROOT_CLASS}.${PAGE_ROOT_CLASS} *,
        .${PAGE_ROOT_CLASS}.${PAGE_ROOT_CLASS} *::before,
        .${PAGE_ROOT_CLASS}.${PAGE_ROOT_CLASS} *::after {
          font-family: ${BROWSER_FONT_STACK} !important;
        }
      </style>
    `;

    enforceBrowserFontOverride();
  }

  function enforceBrowserFontOverride(): void {
    if (!contentRoot) {
      return;
    }

    const pageRoot = contentRoot.querySelector<HTMLElement>(`.${PAGE_ROOT_CLASS}`);

    if (!pageRoot) {
      return;
    }

    pageRoot.style.setProperty("font-family", BROWSER_FONT_STACK, "important");

    for (const element of pageRoot.querySelectorAll<HTMLElement>("*")) {
      element.style.setProperty("font-family", BROWSER_FONT_STACK, "important");
    }
  }

  function handleDocumentClick(event: Event): void {
    if (
      !(event instanceof MouseEvent) ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = getEventAnchor(event);

    if (
      !link ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    const href = link.getAttribute("href")?.trim();

    if (!href || href.startsWith("#")) {
      return;
    }

    const resolvedAddress = resolveNavigationAddress(href);

    if (!resolvedAddress) {
      return;
    }

    event.preventDefault();
    void loadPageContent(resolvedAddress);
  }

  function handleDocumentSubmit(event: Event): void {
    if (!(event instanceof SubmitEvent) || event.defaultPrevented) {
      return;
    }

    const form = getSubmittedForm(event);

    if (!form || (form.target && form.target !== "_self")) {
      return;
    }

    const rawAction = form.getAttribute("action")?.trim() || currentDocumentAddress;
    const resolvedAddress = resolveNavigationAddress(rawAction) || rawAction;
    const method = (form.getAttribute("method") || "GET").toUpperCase();
    const enctype = (
      form.getAttribute("enctype") || "application/x-www-form-urlencoded"
    ).toLowerCase();
    const submitter = event.submitter;
    const formData =
      submitter instanceof HTMLElement
        ? new FormData(form, submitter)
        : new FormData(form);

    event.preventDefault();

    if (method === "GET") {
      void loadPageContent(buildFormGetAddress(resolvedAddress, formData));
      return;
    }

    const { body, headers } = buildSubmitRequest(formData, enctype);

    void loadPageContent(resolvedAddress, {
      method,
      body,
      headers,
    });
  }

  function getSubmittedForm(event: SubmitEvent): HTMLFormElement | null {
    for (const target of event.composedPath()) {
      if (target instanceof HTMLFormElement) {
        return target;
      }
    }

    return null;
  }

  function buildFormGetAddress(address: string, formData: FormData): string {
    const url = address.startsWith("/")
      ? new URL(address, window.location.origin)
      : new URL(address);

    for (const [key, value] of formData.entries()) {
      url.searchParams.append(key, value instanceof File ? value.name : value);
    }

    return url.origin === window.location.origin ? toLocalAddress(url) : url.toString();
  }

  function buildSubmitRequest(
    formData: FormData,
    enctype: string,
  ): {
    body: BodyInit;
    headers?: HeadersInit;
  } {
    if (enctype === "multipart/form-data") {
      return { body: formData };
    }

    if (enctype === "text/plain") {
      const lines: string[] = [];

      for (const [key, value] of formData.entries()) {
        lines.push(`${key}=${value instanceof File ? value.name : value}`);
      }

      return {
        body: lines.join("\r\n"),
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
      };
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      searchParams.append(key, value instanceof File ? value.name : value);
    }

    return {
      body: searchParams.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    };
  }

  function getEventAnchor(event: Event): HTMLAnchorElement | null {
    for (const target of event.composedPath()) {
      if (target instanceof HTMLAnchorElement && target.hasAttribute("href")) {
        return target;
      }
    }

    return null;
  }

  function resolveNavigationAddress(href: string): string | null {
    if (IGNORABLE_PROTOCOL_PATTERN.test(href)) {
      return null;
    }

    try {
      const baseUrl = currentDocumentAddress.startsWith("/")
        ? new URL(currentDocumentAddress, window.location.origin)
        : new URL(currentDocumentAddress);
      const resolvedUrl = new URL(href, baseUrl);

      return resolvedUrl.origin === window.location.origin
        ? toLocalAddress(resolvedUrl)
        : resolvedUrl.toString();
    } catch {
      return null;
    }
  }

  function toLocalAddress(url: URL): string {
    const normalizedPath =
      url.pathname === "/"
        ? "/"
        : url.pathname.endsWith("/")
          ? url.pathname.slice(0, -1)
          : url.pathname;

    return `${normalizedPath}${url.search}${url.hash}`;
  }
</script>

<Topbar />

<WebControls {canGoBack} {canGoForward} onBack={goBack} onForward={goForward} />

<AddressBar bind:address={currentAddress} {handleAddressChange} />

<div
  bind:this={contentContainer}
  class="m-1 min-h-0 flex-1 overflow-auto win95-sunken"
></div>

<BrowserStatusBar status={statusMessage} url={isLoading ? "" : currentAddress} />
