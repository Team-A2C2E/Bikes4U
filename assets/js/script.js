//global

let crd = {};
let userLatitude = [];
let userLongitude = [];
let userCoordinates = document.querySelector("#user-coordinates");
let stationCards = document.querySelector("#station-cards");
let favoriteDiv = document.querySelector("#favorite-div");
let stationArray = [];
let stationArrayFiltered = [];
let closestStations = [];
let enterBtn = document.querySelector("#enter-btn");
let rentingBtn = document.querySelector("#renting-btn");
let returningBtn = document.querySelector("#returning-btn");
let numberBikes = document.getElementById("num-bike");
let questionDiv = document.querySelector("#question-div");
let searchAgainButton = "";
let leftSide = document.querySelector("#left-side");
let isRenting = false;
let favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];
let numBikes = 0;
let bikeType = "empty";

function pullUserCoordinates() {
  userCoordinates.innerHTML = `<div><div>Latitude</div><div id="userLatitude">${crd.latitude}</div></div>`;
  userCoordinates.innerHTML += `<div><div>Latitude</div><div id="userLongitude">${crd.longitude}</div></div>`;
  userLatitude = document.querySelector("#userLatitude");
  userLongitude = document.querySelector("#userLongitude");
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
        timeout: 10000,
        maximumAge: 0,
      };
      function success(pos) {
        crd = pos.coords;
        questionDiv.setAttribute("class", "absolute object-center w-4/5 h-80 bg-white flex block");

        userCoordinates.innerHTML = `<div><div>Latitude</div><div id="userLatitude">${crd.latitude}</div></div>`;
        userCoordinates.innerHTML += `<div><div>Latitude</div><div id="userLongitude">${crd.longitude}</div></div>`;
        userCoordinates.innerHTML += `<button id="search-again-button" class="w-5/6 bg-[#4c0473] p-4 justify-center">SEARCH AGAIN?</button>`;
        userLatitude = document.querySelector("#userLatitude");
        userLongitude = document.querySelector("#userLongitude");

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
      }
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
}
function displayResults() {
  stationCards.innerHTML = "";
  stationArrayFiltered = [];
  stationArray.forEach((station) => {
    if (station[bikeType] > numBikes) {
      stationArrayFiltered.push(station);
      console.log(station);
    }
  });

  closestStations = stationArrayFiltered.slice(0, 10);

  // Adding each Station to its own Div
  closestStations.forEach((station) => {
    stationCards.innerHTML += ` 
        <div class="flex flex-col px-2 mb-4">
            <div class="justify-center flex bg-gray-400 font-bold text-lg text-[#4c0473]">${station.name}</div>
            <div class="bg-[#4c0473] p-4 flex justify-around text-white ">
                <div class="">
                    <div>City: ${station.city}</div><div>Distance: ${station.distance.toFixed(2)} Miles</div>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="bg-gray-400 font-bold text-lg text-[#4c0473] p-4" data-long="${station.longitude}" data-lat="${station.latitude}" data-station="${station.name}">ADD AS FAVORITE</button>
                    <a class="bg-gray-400 cursor-pointer font-bold text-lg text-[#4c0473] p-4 text-center" onclick="window.location = 'https://www.google.com/maps/dir/${userLatitude.innerHTML},+${userLongitude.innerHTML}/${station.latitude},+${station.longitude}/@${station.latitude},${station.longitude}'">NAVIGATE</a>
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

    if (isRenting === false) {
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
        bikeImage.setAttribute("class", "h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.renting; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div2`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Red_Bike.png");
        bikeImage.setAttribute("alt", "renting bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.freeBikes; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div3`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
        bikeImage.setAttribute("alt", "free bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
    } else if (isRenting === true) {
      if (station.empty !== 0) {
        let bikeSlotDiv1Head = document.getElementById(`${station.name}div3Head`);
        bikeSlotDiv1Head.innerHTML = `<h3 class="text-white w-full text-center">EMPTY SLOTS</h3>`;
      }
      if (station.renting !== 0) {
        let bikeSlotDiv2Head = document.getElementById(`${station.name}div2Head`);
        bikeSlotDiv2Head.innerHTML = `<h3 class="text-white w-full text-center">RENTING BIKES</h3>`;
      }
      if (station.freeBikes !== 0) {
        let bikeSlotDiv3Head = document.getElementById(`${station.name}div1Head`);
        bikeSlotDiv3Head.innerHTML = `<h3 class="text-white w-full text-center">BIKES AVAILABLE</h3>`;
      }
      for (let i = 0; i < station.empty; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div3`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Black_Bike.png");
        bikeImage.setAttribute("alt", "empty slot");
        bikeImage.setAttribute("class", "h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.renting; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div2`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Red_Bike.png");
        bikeImage.setAttribute("alt", "renting bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
      for (let i = 0; i < station.freeBikes; i++) {
        let bikeSlotDiv = document.getElementById(`${station.name}div1`);
        let bikeImage = document.createElement("img");
        bikeImage.setAttribute("src", "./assets/img/Green_Bike.png");
        bikeImage.setAttribute("alt", "free bikes");
        bikeImage.setAttribute("class", " h-6 w-6 mx-1 flex");
        bikeSlotDiv.appendChild(bikeImage);
        bikeSlotDiv.setAttribute("class", "flex-wrap flex bg-[#FAA6FF] justify-center p-3");
      }
    }
    loadFavorites();
  });

  //display results

  //createEL
}
function addFavorite(station) {
  favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];

  const findStation = favoriteStations.find((st) => st.name === station.name) || [];

  if (findStation.length === 0) {
    favoriteStations.unshift(station);
    favoriteStations = favoriteStations.slice(0, 5);
    localStorage.setItem("favoriteStations", JSON.stringify(favoriteStations));
  }
  loadFavorites();
}

function loadFavorites() {
  favoriteStations = JSON.parse(localStorage.getItem("favoriteStations")) || [];
  favoriteDiv.innerHTML = `<h3 class="text-center text-[#4c0473]">FAVORITE LOCATIONS</h3>`;
  favoriteStations.forEach((station) => {
    let favoriteStationEL = document.createElement("a");
    favoriteStationEL.setAttribute("class", " w-5/6 p-2 bg-[#4c0473] flex my-2 m-auto");
    favoriteStationEL.setAttribute("href", `https://www.google.com/maps/dir/${userLatitude.innerHTML},+${userLongitude.innerHTML}/${station.lat},+${station.long}/@${station.lat},${station.long}`);

    favoriteStationEL.setAttribute("data-lat", station.lat);
    favoriteStationEL.setAttribute("data-long", station.long);
    favoriteStationEL.innerHTML = station.name;
    favoriteDiv.appendChild(favoriteStationEL);
  });
}
function runFilter() {
  if (rentingBtn.checked === true) {
    isRenting = true;
    bikeType = "freeBikes";
    numBikes = numberBikes.value;

    displayResults();
  } else if (returningBtn.checked === true) {
    isRenting = false;
    bikeType = "empty";
    numBikes = numberBikes.value;
    displayResults();
  } else {
    alert("check something");
  }
  questionDiv.setAttribute("class", "absolute object-center w-4/5 h-80 bg-white flex hidden");
  leftSide.setAttribute("class", "flex flex-col w-1/5 mb-4 block");
}

function searchAgain(event) {
  if (event.target.tagName.toLowerCase() === "button") {
    questionDiv.setAttribute("class", "absolute object-center w-4/5 h-80 bg-white flex block");
    leftSide.setAttribute("class", "flex flex-col w-1/5 mb-4 hidden");
    stationCards.innerHTML = "";
  }
}

function init() {
  requestStations();
  //show favorites
  //display 10 stations
}

init();
let stationName = {};
//event listeners
stationCards.addEventListener("click", function (event) {
  event.preventDefault();

  stationName.name = event.target.getAttribute("data-station");
  stationName.lat = event.target.getAttribute("data-lat");
  stationName.long = event.target.getAttribute("data-long");
  if (stationName.name !== null) {
    addFavorite(stationName);
  }
});

enterBtn.addEventListener("click", runFilter);
userCoordinates.addEventListener("click", searchAgain);
//anser the cards
