document.addEventListener("DOMContentLoaded", () => {
    let apiUrl = "https://api.openweathermap.org/data/3.0/onecall?exclude=minutely&appid=221f9aa3d26d45612174323bcf3a5760&units=metric";
    const storedLatitude = localStorage.getItem('latitude');
    const storedLongitude = localStorage.getItem('longitude');

    // Check if coordinates are available in the local storage
    if (storedLatitude && storedLongitude) {
        // Make an initial API call and show the response using the stored coordinates
        checkWeather(storedLatitude, storedLongitude);
    }

    function toggleUnits() {
        isMetric = !isMetric;

        if (isMetric) {
            apiUrl = apiUrl.replace("&units=imperial", "&units=metric");
        } else {
            apiUrl = apiUrl.replace("&units=metric", "&units=imperial");
        }

        // Fetch weather data again using the updated API URL
        const storedLatitude = localStorage.getItem('latitude');
        const storedLongitude = localStorage.getItem('longitude');
        checkWeather(storedLatitude, storedLongitude);
    }


    // Call toggleUnits when the units button is clicked
    const unitsBtn = document.getElementById('toggleUnitsBtn');
    unitsBtn.addEventListener('click', toggleUnits);
    let isMetric = true;

    async function getCityCoordinates(cityName) {
        try {
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=221f9aa3d26d45612174323bcf3a5760`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.length > 0) {
                const cityData = data[0];
                const cityName = cityData.name;
                const country = cityData.country;
                return { lat: cityData.lat, lon: cityData.lon, cityName, country };
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            throw new Error('Error retrieving city coordinates');
        }
    }

    // Function to set the city name and country
function setCityAndCountry(cityName, country) {
    const cityElement = document.querySelector("#cityName");
    cityElement.innerHTML = `${cityName}, ${country}`;
}

    async function checkWeather(lat, lon){
        try {
            const response = await fetch(apiUrl + '&lat=' + lat + '&lon=' + lon);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();
            console.log(data);
            const temperatureUnit = isMetric ? "°C" : "°F";
            const speedUnit = isMetric ? "m/s" : "mi/h";
            const windSpeedMetric = (data.current.wind_speed * 3.6).toFixed(1); // Convert m/s to km/h
            // Get city and country using the getCityCoordinates function
            const { lat: latitude, lon: longitude, cityName, country } = await getCityCoords(lat, lon);
            // Display city and country names
            document.querySelector("#cityName").innerHTML = `${cityName}, ${country}`;
            document.querySelector("#temp").innerHTML = Math.round(data.current.temp) + temperatureUnit;
            document.querySelector("#main").innerHTML = (data.current.weather[0].description);
            document.querySelector("#currentBigIcon").src = getWeatherIcon(data.current.weather[0].icon);
            document.querySelector("#Humidity").innerHTML = data.current.humidity + "%";
            document.querySelector("#Wind_s").innerHTML = Math.round(data.current.wind_speed) + speedUnit;
            document.querySelector("#UV_index").innerHTML = Math.round(data.current.uvi);
            document.querySelector("#Feels_like").innerHTML = Math.round(data.current.feels_like) + temperatureUnit;;
            document.querySelector("#Pressure").innerHTML = data.current.pressure + " hPa";
            document.querySelector("#Dew_point").innerHTML = Math.round(data.current.dew_point) + temperatureUnit;
            const apiSunriseTime = formatTime(data.current.sunrise, data.timezone);
            const apiSunsetTime = formatTime(data.current.sunset, data.timezone);
            document.querySelector("#sunrise").innerHTML = apiSunriseTime;
            document.querySelector("#sunset").innerHTML = apiSunsetTime;

            for (let i = 1; i < 13; i++) {
                //recursively select an item with the id "#dn" and then insert the temps in to it.
                let querySelection = "#h" + i + "a";
                document.querySelector(querySelection).innerHTML = formatTime(data.hourly[i].dt, data.timezone);
                querySelection = "#h" + i;
                document.querySelector(querySelection).innerHTML = Math.round(data.hourly[i].temp) + temperatureUnit;

                //Same as above, only selecting the image id instead
                querySelection = "#h" + i + "img";
                let weatherDesc = data.hourly[i].weather[0].icon; //turns out the api already has its own icons, use these as a basis for selecting ours
                let weatherIcon = getWeatherIcon(weatherDesc);
                const icon = document.querySelector(querySelection);
                icon.src = weatherIcon;
                //change icon.src to whatever the switch results in
            }       

            for (let i = 1; i < 8; i++) {
                //recursively select an item with the id "#dn" and then insert the temps in to it.
                let querySelection = "#d" + i + "a";
                document.querySelector(querySelection).innerHTML = formatDate(data.daily[i].dt, data.timezone);
                querySelection = "#d" + i;
                document.querySelector(querySelection).innerHTML = "min: " + Math.round(data.daily[i].temp.min) + temperatureUnit + "<br>" + "max: " + Math.round(data.daily[i].temp.max) + temperatureUnit;

                //Same as above, only selecting the image id instead
                querySelection = "#d" + i + "img";
                let weatherDesc = data.daily[i].weather[0].icon; //turns out the api already has its own icons, use these as a basis for selecting ours
                let weatherIcon = getWeatherIcon(weatherDesc);
                const icon = document.querySelector(querySelection);
                icon.src = weatherIcon;
                //change icon.src to whatever the switch results in
            }
            localStorage.setItem('latitude', lat);
            localStorage.setItem('longitude', lon);
            // Clear the search bar after fetching the data
            const searchInput = document.querySelector("#search-input[data-search-id='city-search']");
            searchInput.value = ''; // Set the value to an empty string
        } 
        catch (err) {
            displayErrorMessage(error.message);
        }
    }

    async function displayErrorMessage(message) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.textContent = message;
    }

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    function _setCityName(cityName, countryName) {
        this.cityName = cityName;
        this.countryName = countryName; // Assign the country name to the variable
        document.getElementById("cityName").innerHTML = cityName + ", " + countryName; // Update the element's content
    }


    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const cityInputValue = searchInput.value.trim();
        if (cityInputValue) {
            try {
                const { lat, lon, cityName, country } = await getCityCoordinates(cityInputValue);

                localStorage.setItem('latitude', lat);
                localStorage.setItem('longitude', lon);

                _setCityName(cityName, country);
                await checkWeather(lat, lon);
            } catch (error) {
                displayErrorMessage(error.message);
            }
        }
    });

    const formatTime = (unixTimestamp, timezone) => {
        const date = new Date(unixTimestamp * 1000);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone
        };
        return date.toLocaleTimeString([], options);
    };

    const formatDate = (unixTimestamp, timezone) => {
        const date = new Date(unixTimestamp * 1000);
        const options = {
            weekday: 'long', // Display the full name of the day of the week
            month: 'long',   // Display the full name of the month
            day: 'numeric',  // Display the day of the month as a number
            timeZone: timezone
        };
        
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateAndMonth = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        return `${dayOfWeek}, ${dateAndMonth}`;
    };

    function getWeatherIcon(weatherIconName) {
    let weatherIcon;
        switch (weatherIconName) {
        case '01d':
            weatherIcon = "Resources/svg/wi-day-sunny.svg";
            break;
        case '02d':
            weatherIcon = "Resources/svg/wi-day-cloudy.svg";
            break;
        case '03d':
            weatherIcon = "Resources/svg/wi-day-cloudy-high.svg";
            break;
        case '04d':
            weatherIcon = "Resources/svg/wi-cloudy.svg";
            break;
        case '09d':
            weatherIcon = "Resources/svg/wi-day-showers.svg";
            break;
        case '10d':
            weatherIcon = "Resources/svg/wi-day-rain.svg";
            break;
        case '11d':
            weatherIcon = "Resources/svg/wi-day-thunderstorm.svg";
            break;
        case '13d':
            weatherIcon = "Resources/svg/wi-day-csnow.svg";
            break;
        case '50d':
            weatherIcon = "Resources/svg/wi-day-fog.svg";
            break;
        case '01n':
            weatherIcon = "Resources/svg/wi-night-clear.svg";
            break;
        case '02n':
            weatherIcon = "Resources/svg/wi-night-alt-cloudy.svg";
            break;
        case '03n':
            weatherIcon = "Resources/svg/wi-night-alt-cloudy-high.svg";
            break;
        case '04n':
            weatherIcon = "Resources/svg/wi-cloudy.svg";
            break;
        case '09n':
            weatherIcon = "Resources/svg/wi-night-alt-showers.svg";
            break;
        case '10n':
            weatherIcon = "Resources/svg/wi-night-alt-rain.svg";
            break;
        case '11n':
            weatherIcon = "Resources/svg/wi-night-alt-thunderstorm.svg";
            break;
        case '13n':
            weatherIcon = "Resources/svg/wi-night-alt-snow.svg";
            break;
        case '50n':
            weatherIcon = "Resources/svg/wi-night-fog.svg";
            break;
        }
    return weatherIcon;
    }
    // Function to get geolocation coordinates
    async function getGeolocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error)
            );
        });
    }

    async function getCityCoords(lat, lon) {
        try {
            const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=221f9aa3d26d45612174323bcf3a5760`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.length > 0) {
                const cityData = data[0];
                const cityName = cityData.name;
                const country = cityData.country;
                return { cityName, country };
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            throw new Error('Error retrieving city coordinates');
        }
    }

    async function getWeatherByGeolocation() {
        try {
            const coords = await getGeolocation();
            const { latitude, longitude } = coords;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            // Fetch city and country data using geolocation coordinates
            const { cityName, country } = await getCityCoords(latitude, longitude);

            // Update the cityName and countryName variables and display them
            _setCityName(cityName, country);

            // Fetch weather data using geolocation coordinates
            await checkWeather(latitude, longitude);
        } catch (error) {
            console.error('Error getting geolocation or weather data:', error);
        }
    }
    // Event listener for logo click
    document.getElementById("logo").addEventListener("click", () => {
        // Use the Geolocation API to get current geoposition
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Save the coordinates in local storage
                    localStorage.setItem('latitude', latitude);
                    localStorage.setItem('longitude', longitude);

                    // Make the API request and update the weather data
                    getWeatherByGeolocation(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting geoposition:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    });
});