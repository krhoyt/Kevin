self.addEventListener( 'message', async ( evt ) => {
  if( evt.data.type === 'sync' ) {
    self.postMessage( 'sync' );
  }
}, false );
