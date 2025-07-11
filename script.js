const jaraguaLat = -23.4567;
const jaraguaLon = -46.7350;

const needleEl = document.getElementById("needle");
const statusEl = document.getElementById("status");

let currentHeading = 0;
let targetBearing = 0;

// Configura o mapa
const map = L.map("map").setView([jaraguaLat, jaraguaLon], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

// Marcador da sua posição
const userMarker = L.marker([jaraguaLat, jaraguaLon]).addTo(map);

// Atualiza posição no mapa
function updateMapPosition(lat, lon) {
  userMarker.setLatLng([lat, lon]);
  map.setView([lat, lon]);
}

// Converte para radianos
function toRadians(deg) {
  return deg * Math.PI / 180;
}

// Converte para graus
function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

// Calcula o azimute entre dois pontos
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDegrees(θ) + 360) % 360;
}

// Atualiza a agulha da bússola
function updateNeedle() {
  const rotation = targetBearing - currentHeading;
  needleEl.style.transform = `rotate(${rotation}deg)`;
}

// Geolocalização contínua
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      updateMapPosition(latitude, longitude);
      targetBearing = calculateBearing(latitude, longitude, jaraguaLat, jaraguaLon);
      updateNeedle();
    },
    (err) => {
      statusEl.textContent = "Erro ao obter localização: " + err.message;
    },
    { enableHighAccuracy: true }
  );
} else {
  statusEl.textContent = "Geolocalização não suportada.";
}

// Captura orientação do celular
function handleOrientation(event) {
  let heading;
  if (typeof event.webkitCompassHeading !== "undefined") {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha;
  }

  if (heading !== undefined) {
    currentHeading = heading;
    updateNeedle();
    statusEl.textContent = "Mapa e bússola ativos.";
  }
}

// Permissões iOS
function requestOrientationPermission() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          statusEl.textContent = "Permissão negada para sensores.";
        }
      })
      .catch(() => {
        statusEl.textContent = "Erro ao solicitar permissão.";
      });
  } else {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// Solicita permissão
document.body.addEventListener("click", requestOrientationPermission);
window.addEventListener("load", requestOrientationPermission);
