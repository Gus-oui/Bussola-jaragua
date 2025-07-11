const jaraguaLat = -23.4567;
const jaraguaLon = -46.7350;

const statusEl = document.getElementById("status");
const needleEl = document.getElementById("needle");

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

// Calcula o ângulo entre a posição atual e o Pico do Jaraguá
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDegrees(θ) + 360) % 360;
}

let targetBearing = 0;
let currentHeading = 0;

function updateNeedle() {
  const angle = targetBearing - currentHeading;
  needleEl.style.transform = `rotate(${angle}deg)`;
}

// Sensor de orientação (alfa = direção do dispositivo)
window.addEventListener('deviceorientationabsolute', (event) => {
  if (event.alpha !== null) {
    currentHeading = event.alpha;
    updateNeedle();
    statusEl.textContent = "Bússola ativa.";
  }
}, true);

// Alternativa para navegadores que não suportam 'deviceorientationabsolute'
window.addEventListener('deviceorientation', (event) => {
  if (event.alpha !== null) {
    currentHeading = event.alpha;
    updateNeedle();
  }
}, true);

// Geolocalização
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      targetBearing = calculateBearing(latitude, longitude, jaraguaLat, jaraguaLon);
      updateNeedle();
    },
    (err) => {
      statusEl.textContent = "Erro ao obter localização: " + err.message;
    },
    {
      enableHighAccuracy: true
    }
  );
} else {
  statusEl.textContent = "Geolocalização não suportada.";
}
