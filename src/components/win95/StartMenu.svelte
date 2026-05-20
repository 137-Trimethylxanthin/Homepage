<script lang="ts">
  import { setTheme, THEMES, getTheme } from "../../lib/theme.svelte";

  let {
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  } = $props();

  let activeIndex = $state<number | null>(null);
  let activeSubmenuIndex = $state<number | null>(null);
  let submenuCloseTimer: ReturnType<typeof setTimeout> | null = null;

  interface MenuItem {
    label: string;
    icon?: string;
    submenu?: MenuItem[];
    action?: () => void;
  }

  const menuItems: MenuItem[] = [
    {
      label: "Programs",
      icon: "/icons/95/Folders/Opened Folder.ico",
      submenu: [
        { label: "Internet Explorer", icon: "/icons/95/Earths/Search on Earth.ico" },
        { label: "Notepad", icon: "/icons/95/Notepads & Writing/Notepad.ico" },
      ],
    },
    {
      label: "Documents",
      icon: "/icons/95/Folders/Documents Folder.ico",
      submenu: [
        { label: "My Documents", icon: "/icons/95/Folders/Folder.ico" },
      ],
    },
    {
      label: "Settings",
      icon: "/icons/95/Folders/Controls Folder.ico",
      submenu: [
        { label: "Control Panel", icon: "/icons/95/Computers/My Computer.ico" },
        { label: "Printers", icon: "/icons/95/Printers/Printer.ico" },
        {
          label: "Themes",
          icon: "/icons/95/Folders/Controls Folder.ico",
          submenu: THEMES.map((t) => ({
            label: t.name,
            action: () => {
              setTheme(t.id);
              onClose();
            },
          })),
        },
      ],
    },
    {
      label: "Find",
      icon: "/icons/95/Earths/Search on Earth.ico",
      submenu: [
        { label: "Files or Folders", icon: "/icons/95/Folders/Folder.ico" },
        { label: "Computer", icon: "/icons/95/Computers/My Computer.ico" },
      ],
    },
    { label: "Help", icon: "/icons/95/Help/Help book.ico" },
    { label: "Run\u2026", icon: "/icons/95/Programs/MS-DOS.ico" },
  ];

  function handleItemClick(item: MenuItem): void {
    if (item.action) {
      item.action();
    } else {
      onClose();
    }
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleMouseEnter(index: number, item: MenuItem): void {
    if (submenuCloseTimer) {
      clearTimeout(submenuCloseTimer);
      submenuCloseTimer = null;
    }
    activeIndex = index;
    if (item.submenu) {
      activeSubmenuIndex = index;
    } else {
      activeSubmenuIndex = null;
    }
  }

  function handleMouseLeave(): void {
    submenuCloseTimer = setTimeout(() => {
      activeIndex = null;
      activeSubmenuIndex = null;
    }, 200);
  }

  function handleSubmenuMouseEnter(): void {
    if (submenuCloseTimer) {
      clearTimeout(submenuCloseTimer);
      submenuCloseTimer = null;
    }
  }

  $effect(() => {
    if (!open) {
      activeIndex = null;
      activeSubmenuIndex = null;
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[10000]"
    onmousedown={handleBackdropClick}
    oncontextmenu={(e: MouseEvent) => { e.preventDefault(); onClose(); }}
  >
    <div
      class="absolute bottom-8 left-0 flex"
      style="min-width: 180px;"
      onmouseleave={handleMouseLeave}
    >
      <div
        class="w-[22px] shrink-0 flex items-end justify-center pb-[2px]"
        style="background: var(--theme-start-sidebar);"
      >
        <span
          class="text-[11px] font-bold whitespace-nowrap"
          style="color: var(--theme-start-sidebar-text); font-family: var(--theme-font-bold); transform: rotate(-90deg); writing-mode: vertical-lr;"
        >
          Windows<span style="font-weight: normal;"> 95</span>
        </span>
      </div>

      <div
        class="flex-1 py-[2px]"
        style="background-color: var(--theme-menu-bg); box-shadow: inset 1px 1px 0 var(--theme-button-highlight), inset -1px -1px 0 var(--theme-button-dark-shadow), 1px 1px 0 0 var(--theme-button-dark-shadow), -1px -1px 0 0 var(--theme-button-highlight); border: var(--theme-menu-border);"
      >
        {#each menuItems as item, i}
          <div
            class="start-menu-item flex items-center gap-[2px] h-[26px] px-[4px] cursor-default"
            class:start-menu-item-active={activeIndex === i}
            role="menuitem"
            tabindex="-1"
            onclick={() => handleItemClick(item)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(item); }}
            onmouseenter={() => handleMouseEnter(i, item)}
          >
            <span class="w-5 shrink-0 flex justify-center">
              {#if item.icon}
                <img src={item.icon} alt="" class="size-4" />
              {/if}
            </span>
            <span
              class="flex-1 text-[11px] leading-[26px] truncate select-none"
              style="font-family: var(--theme-font-ui);"
            >
              {item.label}
            </span>
            {#if item.submenu}
              <span class="text-[11px] pr-[2px]">▸</span>
            {/if}
          </div>

          {#if i === 5}
            <div style="border-top: 1px solid var(--theme-button-shadow); margin: 3px 2px;"></div>
          {/if}
        {/each}

        <div
          class="start-menu-item flex items-center gap-[2px] h-[26px] px-[4px] cursor-default"
          class:start-menu-item-active={activeIndex === menuItems.length}
          role="menuitem"
          tabindex="-1"
          onclick={() => onClose()}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
          onmouseenter={() => { activeIndex = menuItems.length; activeSubmenuIndex = null; }}
        >
          <span class="w-5 shrink-0 flex justify-center">
            <img src="/icons/95/Computers/Turn Off Computer.ico" alt="" class="size-4" />
          </span>
          <span
            class="flex-1 text-[11px] leading-[26px] truncate select-none"
            style="font-family: var(--theme-font-ui);"
          >
            Shut Down...
          </span>
        </div>
      </div>

      {#if activeSubmenuIndex !== null && menuItems[activeSubmenuIndex]?.submenu}
        {@const submenu = menuItems[activeSubmenuIndex].submenu!}
        {@const submenuTop = 2 + activeSubmenuIndex * 26}
        <div
          class="absolute py-[2px]"
          style="left: calc(100% - 2px); top: {submenuTop}px; min-width: 160px; background-color: var(--theme-menu-bg);"
          style:box-shadow="inset 1px 1px 0 var(--theme-button-highlight), inset -1px -1px 0 var(--theme-button-dark-shadow), 1px 1px 0 0 var(--theme-button-dark-shadow), -1px -1px 0 0 var(--theme-button-highlight); border: var(--theme-menu-border);"
          onmouseenter={handleSubmenuMouseEnter}
          onmouseleave={handleMouseLeave}
        >
          {#each submenu as subitem}
            <div
              class="start-menu-item flex items-center gap-[2px] h-[26px] px-[4px] cursor-default"
              role="menuitem"
              tabindex="-1"
              onclick={() => handleItemClick(subitem)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(subitem); }}
            >
              <span class="w-5 shrink-0 flex justify-center">
                {#if subitem.icon}
                  <img src={subitem.icon} alt="" class="size-4" />
                {/if}
              </span>
              <span
                class="flex-1 text-[11px] leading-[26px] truncate select-none"
                style="font-family: var(--theme-font-ui);"
              >
                {subitem.label}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .start-menu-item {
    color: var(--theme-context-text);
  }

  .start-menu-item-active {
    background-color: var(--theme-menu-highlight);
    color: var(--theme-menu-highlight-text);
  }
</style>
