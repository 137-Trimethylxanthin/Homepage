<script lang="ts">
  import type { WindowState } from "../../lib/window-manager.svelte";
  import { getActiveWindow } from "../../lib/window-manager.svelte";

  let { win, onClick }: { win: WindowState; onClick: () => void } = $props();

  const isActive = $derived(getActiveWindow()?.id === win.id && !win.minimized);
  const isPressed = $derived(isActive || win.minimized);
</script>

<button
  type="button"
  onclick={onClick}
  class="flex items-center gap-1 max-w-[180px] h-[22px] px-1 overflow-hidden cursor-default"
  style="font-family: var(--theme-font-ui); font-size: 11px; border-radius: var(--theme-button-border-radius);"
  class:taskbar-raised={!isPressed}
  class:taskbar-pressed={isPressed}
>
  <img src={win.icon} alt="" class="size-4 shrink-0" />
  <span class="truncate">{win.title}</span>
</button>

<style>
  .taskbar-raised {
    background-color: var(--theme-button-face);
    border-top: 2px solid var(--theme-button-highlight);
    border-left: 2px solid var(--theme-button-highlight);
    border-right: 2px solid var(--theme-button-dark-shadow);
    border-bottom: 2px solid var(--theme-button-dark-shadow);
  }

  .taskbar-pressed {
    background-color: var(--theme-button-face);
    box-shadow:
      inset 2px 0 0 0 var(--theme-button-dark-shadow),
      inset 0 2px 0 0 var(--theme-button-dark-shadow),
      inset -2px 0 0 0 var(--theme-button-highlight),
      inset 0 -2px 0 0 var(--theme-button-highlight);
  }
</style>
