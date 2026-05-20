<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WindowState } from "../../lib/window-manager.svelte";
  import ApplicationBorder from "./ApplicationBorder.svelte";
  import {
    getHighestZIndex,
    moveWindow,
    resizeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    closeWindow,
  } from "../../lib/window-manager.svelte";

  let { win, children }: { win: WindowState; children?: Snippet } = $props();

  const isActive = $derived(win.zIndex === getHighestZIndex() && !win.minimized);

  let dragging = $state(false);
  let resizing = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigX = 0;
  let dragOrigY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;

  function handleTitleBarPointerDown(e: PointerEvent): void {
    if (e.button) return;
    focusWindow(win.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (win.maximized) {
      toggleMaximize(win.id);
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOrigX = e.clientX - 100;
      dragOrigY = e.clientY - 10;
      moveWindow(win.id, dragOrigX, dragOrigY);
      return;
    }

    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOrigX = win.x;
    dragOrigY = win.y;
  }

  function handleTitleBarPointerMove(e: PointerEvent): void {
    if (!dragging) return;
    moveWindow(
      win.id,
      dragOrigX + (e.clientX - dragStartX),
      dragOrigY + (e.clientY - dragStartY),
    );
  }

  function handleTitleBarPointerUp(_e: PointerEvent): void {
    dragging = false;
  }

  function handleResizePointerDown(e: PointerEvent): void {
    if (e.button) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizing = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    resizeStartWidth = win.width;
    resizeStartHeight = win.height;
  }

  function handleResizePointerMove(e: PointerEvent): void {
    if (!resizing) return;
    resizeWindow(
      win.id,
      resizeStartWidth + (e.clientX - dragStartX),
      resizeStartHeight + (e.clientY - dragStartY),
    );
  }

  function handleResizePointerUp(_e: PointerEvent): void {
    resizing = false;
  }

  function handleMinimize(): void {
    minimizeWindow(win.id);
  }

  function handleMaximize(): void {
    toggleMaximize(win.id);
  }

  function handleClose(): void {
    closeWindow(win.id);
  }

  function handlePointerDown(): void {
    focusWindow(win.id);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section onpointerdown={handlePointerDown}>
  <ApplicationBorder
    title={win.title}
    titleIconSrc={win.icon}
    titleIconAlt=""
    x={win.x}
    y={win.y}
    width={win.width}
    height={win.height}
    zIndex={win.zIndex}
    active={isActive}
    maximized={win.maximized}
    onMinimize={handleMinimize}
    onMaximize={handleMaximize}
    onClose={handleClose}
    onTitleBarPointerDown={handleTitleBarPointerDown}
    onTitleBarPointerMove={handleTitleBarPointerMove}
    onTitleBarPointerUp={handleTitleBarPointerUp}
    onResizePointerDown={handleResizePointerDown}
    onResizePointerMove={handleResizePointerMove}
    onResizePointerUp={handleResizePointerUp}
  >
    {#snippet children()}
      {@render children?.()}
    {/snippet}
  </ApplicationBorder>
</section>
