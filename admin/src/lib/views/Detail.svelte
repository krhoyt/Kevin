<script>
  import Button from "$lib/comp/Button.svelte";
  import Header from "./Header.svelte";

  let {
    id = null,
    location = null,
    oncancel = null,
    ondelete = null,
    onlocation = null,
    onsave = null,
    started = new Date(),
    tags = [],
    text = null
  } = $props();

  let textarea = $state();

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
  let detail = $derived.by( () => {
    return `${id === null ? 'New' : 'Edit'} Status`;
  } );
  let status = $derived.by( () => {
    if( tags.length === 0 ) {
      return text;
    }

    const social = tags.join( ' #' );
    return `${text} #${social}`;
  } );
  let time = $derived.by( () => {
    if( started === null ) return '';

    const formatter = new Intl.DateTimeFormat( navigator.language, {
      hour: 'numeric',
      minute: '2-digit'
    } );
    return formatter.format( started );
  } );      

  function onBackClick() {
    oncancel?.();
  }

  function onDateChange( evt ) {
    const parts = evt.target.value.split( '-' );
    const selected = new Date( started.getTime() );
    selected.setFullYear( parseInt( parts[0] ) );
    selected.setMonth( parseInt( parts[1] ) - 1 );
    selected.setDate( parseInt( parts[2] ) );
    started = new Date( selected.getTime() );
  }

  function onDeleteClick() {
    const response = confirm( 'Are you sure you want to delete this status?' );

    if( response ) {
      ondelete?.( id );
    }
  }

  function onNativeClick( evt ) {
    evt.target.showPicker();
  }

  function onSaveClick() {
    if( location === null ) {
      alert( 'Specific location details are required.' );
      return;      
    }

    if( textarea.value.trim().length === 0 ) {
      alert( 'Status content is empty - required content.' );
      return;
    }

    if( textarea.value.indexOf( '#' ) < 0 ) {
      alert( 'At least one hashtag must be present.' );
      return;
    }

    const hashtags = new Set();

    for( const match of textarea.value.trim().matchAll( /#([\w-]+)/g ) ) {
      hashtags.add( match[1].toLowerCase() );
    }

    const status = textarea.value.trim()
      .replace( /#([\w-]+)/g, '' )
      .replace( /\s+/g, ' ' )
      .trim();

    if( id === null ) {
      onsave?.( {
        tags: [... hashtags],
        started,        
        text: status,
        latitude: location.latitude,
        longitude: location.longitude,
        place: location.place,
        place_id: location.place_id
      } );
    } else {
      onsave?.( {
        id,
        tags: [... hashtags],
        started,        
        text: status,
        latitude: location.latitude,
        longitude: location.longitude,
        place: location.place,
        place_id: location.place_id        
      } );
    }
  }

  function onTimeChange( evt ) {
    const parts = evt.target.value.split( ':' );
    const selected = new Date( started.getTime() );
    selected.setHours( parseInt( parts[0] ) );
    selected.setMinutes( parseInt( parts[1] ) );
    started = new Date( selected.getTime() );
  }  
</script>

<section>

  <Header title={detail}>
    {#snippet left()}
      <Button label="Back" onclick={onBackClick}>
        {#snippet prefix()}
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <path fill="currentColor" fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
          </svg>          
        {/snippet}
      </Button>
    {/snippet}
    {#snippet right()}
      <Button label="Save" onclick={onSaveClick} />
    {/snippet}
  </Header>

  <article>

    <label>
      <p>Location</p>
      <p>Where are you at?</p>      
      <Button 
        label={location === null ? 'Find a place' : location.place} 
        outline={true} 
        onclick={onlocation}>
        {#snippet suffix()}
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <g fill="currentColor">
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
              <path d="M8 8a2 2 0 1 1 0-4a2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6a3 3 0 0 0 0 6" />
            </g>
          </svg>
        {/snippet}
      </Button>
    </label>  

    <label class="status">
      <p>Status</p>
      <p>What are you working on?</p>      
      <textarea bind:this={textarea}>{status}</textarea>
    </label>  

    <label>
      <p>Start date</p>
      <p>What date did you start this?</p>      
      <div class="field">
        <p>{date}</p>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
        </svg>
        <input onchange={onDateChange} onclick={onNativeClick} type="date" />
      </div>      
    </label>

    <label>
      <p>Start time</p>
      <p>What time did you start this?</p>      
      <div class="field">
        <p>{time}</p>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <g fill="currentColor">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
          </g>
        </svg>
        <input onchange={onTimeChange} onclick={onNativeClick} type="time" />
      </div>      
    </label>    

  </article>

  {#if id !== null}
    <button 
      class="remove" 
      onclick={onDeleteClick} 
      type="button">
      Delete status
    </button>
  {/if}

</section>

<style>
  article {
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
  }

  div.field {
    align-items: center;
    background: #111111;
    border: solid 2px #393939;
    border-radius: 9px;
    box-sizing: border-box;
    color: #dbdbdb;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0 12px 0 0;
    position: relative;
  }

  div.field input {
    border: none;    
    height: 40px;
    left: 0;  
    margin: 0;
    opacity: 0;
    outline: none;
    position: absolute;
    right: 0;
    top: 0;
  }

  div.field p {
    color: #dbdbdb;
    flex-basis: 0;
    flex-grow: 1;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    padding: 9px 16px 9px 16px;      
    text-align: left;
    text-rendering: optimizeLegibility;    
  }

  div.field svg {
    height: 20px;
    width: 20px;
  }

  label {
    display: flex;
    flex-direction: column;
    margin: 0 16px 16px 16px;
  }

  label.status {
    flex-basis: 0;
    flex-grow: 1;
  }

  label input {
    appearance: none;
    background: #111111;
    border: solid 1px #393939;
    border-radius: 9px;
    box-sizing: border-box;
    color: #dbdbdb;
    flex-basis: 0;
    flex-grow: 1;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    min-width: 0;
    outline: none;
    padding: 8px 16px 8px 16px;
    text-rendering: optimizeLegibility;
    transition: border 250ms ease;    
  }  

  label > p {
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
  }

  label > p:first-of-type {  
    margin: 0;
  }

  label > p:last-of-type {
    font-size: 14px;
    line-height: 20px;
    margin: 0 0 6px 0;
    opacity: 0.70;
  }

  label textarea {
    appearance: none;
    background: #111111;
    border: solid 2px #393939;
    border-radius: 9px;
    box-sizing: border-box;
    color: #dbdbdb;
    flex-basis: 0;
    flex-grow: 1;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    min-height: 66px;
    line-height: 24px;
    margin: 0;
    min-width: 0;
    outline: none;
    padding: 8px 16px 8px 16px;
    resize: none;
    text-rendering: optimizeLegibility;
    transition: border 250ms ease;    
  }    

  label:focus-within input,
  label:focus-within textarea {
    border: solid 2px #f2f2f2;    
  }

  section {
    display: flex;
    flex-direction: column;
    padding: 0 0 32px 0;
    width: 100vw;
  }

  section > button {
    appearance: none;
    background: #165ff2;
    border: none;
    border-radius: 6px;
    color: #f4f4f4;
    cursor: pointer;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    margin: 0 16px 0 16px;
    outline: none;
    padding: 8px 0 8px 0;
    text-rendering: optimizeLegibility;    
  }

  section > button.remove {
    background: #11181f;
    color: crimson;
    margin: 16px 16px 0 16px;
  }

  svg.icon {
    height: 20px;
    width: 20px;
  }
</style>
