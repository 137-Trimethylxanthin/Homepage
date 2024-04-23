
<script lang="ts">
    export const href = '#';
    export let otherClass = '';

</script>
<a href="{href}" class=" {otherClass} flex-col p-4 bg-surface0 border border-overlay0 rounded-lg shadow hover:bg-surface2 flex justify-center items-center mx-auto">
    <slot/>
</a>