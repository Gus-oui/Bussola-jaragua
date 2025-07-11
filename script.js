// Coordenadas do Pico do Jaraguá
const jaraguaLat = -23.4567;
const jaraguaLon = -46.7350;

const needleEl = document.getElementById("needle");
const statusEl = document.getElementById("status");

let currentHeading = 0;     // orientação do dispositivo (em graus)
let targetBearing = 0;      // direção até o Pico do Jaraguá

// Converte graus para radianos
function toRadians(deg) {
  return deg * Math.PI / 180;
}

// Converte radianos para graus
function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

// Calcula o azimute entre dois pontos geográficos
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
    { enableHighAccuracy: true }
  );
} else {
  statusEl.textContent = "Geolocalização não suportada.";
}

// Sensor de orientação absoluta (iOS 13+ exige permissão)
function handleOrientation(event) {
  if (event.absolute || typeof event.webkitCompassHeading !== "undefined") {
    let heading;

    // Safari iOS usa webkitCompassHeading (em vez de alpha)
    if (typeof event.webkitCompassHeading !== "undefined") {
      heading = event.webkitCompassHeading;
    } else {
      heading = 360 - event.alpha; // Corrige a rotação padrão
    }

    currentHeading = heading;
    updateNeedle();
    statusEl.textContent = "Bússola ativa e corrigida.";
  }
}

// Verifica se precisa solicitar permissão no iOS
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
    // Android ou iOS mais antigo
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// Solicita permissão ao clicar ou carregar
document.body.addEventListener("click", requestOrientationPermission);
window.addEventListener("load", requestOrientationPermission);


// Solicita permissão ao clicar ou carregar
document.body.addEventListener("click", requestOrientationPermission);
window.addEventListener("load", requestOrientationPermission);

