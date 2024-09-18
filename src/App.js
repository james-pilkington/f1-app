document.addEventListener('DOMContentLoaded', function () {
  const app = document.getElementById('app');

  const renderDashboard = () => {
      app.innerHTML = `
          <div class="container">
              <h1>F1 Historical and Live Stats Dashboard</h1>

              <!-- Year and Race Selector -->
              <div id="yearselect">
                  <label for="yearSelect">Year:</label>
                  <select id="yearSelect">
                      <option value="" disabled selected>Choose a year</option>
                  </select>
              </div>

              <!-- Results Section -->
              <div id="results">
                  <h2>Results based on selector</h2>
                  <ul>
                      <li>Please select a race to view results.</li>
                  </ul>
              </div>

              <!-- Highlights Section -->
              <div id="highlights">
                  <h2>Highlights based on selector</h2>
                  <p>Please select a race to view highlights.</p>
              </div>

              <!-- Other Sections -->
              <div id="racelist">
                  <h3>List of F1 Races</h3>
                  <ul id="raceList"></ul> <!-- Populate with list of races -->
              </div>
              <div id="driverstandingSection">
                  <h3>Driver Standings</h3>
                  <ul id="driverstanding"></ul> <!-- Populate with driver standings -->
              </div>
              <div id="constructorstandingSection">
                  <h3>Constructor Standings</h3>
                  <ul id="constructorstanding"></ul> <!-- Populate with constructor standings -->
              </div>
          </div>

           <!-- Live Information -->
            <div class="container" id="liveRace">
                <h1>Live Race</h1>
                <div id="currentStanding">
                    <h3>Current Standing</h3>
                    <ul id="currentStandingList"></ul> <!-- Populate with current standings -->
                </div>
                <div id="raceControl">
                    <h3>Race Control</h3>
                    <p id="latestRaceInfo">Fetching latest race...</p> <!-- Populate with latest race info -->
                </div>
            </div>
      `;

      const yearSelect = document.getElementById('yearSelect');
      const raceListEl = document.getElementById('raceList');
      const driverStandingsEl = document.getElementById('driverstanding');
      const constructorStandingsEl = document.getElementById('constructorstanding');

      // Fetch and populate the year dropdown
      fetch('https://ergast.com/api/f1/seasons?limit=300.json')
          .then(response => response.text())
          .then(str => {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(str, 'application/xml');
              const seasons = xmlDoc.getElementsByTagName('Season');
              const years = [];

              for (const season of seasons) {
                  const year = season.textContent;
                  years.push(year);
              }

              const uniqueYears = [...new Set(years)];
              uniqueYears.sort((a, b) => b - a);
 
              uniqueYears.forEach(year => {
                  const option = document.createElement('option');
                  option.value = year;
                  option.textContent = year;
                  yearSelect.appendChild(option);
              });
          })
          .catch(error => console.error('Error fetching years:', error));

      // Fetch and display the list of races based on the selected year
      yearSelect.addEventListener('change', function () {
        const selectedYear = yearSelect.value;
        raceListEl.innerHTML = ''; // Clear previous list of races
        driverStandingsEl.innerHTML = ''; // Clear previous driver standings
        constructorStandingsEl.innerHTML = ''; // Clear previous constructor standings

    
        // Use backticks for template literals in the fetch URL
        fetch(`https://ergast.com/api/f1/${selectedYear}.json`)
            .then(response => response.json())
            .then(data => {
                const races = data.MRData.RaceTable.Races; // Accessing the race data structure
                races.forEach(race => {
                    const li = document.createElement('li');
                    li.textContent = `${race.round} - ${race.raceName}`; // Adjusting to the correct field name
                        li.addEventListener('click', function () {
                          // Remove highlight from all list items
                          const allItems = raceListEl.querySelectorAll('li');
                          allItems.forEach(item => item.classList.remove('highlight'));
      
                          // Highlight the clicked item
                          li.classList.add('highlight');

                          // Call the function to fetch race results
                          const raceRound = race.round;  // Assuming `race` is available in this context
                          const selectedYear = yearSelect.value;  // Assuming `yearSelect` is accessible
                          fetchRaceResults(raceRound, selectedYear);
                      });
                    raceListEl.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching races:', error));

            fetch(`https://ergast.com/api/f1/${selectedYear}/driverStandings.json`)
            .then(response => response.json())
            .then(data => {
                const drivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                drivers.forEach(driver => {
                    const li = document.createElement('li');
                    li.textContent = `${driver.position} - ${driver.Driver.familyName} - ${driver.points}`;
                    driverStandingsEl.appendChild(li);
                });
          })
          .catch(error => console.error('Error fetching races:', error));

          fetch(`https://ergast.com/api/f1/${selectedYear}/constructorStandings.json`)
                .then(response => response.json())
                .then(data => {
                    const constructors = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
                    constructors.forEach(constructor => {
                        const li = document.createElement('li');
                        li.textContent = `${constructor.position} - ${constructor.Constructor.name} - ${constructor.points}`;
                        constructorStandingsEl.appendChild(li);
                    });
          })
          .catch(error => console.error('Error fetching races:', error));
          

    });
  };

  // Function to fetch race results based on race round and year
function fetchRaceResults(raceRound, year) {
  fetch(`https://ergast.com/api/f1/${year}/${raceRound}/results.json`)
      .then(response => response.json())
      .then(data => {
          // Handle the data returned from the API
          const results = data.MRData.RaceTable.Races[0].Results;

          // Clear previous results
          const resultsEl = document.getElementById('results');
          resultsEl.innerHTML = '';
          resultsEl.innerHTML = `<h2>Results for Race ${raceRound} - ${data.MRData.RaceTable.Races[0].raceName}</h2>`;
          const ul = document.createElement('ul');

          results.forEach((result,index) => {
            const li = document.createElement('li');
            li.classList.add('result-item');
        
            // Create a div for the position and driver/constructor info
            const infoDiv = document.createElement('div');
            infoDiv.classList.add('result-info');
            infoDiv.textContent = `${result.position} - ${result.Driver.familyName} (${result.Constructor.name})`;
        
            // Create a div for the points
            const pointsDiv = document.createElement('div');
            pointsDiv.classList.add('result-points');
            pointsDiv.textContent = `${result.points} points`;
        
            // Append the info and points divs to the li
            li.appendChild(infoDiv);
            li.appendChild(pointsDiv);
        
            // Add a class to hide items after the 10th place
            if (index >= 10) {
              li.classList.add('hidden');
            }
            // Append the li to the ul
            ul.appendChild(li);
        });

          resultsEl.appendChild(ul);

          if (results.length > 10) {
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Show more';
            toggleButton.classList.add('toggle-button');
        
            // Add event listener for expanding/collapsing the list
            toggleButton.addEventListener('click', function () {
              const hiddenItems = ul.querySelectorAll('.result-item.hidden');
              
              // Toggle visibility of all hidden items
              hiddenItems.forEach(item => item.classList.remove('hidden'));
              
              // Check if there are still hidden items and update button text accordingly
              if (toggleButton.textContent === 'Show more') {
                  toggleButton.textContent = 'Show less';
              } else {
                  ul.querySelectorAll('.result-item').forEach((item, index) => {
                      if (index >= 10) item.classList.add('hidden');
                  });
                  toggleButton.textContent = 'Show more';
              }
          });
        
            // Append the toggle button after the list
            ul.parentNode.appendChild(toggleButton);
        }
      })
      .catch(error => console.error('Error fetching race results:', error));
      fetchLiveRaceData();
}

// Function to fetch and update the live race data
const fetchLiveRaceData = () => {
  // Fetch the latest race data
  fetch('https://api.openf1.org/v1/meetings?year=2024')
      .then(response => response.json())
      .then(data => {
          const latestRace = data.meetings[data.meetings.length - 1];
          const meetingKey = latestRace.meeting_key;
          const raceInfoEl = document.getElementById('latestRaceInfo');

          // Update the race info
          raceInfoEl.textContent = `Latest Race: ${latestRace.meeting_name}`;

          // Fetch the current standings for this race
          fetch(`https://api.openf1.org/v1/position?meeting_key=${meetingKey}`)
              .then(response => response.json())
              .then(data => {
                  const currentStandingsEl = document.getElementById('currentStandingList');
                  currentStandingsEl.innerHTML = ''; // Clear previous standings

                  // Display top 10 standings
                  data.positions.slice(0, 10).forEach((position, index) => {
                      const li = document.createElement('li');
                      li.textContent = `${index + 1}. ${position.driver_name} - ${position.points} points`;
                      currentStandingsEl.appendChild(li);
                  });
              })
              .catch(error => console.error('Error fetching current standings:', error));
      })
      .catch(error => console.error('Error fetching latest race:', error));
};

  // Initial rendering of the dashboard
  renderDashboard();

  // Fetch live race data initially
  //fetchLiveRaceData();

  // Set up an interval to refresh the live race data every minute
  //setInterval(fetchLiveRaceData, 60000);
});
