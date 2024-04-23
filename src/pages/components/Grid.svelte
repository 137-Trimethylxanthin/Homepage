<script lang="ts">
    export const otherClass = '';
    export const gridCols = 3;

</script>

<div class="grid grid-cols-{gridCols} space-x-2 {otherClass}">
    <slot/>
</div>