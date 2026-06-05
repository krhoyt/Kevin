<script>
  let {
    debounce = null,
    grow = false,
    helper = null,
    label = null,
    name = null,
    onbounce = null,
    onchange = null,
    placeholder = null,
    prefix = null,
    suffix = null,
    value = null
  } = $props();

  let input = $state();

  let timer = null;  

  function onClearClick() { 
    input.value = '';
    value = null;    
    
    if( debounce !== null ) {
      clearTimeout( timer );
      onbounce?.( value );
    } 

    onchange?.( value );

    input.focus();    
  }

  function onInputChange() {
    onchange?.( input.value );
  }

  function onInputUp() {
    if( debounce === null ) return;

    clearTimeout( timer );    

    if( input.value.length === 0 ) {
      onbounce?.( null );
      return;
    }

    timer = setTimeout( () => {
      onbounce?.( input.value );
    }, debounce );    
  }
</script>

<label class:grow>

  {#if label}
    <p>{label}</p>
  {/if}

  {#if helper}
    <p>{helper}</p>      
  {/if}

  <div>
    {@render prefix?.()}
    <input 
      bind:this={input} 
      onchange={onInputChange} 
      onkeyup={onInputUp} 
      {placeholder} 
      bind:value />
    {@render suffix?.()}
    {#if value !== null && value?.length > 0}
      <button aria-label="Clear" onclick={onClearClick} type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <g fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8L4.646 5.354a.5.5 0 0 1 0-.708" />
          </g>
        </svg>
      </button>
    {/if}
  </div>      

</label>    

<style>
  button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    height: 36px;
    justify-content: center;
    margin: 0;
    outline: none;
    padding: 8px;
    width: 36px;
  }

  button svg {
    height: 20px;
    width: 20px;
  }

  div {
    align-items: center;
    background: #0b1017;
    border: solid 1px #41474e;
    border-radius: 6px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0 8px 0 0;
    transition: border 250ms ease;
  }

  input {
    appearance: none;
    background: none;
    border: none;    
    color: #f4f4f4;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    outline: none;
    padding: 8px 4px 8px 16px;
    text-rendering: optimizeLegibility;
    width: 100%;
  }

  input::placeholder {
    color: #f4f4f4;
    opacity: 0.70;
  }

  label {
    margin: var( --input-margin );    
  }

  label.grow {
    flex-basis: 0;
    flex-grow: 1;
  }

  label:focus-within div {
    border: solid 1px #f4f4f4;    
  }

  p {
    color: #f4f4f4;
    flex-basis: 0;
    flex-grow: 1;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    padding: 9px 16px 9px 16px;      
    text-align: left;
    text-rendering: optimizeLegibility;    
  }
</style>
