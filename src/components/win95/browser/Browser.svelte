<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ToolbarIcon } from "../../../lib/entities";
  import AddressBar from "./AddressBar.svelte";
  import Topbar from "./Topbar.svelte";
  import WebControls from "./WebControls.svelte";

  let {
    children,
    startPage = "/",
    localPaths = ["/index", "/home", "/test"],
  }: {
    children?: Snippet;
    startPage?: string;
    localPaths?: string[];
  } = $props();

  function handleAddressChange(address: string): void {
    console.log(address);
  }
</script>

<Topbar />

<WebControls />

<AddressBar {handleAddressChange} />

<div class="m-1 flex-1 overflow-auto bg-white p-4 win95-sunken">
  {@render children?.()}
</div>
