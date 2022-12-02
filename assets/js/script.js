//global

let userCoordinates = document.querySelector("#user-coordinates");
let stationCards = document.querySelector("#station-cards");
let stationArray = [];
let closestStations = [];
letuserAnswers =

  function getUserCoordinates() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    function success(pos) {
      const crd = pos.coords;

      userCoordinates.innerHTML = `<div>Latitude : ${crd.latitude}</div>`;
      userCoordinates.innerHTML += `<div>Longitude : ${crd.longitude}</div>`;
    }
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  }

function requestStations() {
  let requestURL = "https://api.citybik.es/v2/networks/divvy";
  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };
      function success(pos) {
        const crd = pos.coords;

        userCoordinates.innerHTML = `<div>Latitude : ${crd.latitude}</div>`;
        userCoordinates.innerHTML += `<div>Longitude : ${crd.longitude}</div>`;

        console.log(data.network);
        for (let i = 0; i < data.network.stations.length; i++) {
          let stationObject = {};
          stationObject.name = data.network.stations[i].name;
          stationObject.empty = data.network.stations[i].empty_slots;
          stationObject.slots = data.network.stations[i].extra.slots;
          stationObject.renting = data.network.stations[i].extra.renting;
          stationObject.city = data.network.location.city;
          stationObject.freeBikes = data.network.stations[i].free_bikes;
          stationObject.returning = data.network.stations[i].extra.returning;
          stationObject.extraSlot = data.network.stations[i].extra.slots;
          stationObject.distance = 3963.0 * Math.acos(Math.sin(crd.latitude / (180 / Math.PI)) * Math.sin(data.network.stations[i].latitude / (180 / Math.PI)) + Math.cos(crd.latitude / (180 / Math.PI)) * Math.cos(data.network.stations[i].latitude / (180 / Math.PI)) * Math.cos(data.network.stations[i].longitude / (180 / Math.PI) - crd.longitude / (180 / Math.PI)));
          if (stationObject.name.includes("Public", 0) === false) {
            stationArray.push(stationObject);
          }
        }
        stationArray.sort((locationA, locationB) => {
          return locationA.distance > locationB.distance ? 1 : -1;
        });

        // LAST STEP FOR DISPLAY
        closestStations = stationArray.slice(0, 10);
        displayResults();
      }
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
}
function displayResults() {
  // Adding each Station to its own Div
  closestStations.forEach((station) => {
    stationCards.innerHTML += ` 
        <div class="my-4 flex flex-col">
            <div class="justify-center flex bg-gray-400 font-bold text-lg text-[#4c0473]">${station.name}</div>
            <div class="bg-[#4c0473] p-4 flex justify-around text-white ">
                <div class="">
                    <div>City: ${station.city}</div><div>Distance: ${station.distance.toFixed(2)} Miles</div>
                </div>
                <div>
                    <div>Empty Slots: ${station.empty}</div><div>Renting: ${station.renting}</div><div>Free Bikes: ${station.freeBikes}</div><div>Total Slots: ${station.slots}</div>
                </div>
            </div>
            <div class="flex-wrap flex" id="${station.name}">

            </div>
            </div>`;
    if (1 === 1) {

      for (let i = 0; i < station.slots; i++) {
        let bikeSlotDiv = document.getElementById(station.name)
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
        bikeImage.setAttribute("alt", "empty slot");
        bikeImage.setAttribute("class", " h-5 w-5");
        console.log(bikeImage, station.slots, station.name);
        bikeSlotDiv.appendChild(bikeImage);
      }
    } else if (1 === 0) {
      [];
    }
  });
  console.log(stationArray);
  //display results

  //createEL
}


function init() {
  requestStations();
  //show favorites
  //display 10 stations
}

init();

//event listeners
//anser the cards
