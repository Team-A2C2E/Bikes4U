//global

let userCoordinates = document.querySelector("#user-coordinates");
let stationCards = document.querySelector("#station-cards");

function getUserCoordinates() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    function success(pos) {
        const crd = pos.coords;

        userCoordinates.innerHTML = `<div>Latitude : ${crd.latitude}</div>`
        userCoordinates.innerHTML += `<div>Longitude : ${crd.longitude}</div>`
    }
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
}

function displayStations() {
    fetch("http://api.citybik.es/v2/networks/divvy")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data.network);
            data.network.stations.forEach(station => {
                stationCards.innerHTML += `<div>${station.name}</div>`;
            });
        });
    //display results
    //createEL 

}

function init() {
    getUserCoordinates();
    displayStations();
    //show favorites
    //display 5 stations
}


init();

//event listeners
//anser the cards