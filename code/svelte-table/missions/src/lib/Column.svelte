<script>
  let {direction = null, field, label, sort} = $props();

  function onButtonClick() {
    if( direction === null ) {
      direction = 'asc';
    } else if( direction === 'asc' ) {
      direction = 'desc';
    } else {
      direction = null;
    }

    if( sort ) sort( field, direction );
  }
</script>

<button 
  class:ascending={direction === 'asc'} 
  class:descending={direction === 'desc'} 
  class:neutral={direction === null} 
  onclick={onButtonClick} 
  type="button">
  <span>{label}</span>
  {#if direction === 'asc'}
    <svg width="20" height="20" viewBox="0 0 32 32">
      <path fill="currentColor" d="m16 4l-7 7l1.414 1.414L15 7.828V28h2V7.828l4.586 4.586L23 11z"/>
    </svg>    
  {:else if direction === 'desc'}
    <svg width="20" height="20" viewBox="0 0 32 32">
      <path fill="currentColor" d="m16 4l-7 7l1.414 1.414L15 7.828V28h2V7.828l4.586 4.586L23 11z"/>
    </svg>      
  {:else}
    <svg width="20" height="20" viewBox="0 0 32 32">
      <path fill="currentColor" d="M27.6 20.6L24 24.2V4h-2v20.2l-3.6-3.6L17 22l6 6l6-6zM9 4l-6 6l1.4 1.4L8 7.8V28h2V7.8l3.6 3.6L15 10z"/>
    </svg>  
  {/if}
</button>

<style>
  button {
    align-items: center;
    appearance: none;
    background: transparent;
    border: none;
    color: #161616;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.16px;
    line-height: 18px;
    margin: 0;
    padding: 15px 16px 15px 16px;
    text-align: left;
    transition: background 150ms ease-in-out;    
    width: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  button:hover {
    background: #d1d1d1;    
  }

  button.descending svg {
    rotate: 180deg;
  }

  button.neutral svg {
    visibility: hidden;
  }

  button.neutral:hover svg {
    visibility: visible;
  }

  button span {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;        
  }

  button svg {
    flex: 0 0 auto;
    height: 20px;
    min-height: 20px;
    min-width: 20px;
    width: 20px;
  }
</style>
