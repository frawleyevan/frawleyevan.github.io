(function () {
  const container = document.getElementById("map-window");
  if (!container) return;

  // Build a retro "window" + map container
  container.innerHTML = `
    <div class="map-window">
      <div class="titlebar">
        <span class="dot"></span>
        Portfolio Highlights
      </div>
      <div id="map"></div>
    </div>
  `;

  const map = L.map("map", {
    attributionControl: false,
    scrollWheelZoom: false
  });

  // Satellite tiles (ArcGIS World Imagery)
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  const bounds = [];

  window.PROJECTS.forEach(p => {
    bounds.push([p.lat, p.lng]);

    const popupHTML = `
      <div style="width:320px;font-family:Arial,Helvetica,sans-serif;">
        <img src="${p.image}" alt="${p.title}"
             style="width:100%;height:170px;object-fit:cover;border-radius:10px;display:block;background:#eee;">
        <div style="font-size:12px;font-weight:900;line-height:1.2;margin:10px 0 8px 0;">
          ${p.title}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span style="font-size:11px;font-weight:700;color:rgba(0,0,0,.75);">
            ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
          </span>
          <a href="${p.page}" style="text-decoration:none;padding:5px 10px;border:1px solid rgba(0,0,0,.25);background:linear-gradient(#fff,#e2e2e2);color:#111;border-radius:3px;font-size:11px;font-weight:800;">
            Open
          </a>
        </div>
      </div>
    `;

const coordsEl = document.getElementById("coords");
const defaultCoordsText = coordsEl ? coordsEl.textContent : "";

function setCoords(text){
  if (coordsEl) coordsEl.textContent = text;
}

marker.on("mouseover", () => {
  setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
});

marker.on("mouseout", () => {
  // restore whatever it was before hover (or a default)
  setCoords(defaultCoordsText || "Hover a pin…");
});

marker.on("click", () => {
  // on click, “lock” the coords by updating the default text
  const locked = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
  setCoords(locked);
  // update defaultCoordsText behavior by overwriting the element’s text baseline
  // (simple + works without extra globals)
});
