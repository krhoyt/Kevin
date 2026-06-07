<script>
  let {
    disabled = false,
    onsignin = null
  } = $props();

  let input = $state();
  let remember = $state( false );
  let showing = $state( false );

  function onRememberClick() {
    remember = !remember;
  }

  function onShowingClick() {
    showing = !showing;
  }

  function onSignInClick( evt ) {
    if( input.value.trim().length === 0 ) {
      evt.preventDefault();
      alert( 'Password is a required field.' );
      input.focus();
      return;
    }

    onsignin?.( input.value.trim(), remember );
  }
</script>

<section>

  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16 16" style="color: limegreen;">
    <path d="M0 0h16v16H0z" fill="none" />
    <g fill="currentColor">
      <path d="M6 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 9M3.854 4.146a.5.5 0 1 0-.708.708L4.793 6.5L3.146 8.146a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708z" />
      <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    </g>
  </svg>

  <h2>Administration</h2>
  <p class="message">Sign in to manage content.</p>

  <article>

    <!-- Password -->
    <label>
      <p>Password</p>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
        </svg>      
        <input bind:this={input} type={showing ? 'text' : 'password'} />
        <button aria-label="Toggle password" onclick={onShowingClick} type="button">
          {#if showing}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
              <path d="M0 0h16v16H0z" fill="none" />
              <g fill="currentColor">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12l.708-.708l12 12z" />
              </g>
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
              <path d="M0 0h16v16H0z" fill="none" />
              <g fill="currentColor">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0a3.5 3.5 0 0 1-7 0" />
              </g>
            </svg>
          {/if}
        </button>
      </div>
    </label>

    <!-- Remember -->
    <button class="checkbox" onclick={onRememberClick} type="button">
      {#if remember}
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <g fill="currentColor">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093l3.473-4.425z" />
          </g>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
        </svg>      
      {/if}  
      <span>Remember me</span>
    </button>

    <!-- Sign in-->
    <button class="primary" disabled={disabled ? '' : null} onclick={onSignInClick} type="button">Sign in</button>

    <!-- Footer message -->
    <footer>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" style="color: #f4f4f4;">
        <path d="M0 0h16v16H0z" fill="none" />
        <path fill="currentColor" fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
      </svg>

      <p class="message">Your password is required to create, update, or delete content.</p>
    </footer>

  </article>

</section>

<style>
  article {
    background: #1b1b1b;
    background: #222222;
    border-radius: 16px;
    box-shadow: 
      0 2px 8px #0000003d, 
      0 1px 4px #0000001f,
      0 0 1px #0000003d;
    display: flex;
    flex-direction: column;
    margin: 16px 16px 0 16px;
    padding: 16px 0 0 0;
  }

  button.checkbox {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    gap: 16px;
    height: 40px;
    margin: 0 16px 0 16px;
    outline: none;
    padding: 0;
    text-rendering: optimizeLegibility;
  }  

  button.checkbox span {
    flex-basis: 0;
    flex-grow: 1;
    text-align: left;
  }

  button.primary {
    appearance: none;
    background: #345bf8;
    border: none;
    border-radius: 40px;
    color: #ffffff;
    cursor: pointer;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    margin: 16px;
    outline: none;
    padding: 8px 0 8px 0;
    text-rendering: optimizeLegibility;
  }

  footer {
    align-items: center;
    background: #1b1b1b;
    /* border-top: solid 1px #393939; */
    border-bottom-right-radius: 16px;
    border-bottom-left-radius: 16px;
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin: 16px 0 0 0;
    padding: 32px;
  }

  footer p {
    flex-basis: 0;
    flex-grow: 1;
  }

  h2 {
    font-size: 24px;
    line-height: 30px;
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
  }

  label {
    display: flex;
    flex-direction: column;
    margin: 16px;
  }

  label button {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    border-radius: 6px;
    color: #f4f4f4;
    cursor: pointer;
    display: flex;
    height: 32px;
    justify-content: center;
    margin: 0;
    outline: none;
    padding: 0;
    width: 32px;
  }

  label div {
    align-items: center;
    background: #111111;
    border: solid 2px #393939;
    border-radius: 9px;
    display: flex;
    flex-direction: row;
    padding: 0 12px 0 16px;
    transition: border 250ms ease;
  }

  label input {
    appearance: none;
    background: none;
    border: none;
    box-sizing: border-box;
    color: #dbdbdb;
    flex-basis: 0;
    flex-grow: 1;
    font-family: 'Open Sans Variable', sans-serif;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    min-width: 0;
    outline: none;
    padding: 8px 16px 8px 16px;
    text-rendering: optimizeLegibility;
  }

  label p {
    color: #afafaf;
    font-size: 16px;
    line-height: 24px;
    margin: 0 0 6px 0;
    padding: 0;
    text-rendering: optimizeLegibility;
  }

  label svg {
    height: 20px;
    min-height: 20px;;
    min-width: 20px;
    width: 20px;
  }

  label:focus-within div {
    border: solid 2px #f2f2f2;
  }

  section {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    width: 100vw;
  }

  .message {
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    opacity: 0.70;
    padding: 0;
    text-rendering: optimizeLegibility;
  }
</style>
