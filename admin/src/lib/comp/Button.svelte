<script>
  let {
    label = null,
    onclick = null,
    outline = false,
    prefix = null,
    suffix = null
  } = $props();
</script>

<button aria-label={label} class:outline {onclick} type="button">
  {@render prefix?.()}
  {#if label}
    <span>{label}</span>
  {/if}
  {@render suffix?.()}
</button>

<style>
  button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    border-radius: 6px;
    color: #165ff2;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    gap: 8px;
    line-height: 24px;
    margin: 0;
    outline: none;
    padding: 8px 0 8px 0;
    text-rendering: optimizeLegibility;
  }

  button.outline {
    background: #0b1017;
    border: solid 1px #41474e;    
    color: #f4f4f4;
    padding: 8px 12px 8px 16px;
    text-align: left;
  }

  span {
    flex-basis: 0;
    flex-grow: 1;
  }

  button.outline span {
    min-width: 0;
    flex-basis: 0;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }  
</style>
