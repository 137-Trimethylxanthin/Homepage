<script lang="ts">
  let {
    icon,
    label,
    selected = false,
    onclick,
    ondblclick,
    oncontextmenu,
  }: {
    icon: string;
    label: string;
    selected?: boolean;
    onclick?: (e: MouseEvent) => void;
    ondblclick?: (e: MouseEvent) => void;
    oncontextmenu?: (e: MouseEvent) => void;
  } = $props();

  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  function handleClick(e: MouseEvent): void {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      ondblclick?.(e);
      return;
    }
    onclick?.(e);
    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 350);
  }

  function handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
    oncontextmenu?.(e);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
  class="flex flex-col items-center gap-[2px] w-[72px] py-[4px] cursor-default"
  class:selected
  onclick={handleClick}
  oncontextmenu={handleContextMenu}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as MouseEvent); }}
>
  <img src={icon} alt={label} class="size-8" draggable="false" />
  <span
    class="text-[11px] leading-tight text-center px-[2px] break-words select-none"
    style="color: var(--theme-desktop-text); font-family: var(--theme-font-ui);"
  >
    {label}
  </span>
</div>

<style>
  .selected {
    background-color: var(--theme-selection-bg);
  }

  .selected span {
    color: var(--theme-selection-text);
  }
</style>
