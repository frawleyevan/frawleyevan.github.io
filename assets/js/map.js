(function () {
  const container = document.getElementById("map-window");
  if (!container) return;

  // Inject the map window UI
  container.innerHTML = `
    <div class="map-window">
      <div class="titlebar">
        <span class="dot"></span>
        Portfolio Highlights
      </div>
      <div id="map"></div>
    </div>
  `;

  // If Leaflet didn't load, fail silently (prevents full page break)
  if (typeof L === "undefined") {
    console.error("Leaflet (L) is not defined. Check Leaflet <script> tag in index.html.");
    return;
  }

  // Create the map
  const map = L.map("map", {
    attributionControl: false,
    scrollWheelZoom: false
  });

  // Satellite tiles
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  // Coordinate display behavior
  const coordsEl = document.getElementById("coords");
  let lockedCoordsText = coordsEl ? coordsEl.textContent : "Hover a pin…";

  function setCoords(text) {
    if (coordsEl) coordsEl.textContent = text;
  }

  // Add markers
  const bounds = [];

  if (!window.PROJECTS || !Array.isArray(window.PROJECTS)) {
    console.error("PROJECTS is missing. Check that projects.js loads before map.js in index.html.");
    return;
  }

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

    const marker = L.marker([p.lat, p.lng]).addTo(map).bindPopup(popupHTML, { maxWidth: 360 });

    // Hover updates coords live
    marker.on("mouseover", () => setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`));
    marker.on("mouseout", () => setCoords(lockedCoordsText));

    // Click "locks" coords
    marker.on("click", () => {
      lockedCoordsText = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
      setCoords(lockedCoordsText);
    });
  });

  // Fit map to markers
  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  } else {
    map.setView([20, 0], 2);
  }
})();
