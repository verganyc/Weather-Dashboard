// Define global scope variables
const apiKey = 'a719c6a51c50eef769c8fd900834b224';
const limit = 1;
const cnt = 40;
const units = 'imperial';
let lat = "";
let lon = "";
const cityEl = document.getElementById('city');
const searchButtonEl = document.querySelector('.search-btn');
const currentAndForecastWeatherContainerEl = document.getElementById('current-forecast-weather-container');
const searchHistoryContainerEl = document.getElementById('searchhistory-container');

// Function to get Geographical coordinates based on city
async function getGeoCoordinates(event) {
    event.preventDefault(); // Prevent form submission default action
    let city = cityEl.value.trim();
    if (city === "") {
        return; // Exit function if no city name entered
    }
    
    try {
        const geoCodeAPIURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${apiKey}`;
        const response = await fetch(geoCodeAPIURL);
        if (!response.ok) {
            throw new Error('City not found. Please enter a valid city name.');
        }
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('City not found. Please enter a valid city name.');
        }
        lat = data[0].lat;
        lon = data[0].lon;
        
        saveToLocalStorage(city); // Save city to local storage
        getCurrentWeatherInfo(lat, lon);
    } catch (error) {
        window.alert(error.message);
    }
}

// Function to get current weather info
async function getCurrentWeatherInfo(lat, lon) {
    try {
        const currentWeatherInfoURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
        const response = await fetch(currentWeatherInfoURL);
        if (!response.ok) {
            throw new Error('Error fetching weather data.');
        }
        const data = await response.json();
        displayCurrentWeatherInfo(data);
        getWeatherForecastInfo(lat, lon);
    } catch (error) {
        window.alert(error.message);
    }
}

function displayCurrentWeatherInfo(data) {
    const currentTemperature = data.main.temp;
    const currentHumidity = data.main.humidity;
    const currentWeatherIcon = data.weather[0].icon;
    const currentWindSpeed = data.wind.speed;
    const cityName = data.name;
    const searchUnixTimestamp = data.dt;
    let searchDate = new Date(searchUnixTimestamp * 1000);
    searchDate = searchDate.toLocaleDateString('en-US');

    const currentMaxTemp = data.main.temp_max;
    const currentMinTemp = data.main.temp_min;

    currentAndForecastWeatherContainerEl.innerHTML = ""; // Clear previous content

    const currentWeatherEl = document.createElement('div');
    currentWeatherEl.classList.add("weather-primarycard");
    const weatherIcon = document.createElement('img');
    weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${currentWeatherIcon}.png`);
    weatherIcon.setAttribute("alt", data.weather[0].description);
    const currentWeatherHeaderEl = document.createElement('h3');
    currentWeatherHeaderEl.textContent = `${cityName} (${searchDate})`;
    currentWeatherHeaderEl.appendChild(weatherIcon);
    const currentWeatherTempEl = document.createElement('p');
    currentWeatherTempEl.textContent = `Temp: ${currentTemperature}°F (High: ${currentMaxTemp}°F, Low: ${currentMinTemp}°F)`;
    const currentWeatherWindEl = document.createElement('p');
    currentWeatherWindEl.textContent = `Wind: ${currentWindSpeed} MPH`;
    const currentWeatherHumidEl = document.createElement('p');
    currentWeatherHumidEl.textContent = `Humidity: ${currentHumidity}%`;

    currentWeatherEl.appendChild(currentWeatherHeaderEl);
    currentWeatherEl.appendChild(currentWeatherTempEl);
    currentWeatherEl.appendChild(currentWeatherWindEl);
    currentWeatherEl.appendChild(currentWeatherHumidEl);

    currentAndForecastWeatherContainerEl.appendChild(currentWeatherEl);
}


// Function to get weather forecast info
async function getWeatherForecastInfo(lat, lon) {
    try {
        const weatherForecastInfoURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&cnt=${cnt}`;
        const response = await fetch(weatherForecastInfoURL);
        if (!response.ok) {
            throw new Error('Error fetching forecast data.');
        }
        const data = await response.json();
        displayWeatherForecastInfo(data.list);
    } catch (error) {
        window.alert(error.message);
    }
}

function displayWeatherForecastInfo(list) {
    const forecastHeaderEl = document.createElement('h2');
    forecastHeaderEl.textContent = '5-Day Forecast:';
    currentAndForecastWeatherContainerEl.appendChild(forecastHeaderEl);

    const weatherForecastEl = document.createElement('div');
    weatherForecastEl.classList.add("weather-forecast");

    for (let i = 0; i < list.length; i += 8) {
        const forecastUnixTimestamp = list[i].dt;
        let forecastDate = new Date(forecastUnixTimestamp * 1000);
        forecastDate = forecastDate.toLocaleDateString('en-US');
        const forecastWeatherIcon = list[i].weather[0].icon;
        const forecastWeatherIconSrc = `https://openweathermap.org/img/wn/${forecastWeatherIcon}.png`;
        const forecastTemperature = list[i].main.temp;
        const forecastMaxTemp = list[i].main.temp_max;
        const forecastMinTemp = list[i].main.temp_min;
        const forecastWind = list[i].wind.speed;
        const forecastHumid = list[i].main.humidity;

        const weatherForecastCard = document.createElement('div');
        weatherForecastCard.classList.add("forecast-card");

        const weatherForecastCardBody = document.createElement('div');
        weatherForecastCardBody.classList.add("card-body");

        const forecastDateEl = document.createElement('h5');
        forecastDateEl.textContent = `${forecastDate}`;

        const forecastImgEl = document.createElement('img');
        forecastImgEl.setAttribute("src", forecastWeatherIconSrc);
        forecastImgEl.setAttribute("alt", list[i].weather[0].description);

        const forecastTempEl = document.createElement('p');
        forecastTempEl.textContent = `Temp: ${forecastTemperature}°F (High: ${forecastMaxTemp}°F, Low: ${forecastMinTemp}°F)`;

        const forecastWindEl = document.createElement('p');
        forecastWindEl.textContent = `Wind: ${forecastWind} MPH`;

        const forecastHumidEl = document.createElement('p');
        forecastHumidEl.textContent = `Humidity: ${forecastHumid}%`;

        weatherForecastCardBody.appendChild(forecastDateEl);
        weatherForecastCardBody.appendChild(forecastImgEl);
        weatherForecastCardBody.appendChild(forecastTempEl);
        weatherForecastCardBody.appendChild(forecastWindEl);
        weatherForecastCardBody.appendChild(forecastHumidEl);

        weatherForecastCard.appendChild(weatherForecastCardBody);
        weatherForecastEl.appendChild(weatherForecastCard);
    }

    currentAndForecastWeatherContainerEl.appendChild(weatherForecastEl);
}


// Save searched city to local storage
function saveToLocalStorage(city) {
    let searchKeyWords = JSON.parse(localStorage.getItem("searchKeyWords")) || [];
    searchKeyWords.push({ keyWord: city });
    localStorage.setItem("searchKeyWords", JSON.stringify(searchKeyWords));
}

// Event listeners
document.getElementById('search-form').addEventListener('submit', getGeoCoordinates);
searchHistoryContainerEl.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const city = event.target.textContent;
        cityEl.value = city;
        getGeoCoordinates(event);
    }
});
