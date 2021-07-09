const markdownIt = require( 'markdown-it' );
const pluginRss = require( '@11ty/eleventy-plugin-rss' );
const pluginSyntaxHighlight = require( '@11ty/eleventy-plugin-syntaxhighlight' );

module.exports = function( config ) {
  config.addPlugin( pluginRss );  
  config.addPlugin( pluginSyntaxHighlight );

  config.addPassthroughCopy( 'img' );
  config.addPassthroughCopy( 'style' );  

  config.addFilter( 'getReadingTime', text => {
    if( text === undefined )
      return 0;
      
    const wordsPerMinute = 200;
    const numberOfWords = text.split(/\s/g).length;
    return Math.ceil( numberOfWords / wordsPerMinute );
  } );

  config.setLibrary( 'md', markdownIt( {
    html: true,
    breaks: true,
    linkify: true
  } ) );

  return {}
}
