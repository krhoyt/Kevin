const carousel = document.querySelector( 'kh-carousel' );
const images = document.querySelectorAll( '#projects div img' );
const descriptions = document.querySelectorAll( '#projects kh-carousel div > p' );

const distance = 50;
const query = window.matchMedia( '( max-width: 480px )' );

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

function onTouchStart( evt ) {
  start = evt.changedTouches[0].screenX;
}

function onTouchEnd( evt ) {
  end = evt.changedTouches[0].screenX;
  onSwipe();
}

function onMouseDown( evt ) {
  evt.preventDefault();

  drag = false;
  start = evt.screenX;

  document.addEventListener( 'mousemove', onMouseMove );
  document.addEventListener( 'mouseup', onMouseUp );
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

  drag = false;

  document.removeEventListener( 'mousemove', onMouseMove );
  document.removeEventListener( 'mouseup', onMouseUp );
}

if( query.matches ) {
  for( let i = 0; i < images.length; i++ ) {
    // Add touch events to images
    images[i].addEventListener( 'touchstart', onTouchStart );
    images[i].addEventListener( 'touchend', onTouchEnd );

    // Add mouse events to images
    images[i].addEventListener( 'mousedown', onMouseDown );

    // Add touch events to descriptions
    descriptions[i].addEventListener( 'touchstart', onTouchStart );
    descriptions[i].addEventListener( 'touchend', onTouchEnd );

    // Add mouse events to descriptions
    descriptions[i].addEventListener( 'mousedown', onMouseDown );
  }
}
