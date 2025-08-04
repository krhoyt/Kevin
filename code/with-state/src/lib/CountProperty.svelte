<script>
  import decrease from "$lib/assets/arrow-down.svg";  
  import increase from "$lib/assets/arrow-up.svg";

  let {item = null, onchange} = $props();

  function onDecreaseClick() {
    if( item === null ) return;

    if( item.count > 0 ) {
      const count = item.count - 1;
      item = {... item, count};
      if( onchange ) onchange( item );
    }
  }

  function onIncreaseClick() {
    if( item === null ) return;

    // Will cause an error
    // item.count = item.count + 1;

    const count = item.count + 1;
    item = {... item, count};
    if( onchange ) onchange( item );
  }  
</script>

<article>
  <button 
    aria-label="Decrease" 
    disabled={!item || !item.count || item.count === 0 ? true : false} 
    onclick={onDecreaseClick} 
    type="button">
    <img alt="Arrow pointing down" src={decrease} />
  </button>
  <p>{item && item.count ? item.count : 0}</p>
  <button 
    aria-label="Increase" 
    onclick={onIncreaseClick} 
    type="button">
    <img alt="Arrow pointing up" src={increase} />
  </button>
</article>

<style>
  article {
    display: flex;
    flex-direction: row;
  }

  article button {
    align-items: center;
    appearance: none;
    background: none;
    border: solid 1px #00000040;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 0;
    border-top-left-radius: 4px;
    border-top-right-radius: 0;    
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    height: 48px;
    justify-content: center;
    margin: 0;
    outline: 0;
    padding: 0;
    width: 48px;
    -webkit-tap-highlight-color: transparent;
  }

  article button:last-of-type {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 0;
    border-top-right-radius: 4px;    
  }

  article button:disabled {
    cursor: not-allowed;
  }

  article button:disabled img {
    opacity: 0.40;
  }

  article p {
    border-bottom: solid 1px #00000040;
    border-top: solid 1px #00000040;    
    box-sizing: border-box;
    color: #161616;
    cursor: default;
    font-family: sans-serif;
    font-size: 32px;
    font-weight: 400;
    line-height: 46px;
    margin: 0;
    padding: 0;
    text-align: center;
    width: 48px;
  }
</style>
