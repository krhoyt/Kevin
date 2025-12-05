const carousel = document.querySelector( 'kh-carousel' );
const projects = document.querySelectorAll( '#projects div img' );

const distance = 50;

let drag = false;
let end = 0;
let start = 0;

function onSwipe() {
  const swipe = end - start;

  if( Math.abs( swipe ) > distance ) {
    if( swipe < 0 ) {
      carousel.next();
    } else {
      carousel.previous();
    }
  }
}

function onMouseMove( evt ) {
  evt.preventDefault();
  drag = true;
}

function onMouseUp( evt ) {
  evt.preventDefault();

  end = evt.screenX;

  if( drag ) {
    onSwipe();
  }

  // Delay to prevent click
  setTimeout( () => {
    drag = false;
  }, 100 );

  document.removeEventListener( 'mousemove', onMouseMove );
  document.removeEventListener( 'mouseup', onMouseUp );
}

for( let p = 0; p < projects.length; p++ ) {
  projects[p].addEventListener( 'click', () => {
    if( !drag ) {
      carousel.next();
    }
  } );

  // Touch events for mobile
  projects[p].addEventListener( 'touchstart', ( evt ) => {
    start = evt.changedTouches[0].screenX;
  } );
  projects[p].addEventListener( 'touchend', ( evt ) => {
    end = evt.changedTouches[0].screenX;
    onSwipe();
  } );

  // Mouse events for desktop
  projects[p].addEventListener( 'mousedown', ( evt ) => {
    evt.preventDefault();

    drag = false;
    start = evt.screenX;

    document.addEventListener( 'mousemove', onMouseMove );
    document.addEventListener( 'mouseup', onMouseUp );    
  } );
}
