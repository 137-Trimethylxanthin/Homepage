<script lang="ts">
  import TopbarItem from "./TopbarItem.svelte";

  const topbarItems = [
    { title: "File" },
    { title: "Edit" },
    { title: "View" },
    { title: "Favorites" },
    { title: "Help" },
  ] as const;
</script>

<div
  class="flex items-center gap-4 border-b border-t border-[#9f9f9f] bg-[#c0c0c0] px-2 py-1 text-sm"
>
  {#each topbarItems as item}
    <TopbarItem title={item.title} />
  {/each}
</div>
