<script lang="ts">
  let {
    status = "Done",
    url = "",
  }: {
    status?: string;
    url?: string;
  } = $props();
</script>

<div
  class="flex items-center justify-between border-t border-[#9f9f9f] bg-[#c0c0c0] px-2 py-px text-xs win95-sunken"
  style="font-family: M95, W95FA, 'MS Sans Serif', 'Segoe UI', sans-serif;"
>
  <span class="truncate">{status}</span>
  {#if url}
    <span class="ml-4 max-w-[50%] shrink-0 truncate text-right">{url}</span>
  {/if}
</div>
