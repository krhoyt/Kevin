<script>
  import Column from "$lib/Column.svelte";
  import { onMount } from "svelte";

  let hasNext = $state( true );  
  let hasPrev = $state( false );
  let items = $state( [] );
  let page = $state( 1 );
  let pageSize = $state( 100 );
  let sortBy = $state( null );
  let sortOrder = $state( null );
  let statusFilter = $state( null );
  let totalPages = $state( 1 );
  let totalRecords = $state( 0 );

  onMount( () => loadMissions() ); 

  function formatNumber( value ) {
    const formatter = new Intl.NumberFormat( navigator.language, { 
      maximumFractionDigits: 0 
    } );
    return formatter.format( value );
  }

  function loadMissions() {
    const params = new URLSearchParams();
    params.set( 'pageSize', pageSize );
    params.set( 'page', page );

    if( statusFilter !== null ) {
      params.set( 'status', statusFilter );
    }

    if( sortBy !== null ) {
      params.set( 'sortBy', sortBy );
      params.set( 'sortOrder', sortOrder );
    }

    console.log( params.toString() );

    fetch( `https://ketnerlake.com/api/space-missions?${params.toString()}` )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      hasNext = data.hasNext;
      hasPrev = data.hasPrev;
      items = [... data.missions];
      page = data.page;
      pageSize = data.pageSize;
      sortBy = data.sortBy;
      sortOrder = data.sortOrder;
      statusFilter = data.statusFilter;
      totalPages = data.totalPages;
      totalRecords = data.totalRecords;
    } );
  }

  function onColumnSort( field, direction ) {
    sortBy = direction === null ? null : field;
    sortOrder = direction;
    loadMissions();
  }

  function onFilterChange( evt ) {
    statusFilter = evt.currentTarget.value === 'NONE' ? null : evt.currentTarget.value;
    console.log( statusFilter );
    loadMissions();
  }

  function onNextClick() {
    page = page + 1;
    loadMissions();
  }

  function onPreviousClick() {
    page = page - 1;
    loadMissions();
  }  
</script>

