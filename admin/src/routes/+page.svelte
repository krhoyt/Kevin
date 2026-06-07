<script>
  import '@fontsource-variable/open-sans/wght.css';  

  import { onMount } from 'svelte';

  import Browse from '$lib/views/Browse.svelte';  
  import Detail from '$lib/views/Detail.svelte';  
  import Location from '$lib/views/Location.svelte';
  import Login from '$lib/views/Login.svelte';

  // const API_SERVER = 'http://localhost:8888/api';
  const API_SERVER = 'https://ketnerlake.com/api';  

  let history = $state( [] );
  let item = $state( null );
  let latitude = $state( null );
  let location = $state( null );
  let longitude = $state( null );  
  let nearby = $state( [] );
  let screen = $state( 'NONE' );
  let suggestions = $state( [] );
  
  let password = null;
  let positionId = null;

  let previous = $derived.by( () => {
    if( history.length === 0 ) return [];

    const places = history.filter( ( value ) => value.hasOwnProperty( 'place' ) );
    const locations = places.map( ( value ) => {
      return {
        latitude: value.latitude,
        longitude: value.longitude,
        place: value?.place,
        place_id: value?.place_id
      }
    } );
    locations.sort( ( a, b ) => {
      if( a.place < b.place ) return -1;
      if( a.place > b.place ) return 1;
      return 0;
    } );
    return locations;
  } );

  async function browseStatus() {
    return fetch( API_SERVER + '/status' )
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
    return fetch( API_SERVER + '/status', {
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
    return fetch( API_SERVER + '/status', {
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
    return fetch( API_SERVER + '/status', {
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

  async function nearbyLocation() {
    if( latitude === null || longitude === null ) return [];

    const response = await fetch( API_SERVER + '/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        action: 'nearby',
        latitude,
        longitude
      } )
    } )

    const data = await response.json();

    const items = data.ResultItems.map( ( value ) => {
      return {
        latitude: value.Position[1],
        longitude: value.Position[0],
        place_id: value.PlaceId,
        place: value.Title
      }
    } );
    items.sort( ( a, b ) => {
      if( a.place < b.place ) return -1;
      if( a.place > b.place ) return 1;        
      return 0;
    } );
    
    console.log( items );

    nearby = [... items];    
  }

  async function suggestLocation( value ) {
    if( value === null || value.trim().length === 0 ) {
      suggestions = [];
      return;
    }

    const response = await fetch( API_SERVER + '/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        action: 'suggest',
        latitude,
        longitude,
        query: value
      } )
    } );

    let data = await response.json();
    data = data.ResultItems.filter( ( value ) => value.hasOwnProperty( 'Place' ) );
    suggestions = data.map( ( value ) => {
      return {
        address: value.Place.Address.Label,
        latitude: value.Place.Position[1],
        longitude: value.Place.Position[0],        
        place: value.Title,
        place_id: value.Place.PlaceId
      }
    } );    
  }

  function watchLocation() {
    if( positionId !== null ) return;

    positionId = navigator.geolocation.watchPosition( ( position ) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      navigator.geolocation.clearWatch( positionId );      
      positionId = null;
      nearbyLocation();
    }, ( error ) => {
      console.error( 'Error code: ', error.code, error.message );
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    } );    
  }

  function onBrowseAdd() {
    item = null;
    screen = 'DETAIL';
  }

  function onBrowseItem( id ) {
    const matches = history.filter( ( value ) => value.id === id );
    item = {... matches[0]};
    location = item.hasOwnProperty( 'place' ) ? {place: item.place, place_id: item.place_id} : null;
    screen = 'DETAIL';
  }

  function onBrowseLogout() {
    window.localStorage.removeItem( 'kh-password' );

    password = null;
    item = null;

    history = [];

    screen = 'LOGIN';
  }

  function onDetailCancel() {
    item = null;
    location = null;
    screen = 'BROWSE';
  }

  async function onDetailDelete( id ) {
    await deleteStatus( id );
    item = null;
    screen = 'BROWSE';
  }

  function onDetailLocation() {
    screen = 'LOCATION';
  }

  async function onDetailSave( item ) {
    if( item.id ) {
      await updateStatus( item );
    } else {
      item.latitude = latitude;
      item.longitude = longitude;
      await createStatus( item );
    }

    item = null;
    location = null;
    screen = 'BROWSE';    
  }

  async function onLocationSuggest( value ) {
    suggestLocation( value );
  }

  function onLocationCancel() {
    location = item === null || !item.hasOwnProperty( 'place' ) ? null : {place: item.place, place_id: item.place_id};
    suggestions = [];
    screen = 'DETAIL';
  }

  function onLocationChange( value ) {
    location = {... value}
    suggestions = [];
    screen = 'DETAIL';
  }

  async function onLoginSubmit( value, remember ) {
    password = value;

    if( remember ) {
      window.localStorage.setItem( 'kh-password', password );
    }

    await browseStatus();
    screen = 'BROWSE';
    watchLocation();
  }

  onMount( async () => {
    password = window.localStorage.getItem( 'kh-password' );

    if( password == null ) {
      screen = 'LOGIN';
    } else {
      await browseStatus();
      screen = 'BROWSE';
      watchLocation();
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
    onitem={onBrowseItem}
    onlogout={onBrowseLogout} />
{:else if screen === 'LOCATION' }
  <Location 
    {nearby}
    oncancel={onLocationCancel} 
    onchange={onLocationChange}
    onsuggest={onLocationSuggest} 
    {previous}
    {suggestions} />
{:else if screen === 'DETAIL' }
  <Detail
    {... item}
    {location}
    oncancel={onDetailCancel} 
    ondelete={onDetailDelete} 
    onlocation={onDetailLocation}
    onsave={onDetailSave} />  
{/if}

<style>
  :global( html ) {
    height: 100%;
  }

  :global( body ) {
    background: #111111;
    color: #f4f4f4;
    display: flex;
    flex-direction: row;
    font-family: 'Open Sans Variable', sans-serif;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
