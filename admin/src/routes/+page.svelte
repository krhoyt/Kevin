<script>
  import '@fontsource-variable/open-sans/wght.css';  

  import { onMount } from 'svelte';

  import Browse from '$lib/views/Browse.svelte';  
  import Detail from '$lib/views/Detail.svelte';  
  import Login from '$lib/views/Login.svelte';

  // const API_SERVER = 'http://localhost:8888/api/status';
  const API_SERVER = 'https://ketnerlake.com/api/status';  

  let history = $state( [] );
  let item = $state( null );
  let screen = $state( 'NONE' );
  
  let password = null;

  async function browseStatus() {
    return fetch( API_SERVER )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      const items = data.map( ( value ) => {
        value.started = new Date( value.started );
        return value;
      } );
      items.sort( ( a, b ) => {
        if( a.started.getTime() < b.started.getTime() ) return 1;
        if( a.started.getTime() > b.started.getTime() ) return -1;
        return 0;
      } );
      history = [... items];
    } );     
  }

  async function createStatus( item ) {
    return fetch( API_SERVER, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( item )
    } )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      const items = data.map( ( value ) => {
        value.started = new Date( value.started );
        return value;
      } );
      items.sort( ( a, b ) => {
        if( a.started.getTime() < b.started.getTime() ) return 1;
        if( a.started.getTime() > b.started.getTime() ) return -1;
        return 0;
      } );
      history = [... items];
    } );  
  }

  async function updateStatus( item ) {
    return fetch( API_SERVER, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( item )
    } )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      const items = data.map( ( value ) => {
        value.started = new Date( value.started );
        return value;
      } );
      items.sort( ( a, b ) => {
        if( a.started.getTime() < b.started.getTime() ) return 1;
        if( a.started.getTime() > b.started.getTime() ) return -1;
        return 0;
      } );
      history = [... items];
    } );    
  }

  async function deleteStatus( id ) {
    return fetch( API_SERVER, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {id} )
    } )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      const items = data.map( ( value ) => {
        value.started = new Date( value.started );
        return value;
      } );
      items.sort( ( a, b ) => {
        if( a.started.getTime() < b.started.getTime() ) return 1;
        if( a.started.getTime() > b.started.getTime() ) return -1;
        return 0;
      } );
      history = [... items];
    } );         
  }

  function onBrowseAdd() {
    item = null;
    screen = 'DETAIL';
  }

  function onBrowseItem( id ) {
    const matches = history.filter( ( value ) => value.id === id );
    item = {... matches[0]};
    screen = 'DETAIL';
  }

  function onDetailCancel() {
    item = null;
    screen = 'BROWSE';
  }

  async function onDetailDelete( id ) {
    await deleteStatus( id );
    item = null;
    screen = 'BROWSE';
  }

  async function onDetailSave( item ) {
    if( item.id ) {
      await updateStatus( item );
    } else {
      await createStatus( item );
    }

    item = null;
    screen = 'BROWSE';    
  }

  async function onLoginSubmit( value, remember ) {
    password = value;

    if( remember ) {
      window.localStorage.setItem( 'kh-password', password );
    }

    await browseStatus();
    screen = 'BROWSE';
  }

  onMount( async () => {
    password = window.localStorage.getItem( 'kh-password' );

    if( password == null ) {
      screen = 'LOGIN';
    } else {
      await browseStatus();
      screen = 'BROWSE';
    }
  } );
</script>

{#if screen === 'LOGIN'}
  <Login 
    onsignin={onLoginSubmit} />
{:else if screen === 'BROWSE' }
  <Browse 
    items={history} 
    onadd={onBrowseAdd} 
    onitem={onBrowseItem} />
{:else if screen === 'DETAIL' }
  <Detail 
    {... item} 
    oncancel={onDetailCancel} 
    ondelete={onDetailDelete} 
    onsave={onDetailSave} />  
{/if}

<style>
  :global( html ) {
    height: 100%;
  }

  :global( body ) {
    background: #080e15;
    color: #f4f4f4;
    display: flex;
    flex-direction: row;
    font-family: 'Open Sans Variable', sans-serif;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
