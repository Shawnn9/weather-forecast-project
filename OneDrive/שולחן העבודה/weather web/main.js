// Load cities from the JSON file and populate the dropdown
async function loadCities() {
    try {
        const response = await fetch('cities.json'); // Fetch cities data
        const data = await response.json(); // Parse the JSON data

        const citySelect = document.getElementById('citySelect');

        // Populate the dropdown with city names
        data.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name; // Set value as city name
            option.textContent = city.name; // Display city name
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching cities:", error);
        document.getElementById('errorMessage').textContent = 'Failed to load cities. Please try again later.';
    }
}

// Event listener to fetch weather when a city is selected
document.getElementById('searchBtn').addEventListener('click', function() {
    const selectedCity = document.getElementById('citySelect').value;

    if (selectedCity) {
        getWeatherData(selectedCity);
    } else {
        document.getElementById('errorMessage').textContent = 'Please select a city.';
    }
});

// Fetch weather data from the 7Timer API based on the city selected
async function getWeatherData(cityName) {
    const forecastContainer = document.getElementById('forecastContainer');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loading');
    forecastContainer.innerHTML = ''; // Clear previous forecast
    errorMessage.textContent = ''; // Clear previous error message
    loadingSpinner.style.display = 'block'; // Show loading spinner

    // Get the selected city's latitude and longitude from the JSON data
    let citiesData;
    try {
        const response = await fetch('cities.json');
        citiesData = await response.json();
    } catch (error) {
        console.error("Error fetching cities:", error);
        errorMessage.textContent = 'Failed to load city data. Please try again later.';
        loadingSpinner.style.display = 'none';
        return;
    }

    const city = citiesData.cities.find(c => c.name === cityName);

    if (!city) {
        errorMessage.textContent = 'City not found. Please try again.';
        loadingSpinner.style.display = 'none';
        return;
    }

    const { lat, lon } = city;

    // Fetch weather data from the 7Timer API
    const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;
    try {
        const weatherResponse = await fetch(apiUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.dataseries) {
            errorMessage.textContent = 'Failed to retrieve weather data.';
            loadingSpinner.style.display = 'none';
            return;
        }

        // Display the 7-day forecast
        const forecast = weatherData.dataseries.slice(0, 7); // Get the first 7 days

        forecast.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('forecast-day');

            const date = new Date(day.time * 1000);  // Convert timestamp to Date object
            const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

            dayElement.innerHTML = `
                <h3>${dateStr}</h3>
                <p>Temp: ${day.temp2m}°C</p>
                <p>Wind: ${day.wind10m_max} km/h</p>
                <p><strong>${day.weather}</strong></p>
            `;

            forecastContainer.appendChild(dayElement);
        });
    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorMessage.textContent = 'Failed to retrieve weather data. Please try again later.';
    } finally {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
    }
}

// Load the cities when the page is loaded
window.onload = loadCities;
