import { Component, h } from '@stencil/core';

@Component( {
  tag: 'kh-header',
  styleUrl: 'header.css',
  shadow: true
} )
export class Header {
  render() {
    return ( [
      <div>
        <button>Kevin Hoyt</button>
        <button></button>
        <button></button>
      </div>,
      <h2>Kevin Hoyt</h2>,
      <h3>Moar cool shit.</h3>,
      
      <ul>
        <li><a href="">Home</a></li>
        <li><a href="">About</a></li>
        <li><a href="">Events</a></li>
        <li><a href="">Lounge</a></li>
      </ul>
    ] );
  }
}
