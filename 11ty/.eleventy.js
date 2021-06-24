module.exports = {
  dir: {
    input: 'content',
    output: '_site'
  }
};

module.exports = function( config ) {
  config.addPassthroughCopy( 'img' );
  config.addPassthroughCopy( '*.css' );

  return {
    passthroughFileCopy: true
  };
};
