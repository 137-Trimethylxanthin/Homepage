<script lang="ts">
  import type { ToolbarIcon } from "../../../lib/entities";

  let {
    canGoBack = true,
    canGoForward = true,
    onBack = () => {},
    onForward = () => {},
  }: {
    canGoBack?: boolean;
    canGoForward?: boolean;
    onBack?: () => void;
    onForward?: () => void;
  } = $props();

  const toolbarIcons: ToolbarIcon[] = [
    {
      kind: "image",
      src: "/icons/95/custom/IE1/FileOpen.png",
      alt: "File Open",
    },
    { kind: "image", src: "/icons/95/custom/IE1/Haus.png", alt: "Haus" },
    { kind: "spacer" },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/BlackLeft.png",
      alt: "Back",
    },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/BlackRight.png",
      alt: "Forward",
    },
    { kind: "spacer" },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/SchredderFile.png",
      alt: "Schredder",
    },
    { kind: "image", src: "/icons/95/custom/IE1/SyncFile.png", alt: "Sync" },
    { kind: "spacer" },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/StarFolder.png",
      alt: "Star Folder",
    },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/AddToStar.png",
      alt: "Add to Star",
    },
    { kind: "spacer" },
    { kind: "image", src: "/icons/95/custom/IE1/Schere.png", alt: "Schere" },
    { kind: "image", src: "/icons/95/custom/IE1/Copy.png", alt: "Copy" },
    {
      kind: "image",
      src: "/icons/95/custom/IE1/CopyToClip.png",
      alt: "CopyToClip",
    },
  ];
</script>

<div
  class="flex items-center gap-1 border-b border-t border-[#9f9f9f] bg-[#c0c0c0] px-1 py-1"
>
  {#each toolbarIcons as icon}
    {#if icon.kind === "spacer"}
      <div class="mx-1 h-5 w-px bg-[#9f9f9f]"></div>
    {:else}
      {@const isBack = icon.alt === "Back"}
      {@const isForward = icon.alt === "Forward"}
      {@const disabled = isBack ? !canGoBack : isForward ? !canGoForward : false}
      <button
        type="button"
        class="toolbar-button"
        onclick={isBack ? onBack : isForward ? onForward : undefined}
        disabled={disabled}
      >
        <img
          src={icon.src}
          alt={icon.alt}
          class="size-4"
          style={disabled ? "opacity: 0.4" : ""}
        />
      </button>
    {/if}
  {/each}
</div>
