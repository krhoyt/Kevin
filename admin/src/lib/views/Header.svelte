<script>
  let {
    left = null,
    right = null,
    title = null
  } = $props();
</script>

<header>

  <!-- Left -->
  <div>{@render left?.()}</div>

  <!-- Title -->
  <h2>{title}</h2>

  <!-- Right -->
  <div>{@render right?.()}</div>    

</header>

<style>
  div {
    display: flex;
    flex-direction: row;
    width: 100px;
  }

  div:first-of-type {
    justify-content: flex-start;
  }

  div:last-of-type {
    justify-content: flex-end;
  }

  h2 {
    font-size: 22px;
    font-weight: 500;
    line-height: 28px;
    margin: 0;
    padding: 0;
    text-align: center;
    text-rendering: optimizeLegibility;
  }  

  header {
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr auto;
    padding: 16px;
  }
</style>