const { DateTime } = require( 'luxon' );
const markdownIt = require( 'markdown-it' );
const pluginRss = require( '@11ty/eleventy-plugin-rss' );
const pluginSyntaxHighlight = require( '@11ty/eleventy-plugin-syntaxhighlight' );
const pluginYouTube = require( 'eleventy-plugin-youtube-embed' );

module.exports = function( config ) {
  config.addPlugin( pluginRss );  
  config.addPlugin( pluginSyntaxHighlight );
  config.addPlugin( pluginYouTube );

  config.addPassthroughCopy( 'img' );
  config.addPassthroughCopy( 'style' );  

  config.addFilter( 'htmlDateString', ts => {
    return DateTime.fromJSDate( ts, {zone: 'utc'} ).toLocaleString( DateTime.DATE_MED );
  } );

  config.addFilter( 'getReadingTime', text => {
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
