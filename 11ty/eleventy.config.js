import { DateTime } from "luxon";
import pluginRss from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import youTube from "eleventy-plugin-youtube-embed";

export default function( config ) {
  config.addPassthroughCopy( 'img' );
  config.addPassthroughCopy( 'style' );  
  config.addPassthroughCopy( 'script' );    

  config.addPlugin( pluginRss );    
	config.addPlugin( syntaxHighlight );
	config.addPlugin( youTube );  

  config.addCollection( 'postsByRating', ( collection ) => {
    return collection.getFilteredByGlob( 'posts/*.md' )
      .filter( post => !post.data.draft )
      .sort( ( a, b ) => b.data.rating - a.data.rating );
  } );

  config.addCollection( 'postsByDate', ( collection ) => {
    return collection.getFilteredByGlob( 'posts/*.md' )
      .filter( post => !post.data.draft )
      .sort( ( a, b ) => b.date - a.date );
  } );
  
  config.addCollection( 'notesByDate', ( collection ) => {
    return collection.getFilteredByGlob( 'notes/*.md' )
      .filter( post => !post.data.draft )
      .sort( ( a, b ) => b.date - a.date );
  } );  

  config.addFilter( 'htmlDateString', ts => {
    return DateTime.fromJSDate( ts, {zone: 'utc'} ).toLocaleString( DateTime.DATE_MED );
  } );
  config.addFilter( 'getReadingTime', text => {
    const wordsPerMinute = 200;
    const numberOfWords = text.split(/\s/g).length;
    return Math.ceil( numberOfWords / wordsPerMinute );
  } );
  config.addFilter( 'prevNote', ( collection, url ) => {
    const index = collection.findIndex( n => n.url === url );
    return index > 0 ? collection[index - 1] : null;
  } );
  config.addFilter( 'nextNote', ( collection, url ) => {
    const index = collection.findIndex( n => n.url === url );
    return index < collection.length - 1 ? collection[index + 1] : null;
  } );
};
