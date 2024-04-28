<script lang="ts">
  let isOpen = false;
  export let title = "Dropdown";

  function openDropdown() {
    isOpen = true;
  }

  function closeDropdown() {
    isOpen = false;
  }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="relative" on:mouseenter={openDropdown} on:mouseleave={closeDropdown} >
  {title}
  {#if isOpen}
    <ul>
        <slot></slot>
    </ul>
  {/if}
</div>