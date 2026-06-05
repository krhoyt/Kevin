<script>
  import Button from "$lib/comp/Button.svelte";
  import StatusItem from "$lib/comp/StatusItem.svelte";

  import Header from "$lib/views/Header.svelte";  

  let {
    items = [],
    onadd = null,
    onitem = null,
    onlogout = null
  } = $props();

  function onAddClick() {
    onadd?.();
  }

  function onLogoutClick() {
    onlogout?.();
  }
</script>

<section>

  <Header title="Status Updates">
    {#snippet left()}
      <Button label="Logout" onclick={onLogoutClick} />
    {/snippet}
    {#snippet right()}
      <button aria-label="Add status" onclick={onAddClick} type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
        </svg>
      </button>    
    {/snippet}    
  </Header>

  <p class="message">Manage, edit, and organize your status updates.</p>

  <ul>
    {#each items as item}
      <li>
        <StatusItem {... item} {onitem} />
      </li>      
    {/each}
  </ul>

</section>

<style>
  button {
    align-items: center;
    appearance: none;
    background: #165ff2;
    border: none;
    border-radius: 6px;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    height: 40px;
    justify-content: center;
    margin: 0;
    outline: none;
    padding: 0;
    width: 40px;
  }

  button svg {
    height: 20px;
    width: 20px;
  }

  section {
    display: flex;
    flex-direction: column;
    width: 100vw;
  }

  ul {
    background: #11181f;
    border: solid 1px #1e252d;
    border-radius: 12px;
    list-style: none;
    margin: 32px 16px 0 16px;
    padding: 0;
  }

  ul li {
    border-bottom: solid 1px #1e252d;
  }

  ul li:last-of-type {
    border-bottom: none;
  }

  .message {
    font-size: 16px;
    line-height: 24px;
    margin: 16px 0 0 0;
    opacity: 0.70;
    padding: 0;
    text-align: center;
    text-rendering: optimizeLegibility;
  }
</style>
