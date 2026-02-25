<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    title = "Application",
    titleIconSrc = "",
    titleIconAlt = "",
    minimizeLabel = "0",
    maximizeLabel = "1",
    closeLabel = "r",
    minimizeAriaLabel = "Minimize window",
    maximizeAriaLabel = "Maximize window",
    closeAriaLabel = "Close window",
  }: {
    children?: Snippet;
    title?: string;
    titleIconSrc?: string;
    titleIconAlt?: string;
    minimizeLabel?: string;
    maximizeLabel?: string;
    closeLabel?: string;
    minimizeAriaLabel?: string;
    maximizeAriaLabel?: string;
    closeAriaLabel?: string;
  } = $props();
</script>

<section
  class="mx-auto mt-8 flex h-[78vh] w-full max-w-5xl flex-col bg-[#c0c0c0] p-[2px] win95-raised"
>
  <header
    class="flex items-center justify-between bg-[#000080] px-2 py-1 text-white"
  >
    <div class="flex items-center gap-2">
      {#if titleIconSrc}
        <img src={titleIconSrc} alt={titleIconAlt} class="size-5" />
      {/if}
      <p class="title-text text-[15px] leading-none">{title}</p>
    </div>
    <div class="flex items-center gap-1">
      <button type="button" aria-label={minimizeAriaLabel} class="window-icon"
        >{minimizeLabel}</button
      >
      <button type="button" aria-label={maximizeAriaLabel} class="window-icon"
        >{maximizeLabel}</button
      >
      <button type="button" aria-label={closeAriaLabel} class="window-icon"
        >{closeLabel}</button
      >
    </div>
  </header>
  {@render children?.()}
</section>
