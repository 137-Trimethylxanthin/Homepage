<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    title = "Application",
    titleIconSrc = "",
    titleIconAlt = "",
    x = 0,
    y = 0,
    width = 800,
    height = 600,
    zIndex = 0,
    active = false,
    maximized = false,
    onMinimize,
    onMaximize,
    onClose,
    onTitleBarPointerDown,
    onTitleBarPointerMove,
    onTitleBarPointerUp,
    onResizePointerDown,
    onResizePointerMove,
    onResizePointerUp,
  }: {
    children?: Snippet;
    title?: string;
    titleIconSrc?: string;
    titleIconAlt?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zIndex?: number;
    active?: boolean;
    maximized?: boolean;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
    onTitleBarPointerDown?: (e: PointerEvent) => void;
    onTitleBarPointerMove?: (e: PointerEvent) => void;
    onTitleBarPointerUp?: (e: PointerEvent) => void;
    onResizePointerDown?: (e: PointerEvent) => void;
    onResizePointerMove?: (e: PointerEvent) => void;
    onResizePointerUp?: (e: PointerEvent) => void;
  } = $props();

  const titleBarBg = $derived(
    active
      ? "var(--theme-titlebar-active-bg)"
      : "var(--theme-titlebar-inactive-bg)"
  );
  const titleBarColor = $derived(
    active
      ? "var(--theme-titlebar-text)"
      : "var(--theme-titlebar-inactive-text)"
  );
</script>

<section
  style="position:absolute; left:{x}px; top:{y}px; width:{width}px; height:{height}px; z-index:{zIndex}; background-color: var(--theme-window-bg); {!maximized ? 'border-radius: var(--theme-window-border-radius);' : ''}"
  class="flex flex-col p-[2px] {!maximized ? 'win95-raised' : ''}"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <header
    onpointerdown={onTitleBarPointerDown}
    onpointermove={onTitleBarPointerMove}
    onpointerup={onTitleBarPointerUp}
    onpointercancel={onTitleBarPointerUp}
    ondblclick={onMaximize}
    class="flex items-center justify-between px-2 py-1 cursor-default select-none"
    style="background: {titleBarBg}; color: {titleBarColor}; touch-action:none; border-radius: var(--theme-window-border-radius);"
  >
    <div class="flex items-center gap-2">
      {#if titleIconSrc}
        <img src={titleIconSrc} alt={titleIconAlt} class="size-5" />
      {/if}
      <p class="title-text text-[15px] leading-none">{title}</p>
    </div>
    <div class="flex items-center gap-1">
      <button type="button" onclick={onMinimize} onpointerdown={(e) => e.stopPropagation()} aria-label="Minimize" class="window-icon"
        ><span aria-hidden="true" class="window-control window-control-minimize"></span></button
      >
      <button type="button" onclick={onMaximize} onpointerdown={(e) => e.stopPropagation()} aria-label={maximized ? 'Restore' : 'Maximize'} class="window-icon"
        >{#if maximized}
          <span aria-hidden="true" class="window-control window-control-restore"></span>
        {:else}
          <span aria-hidden="true" class="window-control window-control-maximize"></span>
        {/if}</button
      >
      <button type="button" onclick={onClose} onpointerdown={(e) => e.stopPropagation()} aria-label="Close" class="window-icon"
        ><span aria-hidden="true" class="window-control window-control-close"></span></button
      >
    </div>
  </header>

  <div class="flex-1 min-h-0 overflow-hidden">
    {@render children?.()}
  </div>

  {#if !maximized}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onpointerdown={onResizePointerDown}
      onpointermove={onResizePointerMove}
      onpointerup={onResizePointerUp}
      onpointercancel={onResizePointerUp}
      class="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
      style="touch-action:none"
    ></div>
  {/if}
</section>

<style>
  .window-control {
    position: relative;
    display: block;
    flex: none;
    color: var(--theme-button-text);
  }

  .window-control-minimize {
    width: 8px;
    height: 2px;
    margin-top: 7px;
    background: currentColor;
  }

  .window-control-maximize {
    box-sizing: border-box;
    width: 9px;
    height: 8px;
    border: 1px solid currentColor;
  }

  .window-control-maximize::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    height: 2px;
    background: currentColor;
  }

  .window-control-restore {
    box-sizing: border-box;
    position: relative;
    width: 6px;
    height: 6px;
    background: var(--theme-window-bg);
  }

  .window-control-restore::before {
    content: "";
    position: absolute;
    top: -2px;
    left: 2px;
    width: 6px;
    height: 6px;
    border: 1px solid currentColor;
    border-right: none;
    border-bottom: none;
    background: var(--theme-window-bg);
  }

  .window-control-restore::after {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: 8px;
    height: 8px;
    border: 1px solid currentColor;
  }

  .window-control-close {
    width: 8px;
    height: 8px;
  }

  .window-control-close::before,
  .window-control-close::after {
    content: "";
    position: absolute;
    top: 0;
    left: 3px;
    width: 2px;
    height: 8px;
    background: currentColor;
    transform-origin: center;
  }

  .window-control-close::before {
    transform: rotate(45deg);
  }

  .window-control-close::after {
    transform: rotate(-45deg);
  }
</style>
