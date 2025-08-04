// Radians
function degreesToRadians( degrees ) {
  return degrees * Math.PI / 180;
}

// Map range
function map( value, in_min, in_max, out_min, out_max ) {
  const ratio = ( value - in_min ) / ( in_max - in_min );
  return out_min + ( ratio * ( out_max - out_min ) );      
}   

// Label placement
function placement( index, count ) {
  const degrees = ( 360 / count ) * index;

  let anchor = 'middle'
  let baseline = 'auto';

  if( degrees === 0 ) {
    anchor = 'middle';
    baseline = 'auto';        
  } else if( degrees > 0 && degrees < 90 ) {
    anchor = 'start';
    baseline = 'auto';   
  } else if( degrees === 90 ) {
    anchor = 'start';
    baseline = 'middle';        
  } else if( degrees > 90 && degrees < 180 ) {
    anchor = 'start';
    baseline = 'hanging';        
  } else if( degrees === 180 ) {
    anchor = 'middle';
    baseline = 'hanging';                
  } else if( degrees > 180 && degrees < 270 ) {
    anchor = 'end';
    baseline = 'hanging';                        
  } else if( degrees === 270 ) {
    anchor = 'end';
    baseline = 'middle';                        
  } else {
    anchor = 'end';
    baseline = 'auto';                                
  }

  return {baseline, anchor};
} 
