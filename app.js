const SIZE = 4;
const TILE = 100;
const TOTAL = SIZE * SIZE;
let map, marker, correctCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  document.getElementById("locBtn").onclick = locateUser;
  document.getElementById("mapBtn").onclick = captureMap;
  buildBoard();
  if ("Notification" in window) Notification.requestPermission();
});

function initMap() {
  map = L.map('map').setView([52.2297, 21.0122], 13);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 20,
}).addTo(map);
}

function locateUser() {
  if (!navigator.geolocation) {
    alert("Twoja przeglądarka nie obsługuje geolokalizacji");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      showMarker(latitude, longitude, "Twoja lokalizacja");
    },
    (err) => {
      console.warn("nie udalo sie pobrac geolokalizacji", err);
      showMarker(52, 21, "lokalizacja symulowana");
    }
  );
}

function showMarker(lat, lon, text) {
  map.setView([lat, lon], 15);
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lon]).addTo(map).bindPopup(text).openPopup();
}

function buildBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < TOTAL; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = "cell-" + i;
    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", dropPiece);
    board.appendChild(cell);
  }

  const box = document.getElementById("pieces-box");
  box.addEventListener("dragover", e => e.preventDefault());
  box.addEventListener("drop", e => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("text");
    const piece = document.getElementById(pieceId);
    if (piece) {
      piece.classList.remove("correct");
      box.appendChild(piece);
      correctCount = document.querySelectorAll(".piece.correct").length;
    }
  });
}

function captureMap() {
  leafletImage(map, (err, canvas) => {
    if (err) return console.error(err);
    const scaled = document.createElement("canvas");
    scaled.width = scaled.height = 400;
    scaled.getContext("2d").drawImage(canvas, 0, 0, 400, 400);
    const img = new Image();
    img.src = scaled.toDataURL("image/png");
    img.onload = () => createPieces(img);
  });
}



function createPieces(image) {
  const box = document.getElementById("pieces-box");
  const board = document.getElementById("board");
  box.innerHTML = "";
  board.innerHTML = "";
  buildBoard();
  correctCount = 0;



  const pieces = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const id = r * SIZE + c;
      const p = document.createElement("div");
      p.classList.add("piece");
      p.id = "piece-" + id;
      p.dataset.correct = id;
      p.draggable = true;
      p.style.backgroundImage = `url(${image.src})`;
      p.style.backgroundPosition = `${-c * TILE}px ${-r * TILE}px`;
      p.addEventListener("dragstart", e => e.dataTransfer.setData("text", e.target.id));
      pieces.push(p);
    }
  }


  pieces.sort(() => Math.random() - 0.5);
  pieces.forEach(p => box.appendChild(p));
}


function dropPiece(e) {
  e.preventDefault();
  const pieceId = e.dataTransfer.getData("text");
  const piece = document.getElementById(pieceId);
  if (!piece || this.children.length > 0) return;
  this.appendChild(piece);

  const correct = piece.dataset.correct === this.id.replace("cell-", "");
  if (correct) piece.classList.add("correct");
  else piece.classList.remove("correct");

  correctCount = document.querySelectorAll(".piece.correct").length;

  if (correctCount === TOTAL) {
    console.log("ulozyles wszystkie puzzle");
    alert("ulozyles wszystkie puzzle");
    if (Notification.permission === "granted") {
      new Notification("Gratulacje", { body: "ulozyles wszystkie puzzle" });
    }
  }
}
