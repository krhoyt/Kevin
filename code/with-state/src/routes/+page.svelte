<script>
  import CountProperty from "$lib/CountProperty.svelte";
  import CountValue from "$lib/CountValue.svelte";

  let count = $state( 10 );
  let item = $state( {count: 10} );

  function onPropertyChange( value ) {
    item = {... value};
    
    // Will cause an error
    // console.log( item );

    console.log( $state.snapshot( item ) );
  }

  function onValueChange( value ) {
    count = value;
    console.log( count );
  }
</script>

<p>By value:</p>
<CountValue {count} onchange={onValueChange} />

<p>By property:</p>
<CountProperty {item} onchange={onPropertyChange} />

<style>
  p {
    color: #161616;
    font-family: sans-serif;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    padding: 0 0 4px 0;
  }

  p:last-of-type {
    padding: 16px 0 4px 0;
  }
</style>
