// alert('works')

const apiKey = "Hcew2ROEG8OnPZTbnESF6xet8Y6yKURcLmQVuYJC";

const apiUrl = "https://developer.nrel.gov/api/pvwatts/v8.json";

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

    const params = new URLSearchParams({
        api_key: apiKey,
        address: address,
        system_capacity: systemSize,

        module_type: 1,
        array_type: 1,
        losses: 14,
        tilt: 20,
        azimuth: 180
    });

    // a promise
    const url = apiUrl + "?" + params;
    fetch(url)  

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
            showError("Error retrieving data");
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

            <p>Estimate based on weather data near: ${station.city}, ${station.state}</p>
        </div>
    `;
}