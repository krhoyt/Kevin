const form = document.querySelector( '#contact form' );
const honey = document.querySelector( '#pot' );
const poc = document.querySelector( '#poc' );
const email = document.querySelector( '#email' );
const reason = document.querySelector( '#reason' );
const message = document.querySelector( '#message' );
const button = document.querySelector( '#contact form button' );
button.addEventListener( 'click', () => {
  if( honey.value.trim().length !== 0 ) {
    alert( 'Go away bot!' );
    return;
  }

  if( poc.value.trim().length === 0 ) {
    alert( 'Name field is required.' );
    return;
  }

  if( email.value.trim().length === 0 ) {
    alert( 'Email field is required.' );
    return;
  }  

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if( !regex.test( email.value ) ) {
    alert( 'Check the formatting of your email.' );
    return;
  }

  if( reason.selectedIndex === 0 ) {
    alert( 'Any reason is fine. We can sort it out later.' );
    return;
  }

  if( message.value.trim().length === 0 ) {
    alert( 'A message is required. Add some context.' );
    return;
  }    

  const data = new FormData( form );

  fetch( '/', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded' 
    },
    body: new URLSearchParams( data ).toString()
  } )
  .then( () => {
    alert( 'Thanks for reaching out! I\'ll be in touch soon.' );
  } )
  .catch( ( error ) => alert( error ) );
} );
