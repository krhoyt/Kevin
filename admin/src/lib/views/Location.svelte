<script>
  import Input from "$lib/comp/Input.svelte";

  let {
    nearby = [],
    oncancel = null,
    onchange = null,
    onsuggest = null,
    previous = ['Red Robin', 'Smoker Friendly'],
    suggestions = []
  } = $props();

  let value = $state( null );

  function onBackClick() {
    value = null;
    suggestions = [];
    oncancel?.();
  }

  function onPlaceClick( value ) {
    onchange?.( {
      latitude: value.latitude,
      longitude: value.longitude,
      place: value.place,
      place_id: value.place_id
    } );
  }
</script>

<section>

  <header>
    <button aria-label="Back" type="button" onclick={onBackClick}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path d="M0 0h16v16H0z" fill="none" />
        <path fill="currentColor" fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
      </svg>
    </button>
    <Input 
      debounce={2000} 
      grow={true} 
      onbounce={onsuggest} 
      placeholder="Find a place" 
      {value} />
  </header>

  {#if suggestions.length > 0}
    <ul>
      {#each suggestions as suggest}
        <li>
          <button type="button" onclick={() => onPlaceClick( suggest )}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M0 0h16v16H0z" fill="none" />
                <path fill="currentColor" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6a3 3 0 0 1 0 6" />
              </svg>
            </div>            
            <span>{suggest.address}</span>
          </button>
        </li>      
      {/each}
    </ul>
  {/if}  

  {#if nearby.length > 0}
    <p>Nearby</p>

    <ul>
      {#each nearby as near}
        <li>
          <button type="button" onclick={() => onPlaceClick( near )}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M0 0h16v16H0z" fill="none" />
                <path fill="currentColor" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6a3 3 0 0 1 0 6" />
              </svg>
            </div>
            <span>{near.place}</span>
          </button>
        </li>      
      {/each}
    </ul>
  {/if}

  {#if previous.length > 0}
    <p>Previous</p>

    <ul>
      {#each previous as item}
        <li>
          <button type="button" onclick={() => onPlaceClick( item )}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M0 0h16v16H0z" fill="none" />
                <path fill="currentColor" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6a3 3 0 0 1 0 6" />
              </svg>
            </div>
            <span>{item.place}</span>
          </button>
        </li>      
      {/each}
    </ul>
  {/if}

</section>


<style>
  button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    gap: 16px;
    justify-content: center;
    line-height: 24px;
    margin: 0;
    min-width: 0;
    outline: none;
    padding: 6px 16px 6px 12px;
    text-align: left;
    width: 100%;
  }

  button span {
    min-width: 0;
    flex-basis: 0;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button svg {
    height: 16px;
    width: 16px;
  }

  div {
    align-items: center;
    border-radius: 30px;
    background: #41474e;
    display: flex;
    height: 30px;
    justify-content: center;
    width: 30px;
  }

  header {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 0 16px 16px 12px;
  }

  header button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    height: 40px;
    justify-content: center;
    margin: 0;
    outline: none;
    padding: 10px;
    width: 40px;
  }

  header button svg {
    height: 20px;
    width: 20px;
  }

  p {
    color: #f4f4f4;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    margin: 16px 0 0 0;
    padding: 6px 16px 6px 28px;
    text-rendering: optimizeLegibility;
  }

  section {
    display: flex;
    flex-direction: column;
    padding: 16px 0 16px 0;
    width: 100vw;
  }  

  ul {
    background: #11181f;
    border: solid 1px #1e252d;
    border-radius: 12px;    
    list-style: none;
    margin: 0 16px 0 16px;
    padding: 0;
  }

  ul li {
    border-bottom: solid 1px #1e252d;
  }

  ul li:last-of-type {
    border-bottom: none;
  }  
</style>
