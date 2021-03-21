const coords = document.getElementById("coords")
const log = document.getElementById("log")
const start = '61.5, 23.8'
coords.value = start
var mymap = undefined 
let locations = []
let markers = []
let myInterval = undefined
let target = undefined

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => resetMap([pos.coords.latitude, pos.coords.longitude]),
    (err) => { log.innerHTML = err; resetMap(start.split(', '))})
}

function round(num) {
  return Math.round((Number(num) + Number.EPSILON)*1000)/1000
}
function resetMap(latlon) {
  console.log(latlon)
  coords.value = `${round(latlon[0])}, ${round(latlon[1])}`
  if (mymap == undefined ) {
    initMap(latlon)
  }
  else {
    mymap.panTo(latlon, 15)
  }
  locations = [latlon]
  markers.forEach(m => m.remove())
  markers = [L.marker(latlon).addTo(mymap)]
}

function reCenter(e) {
  const code = (e.klon2Code ? e.klon2Code : e.which)
  if (code == 13) { //Enter keycode
    try {
      const latlon = coords.value.split(", ")
      resetMap(latlon)
    } catch (error) {
      log.innerHTML = error
    }
  }
}
coords.addEventListener('keyup', reCenter)


function move() {
  const lat = Number(locations[0][0])
  const lon = Number(locations[0][1])
  const dlat = target[0] - lat
  const dlon = target[1] - lon
  const distance = Math.sqrt(dlat * dlat + dlon * dlon)
  if (distance === 0) {
    clearInterval(myInterval)
    myInterval = undefined
    mymap.panTo([lat, lon])
    coords.value = lat + "," + lon
    return
  }
  if (distance < 0.0005) {
    locations.unshift(target)
  }
  else {
    const angle = Math.atan2(dlat, dlon)
    const changeLat = Math.sin(angle) * 0.0005
    const changeLon = Math.cos(angle) * 0.0005
    locations.unshift([lat + changeLat, lon + changeLon])
  }
  markers.push(L.marker(locations[0]).addTo(mymap))
}


function moveButton(e) {
  return `<button class="move" onClick="startMove(${[e.lat, e.lng]})">Move</button>`
}
function startMove(lat, lng) {
  target = [Number(lat), Number(lng)]
  resetMap(locations[0])
  popup.remove()
  if (myInterval) {
    clearInterval(myInterval)
  }

  myInterval = setInterval(move, 1000)
}

var popup = L.popup()
function onMapClick(e) {
  popup.setLatLng(e.latlng)
    .setContent(moveButton(e.latlng))
    .openOn(mymap)
}


function initMap(latlon) {
  mymap = L.map('mapid').setView(latlon, 15)
  mymap.on('click', onMapClick)


  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibHNzcGtrIiwiYSI6ImNrbWhzNmRkYTBhY24ycHMxcWR2eGNsdzcifQ.MwEjg4vg6uYCDm_WJxgz1A'
  }).addTo(mymap)
}