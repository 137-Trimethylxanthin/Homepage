<script lang="ts">
  import {
    getWindows,
    getActiveWindow,
    focusWindow,
    minimizeWindow,
  } from "../../lib/window-manager.svelte";
  import TaskbarButton from "./TaskbarButton.svelte";
  import StartMenu from "./StartMenu.svelte";

  let showStartMenu = $state(false);

  function toggleStartMenu(): void {
    showStartMenu = !showStartMenu;
  }

  function formatTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }

  let currentTime = $state(formatTime());

  $effect(() => {
    const interval = setInterval(() => {
      currentTime = formatTime();
    }, 60000);
    return () => clearInterval(interval);
  });

  function handleTaskbarClick(id: string): void {
    const activeWindow = getActiveWindow();
    const win = getWindows().find((w) => w.id === id);
    if (!win) return;

    if (win.minimized) {
      focusWindow(id);
    } else if (activeWindow?.id === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  }
</script>

<footer
  class="fixed bottom-0 left-0 right-0 h-8 px-1 py-[2px] flex items-center z-[9999]"
  style="background: var(--theme-taskbar-bg); border-top: 1px solid var(--theme-taskbar-border); font-family: var(--theme-font-ui); font-size: 11px;"
>
  <button
    type="button"
    class="start-button flex items-center gap-1 h-[22px] px-2"
    class:start-button-active={showStartMenu}
    onclick={toggleStartMenu}
  >
    <img
      src="/icons/95/Windows/Windows logo (without text).ico"
      alt=""
      class="size-4"
    />
    Start
  </button>

  <div class="flex-1 flex items-center gap-[2px] px-1 overflow-hidden">
    {#each getWindows() as win (win.id)}
      <TaskbarButton {win} onClick={() => handleTaskbarClick(win.id)} />
    {/each}
  </div>

  <div
    class="flex items-center gap-1 px-2 h-[22px] shrink-0"
    style="font-size: 11px; box-shadow: inset 1px 1px 0 var(--theme-button-shadow), inset -1px -1px 0 var(--theme-button-highlight); border: 2px solid var(--theme-button-shadow); border-top-color: var(--theme-button-shadow); border-left-color: var(--theme-button-shadow); border-right-color: var(--theme-button-highlight); border-bottom-color: var(--theme-button-highlight);"
  >
    <span>{currentTime}</span>
  </div>
</footer>

<StartMenu open={showStartMenu} onClose={() => showStartMenu = false} />

<style>
  .start-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    height: 22px;
    background-color: var(--theme-button-face);
    padding: 0 0.5rem;
    font-size: 11px;
    font-family: var(--theme-font-bold);
    border-top: 2px solid var(--theme-button-highlight);
    border-left: 2px solid var(--theme-button-highlight);
    border-right: 2px solid var(--theme-button-dark-shadow);
    border-bottom: 2px solid var(--theme-button-dark-shadow);
    cursor: default;
  }

  .start-button:active,
  .start-button-active {
    box-shadow:
      inset 2px 0 0 0 var(--theme-button-dark-shadow),
      inset 0 2px 0 0 var(--theme-button-dark-shadow),
      inset -2px 0 0 0 var(--theme-button-highlight),
      inset 0 -2px 0 0 var(--theme-button-highlight);
  }
</style>
