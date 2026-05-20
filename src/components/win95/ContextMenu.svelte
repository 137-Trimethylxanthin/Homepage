<script lang="ts">
  export interface ContextMenuItem {
    label: string;
    icon?: string;
    disabled?: boolean;
    separator?: boolean;
    action?: () => void;
    submenu?: ContextMenuItem[];
  }

  let {
    x,
    y,
    items,
    onClose,
  }: {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
  } = $props();

  let activeSubmenuIndex = $state<number | null>(null);
  let submenuCloseTimer: ReturnType<typeof setTimeout> | null = null;
  const clampedX = $derived(Math.min(x, (typeof window !== 'undefined' ? window.innerWidth : 1024) - 170));
  const clampedY = $derived(Math.min(y, (typeof window !== 'undefined' ? window.innerHeight : 768) - 200));

  function handleItemClick(item: ContextMenuItem): void {
    if (item.separator || item.disabled) return;
    if (item.submenu) return;
    item.action?.();
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      onClose();
    }
  }

  function handleMouseEnter(index: number, item: ContextMenuItem): void {
    if (submenuCloseTimer) {
      clearTimeout(submenuCloseTimer);
      submenuCloseTimer = null;
    }
    if (item.submenu) {
      activeSubmenuIndex = index;
    } else {
      activeSubmenuIndex = null;
    }
  }

  function handleMouseLeave(): void {
    submenuCloseTimer = setTimeout(() => {
      activeSubmenuIndex = null;
    }, 200);
  }

  function handleSubmenuMouseEnter(): void {
    if (submenuCloseTimer) {
      clearTimeout(submenuCloseTimer);
      submenuCloseTimer = null;
    }
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  $effect(() => {
    const handler = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
</script>

{#snippet renderItem(item: ContextMenuItem, index: number)}
  {#if item.separator}
    <div class="h-0 mx-[2px]" style="border-top: 1px solid var(--theme-button-shadow); margin: 3px 2px;"></div>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="context-menu-item flex items-center gap-[2px] h-[22px] px-[2px]"
      class:context-menu-item-active={activeSubmenuIndex === index}
      class:disabled={item.disabled}
      role="menuitem"
      tabindex="-1"
      onclick={() => handleItemClick(item)}
      onmouseenter={() => handleMouseEnter(index, item)}
    >
      <span class="w-5 shrink-0 flex justify-center">
        {#if item.icon}
          <img src={item.icon} alt="" class="size-4" />
        {/if}
      </span>
      <span class="flex-1 text-[11px] leading-[22px] truncate select-none">{item.label}</span>
      {#if item.submenu}
        <span class="text-[11px] px-[4px]">▸</span>
      {/if}
    </div>
  {/if}
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-[10001]"
  onmousedown={handleBackdropClick}
  oncontextmenu={(e: MouseEvent) => { e.preventDefault(); onClose(); }}
>
  <div
    class="absolute py-[2px] z-[10002]"
    style="left: {clampedX}px; top: {clampedY}px; min-width: 150px; background-color: var(--theme-menu-bg);"
    style:box-shadow="inset 1px 1px 0 var(--theme-button-highlight), inset -1px -1px 0 var(--theme-button-dark-shadow), 1px 1px 0 0 var(--theme-button-dark-shadow), -1px -1px 0 0 var(--theme-button-highlight); border: var(--theme-menu-border);"
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
  >
    {#each items as item, i}
      {@render renderItem(item, i)}
    {/each}
    {#if activeSubmenuIndex !== null && items[activeSubmenuIndex]?.submenu}
      {@const submenu = items[activeSubmenuIndex].submenu!}
      <div
        class="absolute py-[2px]"
        style="left: calc(100% - 2px); top: {activeSubmenuIndex * 22 + 2}px; min-width: 140px; background-color: var(--theme-menu-bg);"
        style:box-shadow="inset 1px 1px 0 var(--theme-button-highlight), inset -1px -1px 0 var(--theme-button-dark-shadow), 1px 1px 0 0 var(--theme-button-dark-shadow), -1px -1px 0 0 var(--theme-button-highlight); border: var(--theme-menu-border);"
        onmouseenter={handleSubmenuMouseEnter}
        onmouseleave={handleMouseLeave}
      >
        {#each submenu as subItem, si}
          {@render renderItem(subItem, si)}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .context-menu-item {
    color: var(--theme-context-text);
    cursor: default;
  }

  .context-menu-item-active {
    background-color: var(--theme-menu-highlight);
    color: var(--theme-menu-highlight-text);
  }

  .disabled {
    color: var(--theme-button-shadow);
    pointer-events: none;
  }
</style>