<section>

  <!-- Header -->
  <header>

    <div>
      <h2>Space Missions</h2>
      <p>by <a href="https://www.linkedin.com/in/parkerkrhoyt/" target="_blank">Kevin Hoyt</a></p>
    </div>

    <!-- Status filter -->
    <div>
      <p class="inline">Status</p>
      <label class="divider">
        <p>{statusFilter === null ? 'Any' : statusFilter}</p>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"/>
        </svg>      
        <select onchange={onFilterChange}>
          <option value="NONE">Any</option>
          <option value="Aborted">Aborted</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
          <option value="In Progress">In Progress</option>                                
          <option value="Partial Success">Partial Success</option>
          <option value="Planned">Planned</option>           
        </select>      
      </label>
    </div>

  </header>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th data-column="0">
          <Column 
            direction={sortBy === 'date' ? sortOrder : null} 
            field="date" 
            label="Date" 
            sort={onColumnSort} />
        </th>
        <th data-column="1">
          <Column 
            direction={sortBy === 'mission_id' ? sortOrder : null} 
            field="mission_id" 
            label="Mission ID" 
            sort={onColumnSort} />
        </th>        
        <th data-column="2">
          <Column 
            direction={sortBy === 'destination' ? sortOrder : null} 
            field="destination" 
            label="Destination" 
            sort={onColumnSort} />          
        </th>
        <th data-column="3">
          <Column 
            direction={sortBy === 'status' ? sortOrder : null} 
            field="status" 
            label="Status" 
            sort={onColumnSort} />          
        </th>
        <th data-column="4">
          <Column 
            direction={sortBy === 'duration_days' ? sortOrder : null} 
            field="duration_days" 
            label="Duration" 
            sort={onColumnSort} />          
        </th>
        <th data-column="5">
          <Column 
            direction={sortBy === 'success_rate' ? sortOrder : null} 
            field="success_rate" 
            label="Success Rate" 
            sort={onColumnSort} />          
        </th>
        <th data-column="6">
          <Column 
            direction={sortBy === 'crew_size' ? sortOrder : null} 
            field="crew_size" 
            label="Crew" 
            sort={onColumnSort} />          
        </th>
        <th data-column="7">
          <Column 
            direction={sortBy === 'security_code' ? sortOrder : null} 
            field="security_code" 
            label="Security Code" 
            sort={onColumnSort} />                    
        </th>
      </tr>
    </thead>
    <tbody>
      {#each items as item}
        <tr>
          <td data-column="0">{item.date}</td>
          <td data-column="1">{item.mission_id}</td>        
          <td data-column="2">{item.destination}</td>
          <td data-column="3">{item.status}</td>
          <td data-column="4">{item.duration_days}</td>
          <td data-column="5">{item.success_rate}</td>
          <td data-column="6">{item.crew_size}</td>
          <td data-column="7">{item.security_code}</td>
        </tr>        
      {/each}
    </tbody>
  </table>

  <!-- Footer -->
  <footer>

    <!-- Items per page -->
    <p>Items per page:</p>
    <label class="divider">
      <p>{pageSize}</p>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"/>
      </svg>      
      <select>
        <option value="100">100</option>
        <option value="200">200</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>                               
      </select>      
    </label>

    <!-- Item range -->
    <p class="divider items">{( ( page - 1 ) * pageSize ) + 1} - {page * pageSize} of {formatNumber( totalRecords )} items</p>

    <!-- Page -->
    <p class="divider pages">{formatNumber( page )} of {formatNumber( totalPages )} pages</p>

    <!-- Previous -->
    <button 
      aria-label="Previous" 
      class="icon previous" 
      disabled={!hasPrev} 
      onclick={onPreviousClick} 
      type="button">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="m13.15 16.15l-3.625-3.625q-.125-.125-.175-.25T9.3 12t.05-.275t.175-.25L13.15 7.85q.075-.075.163-.112T13.5 7.7q.2 0 .35.138T14 8.2v7.6q0 .225-.15.363t-.35.137q-.05 0-.35-.15"/>
      </svg>
    </button>

    <!-- Next -->
    <button 
      aria-label="Next" 
      class="icon" 
      disabled={!hasNext} 
      onclick={onNextClick} 
      type="button">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10.5 16.3q-.2 0-.35-.137T10 15.8V8.2q0-.225.15-.362t.35-.138q.05 0 .35.15l3.625 3.625q.125.125.175.25t.05.275t-.05.275t-.175.25L10.85 16.15q-.075.075-.162.113t-.188.037"/>
      </svg>            
    </button>

  </footer>
</section>

<style>
  :global( html, body ) {
    color: #161616;
    font-family:  'IBM Plex Sans', sans-serif;        
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  :global( body ) {
    display: flex;
    flex-direction: column;
    padding: 42px;
  }
  
  :global( *, *::before, *::after ) {
    box-sizing: inherit;
  }  

  a {
    color: #0f62fe;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button.icon {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    color: #161616;
    cursor: pointer;
    display: flex;
    height: 48px;
    justify-content: center;
    margin: 0;
    outline: none;
    padding: 0;
    transition: background 150ms ease-in-out;
    width: 48px;
    -webkit-tap-highlight-color: transparent;
  }

  button.icon:first-of-type {
    border-right: solid 1px #c6c6c6;
  }

  button.icon:hover {
    background: #e8e8e8;    
  }

  button[disabled].icon {
    color: rgb( from #161616 r g b / 0.25 );
    cursor: not-allowed;
  }

  button[disabled].icon:hover {
    background: transparent;
  }  

  footer {
    border-top: solid 1px #c6c6c6;
    display: flex;
    flex-direction: row;
  }

  footer p {
    color: #161616;
    cursor: default;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    padding: 15px 1px 15px 16px;
  }

  footer p.items {
    color: #525252;
    flex-basis: 0;
    flex-grow: 1;
  }

  footer p.pages {
    padding: 15px 16px 15px 16px;
  }

  footer .divider {
    border-right: solid 1px #c6c6c6;
  }

  h2 {
    color: #161616;
    font-size: 20px;
    font-weight: 400;
    line-height: 28px;
    margin: 0;
    padding: 0;    
  }

  header {
    display: flex;
    flex-direction: row;
    padding: 16px 16px 24px 16px;
  }

  header div:first-of-type {
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
    gap: 2px;
  }

  header div:last-of-type {
    align-items: center;
    display: flex;
    flex-direction: row;
  }  

  header h2 ~ p {
    color: #525252;
    font-size: 14px;
    letter-spacing: 0.16px;
    line-height: 18px;
    margin: 0;
    padding: 0;
  }

  label {
    align-items: center;
    background: transparent;
    color: #161616;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0 8px 0 16px;    
    position: relative;
    transition: background 150ms ease-in-out;
  }

  label:hover {
    background: #e8e8e8;
  }    

  label p {
    color: #161616;
    cursor: pointer;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.16px;
    line-height: 18px;
    margin: 0;
    padding: 15px 2px 15px 0;
  }

  p.inline {
    color: #525252;
    cursor: default;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.16px;
    line-height: 18px;
    margin: 0;
    padding: 15px 8px 15px 0;
  }

  section {
    background: #f4f4f4;
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
  }

  select {
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    height: 48px;
    left: 0;
    margin: 0;
    outline: none;
    opacity: 0;
    padding: 0;
    position: absolute;
    top: 0;
    width: 100%;
    -webkit-tap-highlight-color: transparent;    
  }  

  table {
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
  }

  tbody {
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;
    overflow: auto;
  }

  td {
    color: #525252;
    cursor: default;
    flex-basis: 0;
    flex-grow: 1;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.16px;
    line-height: 18px;
    margin: 0;
    overflow: hidden;
    padding: 15px 16px 15px 16px;
    text-align: left;    
    text-overflow: ellipsis;
    transition: color 150ms ease-in-out;
    white-space: nowrap;
  }

  th {
    flex-basis: 0;
    flex-grow: 1;
    min-width: 0;
  }

  thead {
    background: #e0e0e0;
  }

  tr {
    display: flex;
    flex-direction: row;
  }  

  tbody {
    margin: 0 0 -1px 0;
  }

  tbody tr {
    border-bottom: solid 1px #c6c6c6;
    transition: background 150ms ease-in-out;
  }

  tbody tr:hover {
    background: #e8e8e8;
  }

  tbody tr:hover td {
    color: #161616;
  }  

  @media ( max-width: 1255px ) {
    td[data-column="1"],
    th[data-column="1"] {
      display: none;
    }
  }  

  @media ( max-width: 1085px ) {
    td[data-column="6"],
    th[data-column="6"] {
      display: none;
    }
  }
  
  @media ( max-width: 940px ) {
    td[data-column="5"],
    th[data-column="5"] {
      display: none;
    }
  }  

  @media ( max-width: 715px ) {
    td[data-column="0"],
    th[data-column="0"] {
      display: none;
    }
  }    

  @media ( max-width: 690px ) {
    p.items {
      display: none;
    }

    p.pages {
      flex-basis: 0;
      flex-grow: 1;
    }
  }

  @media ( max-width: 590px ) {
    td[data-column="2"],
    th[data-column="2"] {
      display: none;
    }
  }      

  @media ( max-width: 520px ) {  
    button.previous {
      border-left: solid 1px #c6c6c6;
      margin-left: auto;
    }

    p.pages {
      display: none;
    }
  }

  @media ( max-width: 460px ) {
    :global( body ) {
      padding: 0;
    }
  }  
</style>
