<script>
  let {
    id = null,
    onitem = null,
    started = null,
    tags = null,    
    text = null    
  } = $props();

  let date = $derived.by( () => {
    if( started === null ) return '';

    const formatter = new Intl.DateTimeFormat( navigator.language, {
      day: 'numeric',
      month: 'short',
      weekday: 'short',
      year: 'numeric'
    } );
    return formatter.format( started );
  } );
  let time = $derived.by( () => {
    if( started === null ) return '';

    const formatter = new Intl.DateTimeFormat( navigator.language, {
      hour: 'numeric',
      minute: '2-digit'
    } );
    return formatter.format( started );
  } );  

  function onItemClick() {
    onitem?.( id );
  }
</script>

<button onclick={onItemClick} type="button">
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
    <path d="M0 0h16v16H0z" fill="none" />
    <circle cx="8" cy="8" r="8" fill="currentColor" />
  </svg>
  <div>
    <p>{text}</p>
    <div class="tags">
      {#each tags as tag}
        <p>{tag}</p>
      {/each}
    </div>
    <p>{date} @ {time}</p>
  </div>
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
    <path d="M0 0h16v16H0z" fill="none" />
    <path fill="currentColor" fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8L4.646 2.354a.5.5 0 0 1 0-.708" />
  </svg>
</button>

<style>
  button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin: 0;
    outline: none;
    padding: 16px;
    width: 100%;
  }

  button > div {
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
  }

  button > div > p:last-of-type {
    font-size: 14px;
    opacity: 0.70;
  }

  button svg:first-of-type {
    align-self: flex-start;
    color: #165ff2;
    height: 16px;
    margin: 4px 0 0 0;
    width: 16px;
  }

  button svg:last-of-type {
    color: #f4f4f4;
    height: 20px;
    width: 20px;
  }

  div.tags {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  div.tags p {
    align-self: flex-start;
    background: color-mix( in srgb, #165ff2 10%, transparent );
    border: solid 1px #165ff2;
    border-radius: 6px;
    color: #165ff2;
    font-size: 14px;
    margin: 8px 0 8px 0;
    padding: 2px 8px 2px 8px;
    text-transform: lowercase;
  }

  p {
    color: #f4f4f4;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    padding: 0;
    text-align: left;
    text-rendering: optimizeLegibility;
  }
</style>
