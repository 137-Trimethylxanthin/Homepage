<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import AddressBar from "./AddressBar.svelte";
  import Topbar from "./Topbar.svelte";
  import WebControls from "./WebControls.svelte";

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
  const loadingMarkup = getLoadingMarkup(initialAddress);

  let currentAddress = $state(initialAddress);
  let pageContent = $state(loadingMarkup);
  let loadError = $state<string | null>(null);
  let loadRequestId = 0;

  onMount(() => {
    void loadPageContent(initialAddress);
  });

  function handleAddressChange(address: string): void {
    void loadPageContent(address);
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

  function getLoadingMarkup(address: string): string {
    return `
      <div class="flex h-full flex-col justify-center gap-2 text-sm">
        <p class="font-bold">Loading page</p>
        <p>${escapeHtml(address)}</p>
      </div>
    `;
  }

  function getErrorMarkup(message: string): string {
    return `
      <div class="flex h-full flex-col justify-center gap-2 text-sm">
        <p class="font-bold">Navigation error</p>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function loadPageContent(address: string): Promise<void> {
    const nextAddress = normalizeAddress(address);
    const requestId = ++loadRequestId;

    currentAddress = nextAddress;
    loadError = null;
    pageContent = getLoadingMarkup(nextAddress);

    try {
      const response = await fetch(nextAddress, {
        headers: {
          Accept: "text/html",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${nextAddress} (${response.status}).`);
      }

      const html = await response.text();
      const document = new DOMParser().parseFromString(html, "text/html");
      const bodyContent = document.body?.innerHTML ?? html;

      if (requestId !== loadRequestId) {
        return;
      }

      pageContent = bodyContent;
    } catch (error) {
      if (requestId !== loadRequestId) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unknown navigation error.";

      loadError = message;
      pageContent = getErrorMarkup(message);
      console.error(error);
    }
  }
</script>

<Topbar />

<WebControls />

<AddressBar bind:address={currentAddress} {handleAddressChange} />

<div
  class="m-1 flex min-h-0 flex-1 flex-col overflow-auto bg-white p-4 win95-sunken"
>
  {@html pageContent}
</div>
