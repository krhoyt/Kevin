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

  config.addFilter( 'htmlDateString', ts => {
    return DateTime.fromJSDate( ts, {zone: 'utc'} ).toLocaleString( DateTime.DATE_MED );
  } );  
  config.addFilter( 'getReadingTime', text => {
    const wordsPerMinute = 200;
    const numberOfWords = text.split(/\s/g).length;
    return Math.ceil( numberOfWords / wordsPerMinute );
  } );  
};
