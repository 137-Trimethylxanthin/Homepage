<script lang="ts">
  import type { WindowConfig } from "../../lib/window-manager.svelte";
  import { openWindow, getWindows, setDesktopDimensions } from "../../lib/window-manager.svelte";
  import { untrack } from "svelte";
  import Window from "./Window.svelte";
  import Browser from "./browser/Browser.svelte";
  import DesktopIcon from "./DesktopIcon.svelte";
  import ContextMenu, { type ContextMenuItem } from "./ContextMenu.svelte";
  import MyComputer from "./MyComputer.svelte";
  let { initialWindows = [] }: { initialWindows?: WindowConfig[] } = $props();

  let desktopEl: HTMLElement | undefined = $state();
  let selectedIconId = $state<string | null>(null);
  let isMobile = $state(false);

  $effect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    isMobile = mql.matches;
    const handler = (e: MediaQueryListEvent) => { isMobile = e.matches; };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  });

  let contextMenu = $state<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  function openMyComputer(): void {
    openWindow({
      id: "my-computer",
      title: "My Computer",
      icon: "/icons/95/Computers/My Computer.ico",
      component: MyComputer,
      props: {},
    });
  }

  function openBrowser(): void {
    openWindow({
      id: "browser-main",
      title: "Windows Internet Exploerer",
      icon: "/icons/95/Earths/Search on Earth.ico",
      component: Browser,
      props: {
        startPage: "/browser/home",
        localPaths: ["/browser/home", "/browser/test"],
      },
    });
  }

  function handleIconClick(iconId: string): void {
    selectedIconId = iconId;
  }

  function handleIconDblClick(iconId: string): void {
    selectedIconId = iconId;
    if (iconId === "my-computer") openMyComputer();
    if (iconId === "internet-explorer") openBrowser();
  }

  function handleIconContextMenu(iconId: string, e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    selectedIconId = iconId;
    contextMenu = {
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "Open", action: () => { if (iconId === "my-computer") openMyComputer(); if (iconId === "internet-explorer") openBrowser(); } },
        { label: "Explore", action: () => { if (iconId === "my-computer") openMyComputer(); if (iconId === "internet-explorer") openBrowser(); } },
        { separator: true, label: "" },
        { label: "Create Shortcut" },
        { label: "Delete" },
        { label: "Rename" },
        { separator: true, label: "" },
        { label: "Properties" },
      ],
    };
  }

  function handleDesktopContextMenu(e: MouseEvent): void {
    e.preventDefault();
    selectedIconId = null;
    contextMenu = {
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "Arrange Icons" },
        { label: "Line Up Icons" },
        { separator: true, label: "" },
        { label: "Paste" },
        { label: "Paste Shortcut" },
        { separator: true, label: "" },
        {
          label: "New",
          submenu: [
            { label: "Folder", icon: "/icons/95/Folders/Folder.ico" },
            { label: "Shortcut", icon: "/icons/95/Patterns/Shortcut.ico" },
            { label: "Text Document", icon: "/icons/95/Notepads & Writing/Notepad.ico" },
          ],
        },
        { separator: true, label: "" },
        { label: "Properties" },
      ],
    };
  }

  function closeContextMenu(): void {
    contextMenu = null;
  }

  const desktopIcons = [
    {
      id: "my-computer",
      icon: "/icons/95/Computers/My Computer.ico",
      label: "My Computer",
    },
    {
      id: "network-neighborhood",
      icon: "/icons/95/Network/Network Neighborhood (16x16px & 32x32px).ico",
      label: "Network\nNeighborhood",
    },
    {
      id: "recycle-bin",
      icon: "/icons/95/Recycle Bins/Recycle Bin with document.ico",
      label: "Recycle Bin",
    },
    {
      id: "maxis-files",
      icon: "/icons/95/Folders/Folder.ico",
      label: "Maxi's Files",
    },
    {
      id: "internet-explorer",
      icon: "/icons/95/Earths/Search on Earth.ico",
      label: "Internet\nExplorer",
    },
  ] as const;

  $effect(() => {
    untrack(() => {
      openWindow({
        id: "browser-main",
        title: "Windows Internet Exploerer",
        icon: "/icons/95/Earths/Search on Earth.ico",
        component: Browser,
        props: {
          startPage: "/browser/home",
          localPaths: ["/browser/home", "/browser/test"],
        },
        x: 60,
        y: 40,
        width: 850,
        height: 550,
      });

      for (const cfg of initialWindows) {
        openWindow(cfg);
      }
    });
  });

  $effect(() => {
    const el = desktopEl;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDesktopDimensions(Math.round(width), Math.round(height));
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  });
</script>

{#if isMobile}
  <div
    class="w-screen h-screen flex items-center justify-center select-none"
    style="background-color: var(--theme-desktop-bg); font-family: W95FA, 'MS Sans Serif', 'Segoe UI', sans-serif;"
  >
    <div
      class="win95-raised bg-[#c0c0c0] p-6 max-w-sm text-center"
      style="background-color: var(--theme-window-bg);"
    >
      <p class="title-text text-sm mb-2" style="font-family: var(--theme-font-bold);">Desktop Experience</p>
      <p class="text-xs" style="font-family: var(--theme-font-ui);">
        This Windows desktop requires a larger screen.<br/>
        Please view on a desktop or tablet.
      </p>
    </div>
  </div>
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={desktopEl}
    class="relative w-screen h-screen overflow-hidden select-none"
    style="background-color: var(--theme-desktop-bg); font-family: W95FA, 'MS Sans Serif', 'Segoe UI', sans-serif;"
    oncontextmenu={handleDesktopContextMenu}
  >
  <div class="absolute top-2 left-4 flex flex-col gap-[6px]">
    {#each desktopIcons as item}
      <DesktopIcon
        icon={item.icon}
        label={item.label}
        selected={selectedIconId === item.id}
        onclick={() => handleIconClick(item.id)}
        ondblclick={() => handleIconDblClick(item.id)}
        oncontextmenu={(e: MouseEvent) => handleIconContextMenu(item.id, e)}
      />
    {/each}
  </div>

  {#each getWindows() as win (win.id)}
    {#if !win.minimized}
      <Window {win}>
        {#snippet children()}
          {@const AppComp = win.component}
          <AppComp {...win.props} />
        {/snippet}
      </Window>
    {/if}
  {/each}

  {#if contextMenu}
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      items={contextMenu.items}
      onClose={closeContextMenu}
    />
  {/if}
</div>
{/if}
