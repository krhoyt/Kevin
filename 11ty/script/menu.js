const menu = document.querySelector( '#header select' );
menu.addEventListener( 'change', ( evt ) => {
  window.location = evt.currentTarget.value;
} );
