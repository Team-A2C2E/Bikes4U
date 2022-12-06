//global
let crd = {}
let userCoordinates = document.querySelector("#user-coordinates");
let stationCards = document.querySelector("#station-cards");
let favoriteDiv = document.querySelector("#favorite-div");
let stationArray = [];
let closestStations = [];
let userAnswers = document.querySelector("#question-div");
let favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];

function getUserCoordinates() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  function success(pos) {
    crd = pos.coords;

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
         crd = pos.coords;

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
          stationObject.latitude = data.network.stations[i].latitude;
          stationObject.longitude = data.network.stations[i].longitude;
          stationObject.distance = 3963.0 * Math.acos(Math.sin(crd.latitude / (180 / Math.PI)) * Math.sin(stationObject.latitude / (180 / Math.PI)) + Math.cos(crd.latitude / (180 / Math.PI)) * Math.cos(stationObject.latitude / (180 / Math.PI)) * Math.cos(stationObject.longitude / (180 / Math.PI) - crd.longitude / (180 / Math.PI)));
          if (stationObject.name.includes("Public", 0) === false) {
            stationArray.push(stationObject);
          }
        }
        stationArray.sort((locationA, locationB) => {
          return locationA.distance > locationB.distance ? 1 : -1;
        });

        // LAST STEP FOR DISPLAY
        closestStations = stationArray.slice(0, 10);
        displayResults(crd);
      }
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
}
function displayResults(current) {
  console.log("crd", current)
  // Adding each Station to its own Div
  closestStations.forEach((station) => {
    stationCards.innerHTML += ` 
        <div class="my-4 flex flex-col p-2">
            <div class="justify-center flex bg-gray-400 font-bold text-lg text-[#4c0473]">${station.name}</div>
            <div class="bg-[#4c0473] p-4 flex justify-around text-white ">
                <div class="">
                    <div>City: ${station.city}</div><div>Distance: ${station.distance.toFixed(2)} Miles</div>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="bg-gray-400 font-bold text-lg text-[#4c0473] p-4" data-long="${station.longitude}" data-lat="${station.latitude}" data-station="${station.name}">ADD AS FAVORITE</button>
                    <a target="_parent" class="bg-gray-400 font-bold text-lg text-[#4c0473] p-4" href="https://www.google.com/maps/dir/${current.latitude},+${current.longitude}/${station.latitude},+${station.longitude}/@${station.latitude},${station.longitude}">NAVIGATE</a>
                </div>
            </div>
            <div class="flex justify-evenly flex-col xl:flex-row bg-[#4c0473] w-100 py-4">
                  <div>
                        <div class="flex-wrap flex justify-center" id="${station.name}div1Head"></div>
                        <div id="${station.name}div1"></div>
                  </div>
                  <div>
                        <div class="flex-wrap flex justify-center" id="${station.name}div2Head"></div>
                        <div id="${station.name}div2"></div>
                  </div>
                  <div>
                        <div class="flex-wrap flex justify-center" id="${station.name}div3Head"></div>
                        <div id="${station.name}div3"></div>
                  </div>
            </div>
        </div>`;
    if (1 === 1) {
      if (station.empty !== 0) {
        let bikeSlotDiv1Head = document.getElementById(`${station.name}div1Head`);
        bikeSlotDiv1Head.innerHTML = `<h3 class="text-white w-full text-center">EMPTY SLOTS</h3>`;
      }
      if (station.renting !== 0) {
        let bikeSlotDiv2Head = document.getElementById(`${station.name}div2Head`);
        bikeSlotDiv2Head.innerHTML = `<h3 class="text-white w-full text-center">RENTING BIKES</h3>`;
      }
      if (station.freeBikes !== 0) {
        let bikeSlotDiv3Head = document.getElementById(`${station.name}div3Head`);
        bikeSlotDiv3Head.innerHTML = `<h3 class="text-white w-full text-center">BIKES AVAILABLE</h3>`;
      }
      for (let i = 0; i < station.empty; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div1`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Black_Bike.png");
        bikeImage.setAttribute("alt", "empty slot");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        // console.log(bikeImage, station.slots, station.name);
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.renting; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div2`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Red_Bike.png");
        bikeImage.setAttribute("alt", "renting bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        // console.log(bikeImage, station.slots, station.name);
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.freeBikes; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div3`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
        bikeImage.setAttribute("alt", "free bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        // console.log(bikeImage, station.slots, station.name);
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
    } else if (1 === 0) {
      [];
    }
  });
  console.log(stationArray);
  //display results

  //createEL
}
function addFavorite(station) {
  
  favoriteStations.unshift(station);
  favoriteStations = favoriteStations.slice(0, 5);
  localStorage.setItem("favoriteStations", JSON.stringify(favoriteStations));
}

function loadFavorites() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  function success(pos) {
    crd = pos.coords;
  
  favoriteStations.forEach((station) => {
    let favoriteStationEL = document.createElement("a");
    favoriteStationEL.setAttribute("class", " h-6 w-6 mx-1 flex");
    favoriteStationEL.setAttribute("href", `https://www.google.com/maps/dir/${crd.latitude},+${crd.longitude}/${station.lat},+${station.long}/@${station.lat},${station.long}`);

    favoriteStationEL.setAttribute("data-lat", station.lat);
    favoriteStationEL.setAttribute("data-long", station.long);
    favoriteStationEL.innerHTML = station.name;
    favoriteDiv.appendChild(favoriteStationEL);
  });
}
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
navigator.geolocation.getCurrentPosition(success, error, options);
}

function init() {
  requestStations();
  loadFavorites();
  //show favorites
  //display 10 stations
}

init();
let stationName = {};
//event listeners
stationCards.addEventListener("click", function (event) {
  event.preventDefault();
  console.log(event.target.getAttribute("data-station"));
  // let stationNameEL = event.target.getAttribute("data-station");
  stationName.name = event.target.getAttribute("data-station");
  stationName.lat = event.target.getAttribute("data-lat")
  stationName.long = event.target.getAttribute("data-long")
  if (stationName !== null) {
    addFavorite(stationName);
  }
});
//anser the cards
