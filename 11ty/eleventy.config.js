import { DateTime } from "luxon";
import pluginRss from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function( config ) {
  config.addPassthroughCopy( 'img' );
  config.addPassthroughCopy( 'style' );  

  config.addPlugin( pluginRss );    
	config.addPlugin( syntaxHighlight );

  config.addFilter( 'htmlDateString', ts => {
    return DateTime.fromJSDate( ts, {zone: 'utc'} ).toLocaleString( DateTime.DATE_MED );
  } );  
  config.addFilter( 'getReadingTime', text => {
    const wordsPerMinute = 200;
    const numberOfWords = text.split(/\s/g).length;
    return Math.ceil( numberOfWords / wordsPerMinute );
  } );  
};
