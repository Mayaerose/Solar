// alert('works')

const apiKey = "Hcew2ROEG8OnPZTbnESF6xet8Y6yKURcLmQVuYJC";

// NREL moved to developer.nlr.gov, and the old address no longer answers
const apiUrl = "https://developer.nlr.gov/api/pvwatts/v8.json";

// PVWatts now wants a latitude and longitude instead of an address, so a city is turned into
// those first with this free geocoding service
const geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search";

const form = document.getElementById("solar-form");
const resultsBox = document.getElementById("results");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const address = document.getElementById("address").value;
    const systemSize = document.getElementById("system-size").value;

    getSolarEstimate(address, systemSize);
});


function getSolarEstimate(address, systemSize) {

    resultsBox.innerHTML = '<p class="loading">Getting your estimate</p>';

    // step 1: find the latitude and longitude of the city
    const placeUrl = geocodeUrl + "?" + new URLSearchParams({ name: address, count: 1, language: "en", format: "json" });

    fetch(placeUrl)

        .then(function (response) {
            return response.json();
        })

        // step 2: ask PVWatts about that spot
        .then(function (geo) {
            if (!geo.results || geo.results.length === 0) {
                throw new Error("city not found");
            }

            const place = geo.results[0];

            const params = new URLSearchParams({
                api_key: apiKey,
                lat: place.latitude,
                lon: place.longitude,
                system_capacity: systemSize,

                module_type: 1,
                array_type: 1,
                losses: 14,
                tilt: 20,
                azimuth: 180
            });

            // a promise
            const url = apiUrl + "?" + params;
            return fetch(url);
        })

        //Json to javascrpt
        .then(function (response) {
            return response.json();
        })

        // Shows the result 
        .then(function (data) {
            if (data.errors && data.errors.length > 0) {
                showError(data.errors[0]);
                return;
            }
            showResults(data);
        })

        // this is the last effort 
        .catch(function (error) {
            if (error.message === "city not found") {
                showError("We couldn't find that city. Check the spelling and try again.");
            } else {
                showError("Error retrieving data");
            }
            console.error(error);
        });
}

function showError(message) {
    resultsBox.innerHTML = `<p class="error"> ${message}</p>`;
}


function showResults(data) {

    const outputs = data.outputs;
    const station = data.station_info;

    const annualKwh = Math.round(outputs.ac_annual);
    const monthlyAverageKwh = Math.round(annualKwh / 12);

    resultsBox.innerHTML = `
        <div class="result-card">
            <h2 class="result-title">Estimated Solar Production</h2>

            <p class="big-number">${annualKwh.toLocaleString()} kWh / year</p>
            <p>That's about ${monthlyAverageKwh.toLocaleString()} kWh per month on average.</p>

            <p>Estimate based on weather data near: ${[station.city, station.state].filter(Boolean).join(', ')}</p>
        </div>
    `;
}