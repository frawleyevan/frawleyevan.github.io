(function () {
  // 1) Find the container we inject into
  const container = document.getElementById("map-window");
  if (!container) {
    console.error('map.js: No element with id="map-window" found.');
    return;
  }

  // 2) Inject the map window UI (retro window + actual Leaflet mount point)
  container.innerHTML = `
    <div class="map-window">
      <div class="titlebar">
        <span class="dot"></span>
        Portfolio Highlights
      </div>
      <div id="map"></div>
    </div>
  `;

  // 3) Guard: Leaflet must exist
  if (typeof L === "undefined") {
    console.error("map.js: Leaflet (L) is not defined. Check Leaflet script tag in index.html.");
    return;
  }

  // 4) Guard: Projects must exist (from assets/js/projects.js)
  if (!window.PROJECTS || !Array.isArray(window.PROJECTS)) {
    console.error("map.js: window.PROJECTS is missing or not an array. Ensure projects.js loads before map.js.");
    return;
  }

  // 5) Initialize the Leaflet map
  const map = L.map("map", {
    attributionControl: false,
    scrollWheelZoom: false,
    zoomControl: true // default zoom (+/-) top-left
  });

  // 6) Add satellite tiles
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  // 7) Coordinates UI behavior
  const coordsEl = document.getElementById("coords");
  let lockedCoordsText = coordsEl ? (coordsEl.textContent || "Hover a pin…") : "Hover a pin…";

  function setCoords(text) {
    if (coordsEl) coordsEl.textContent = text;
  }

  // 8) Add markers + popups
  const bounds = [];

  window.PROJECTS.forEach((p) => {
    // Defensive: skip malformed entries
    if (
      typeof p.lat !== "number" ||
      typeof p.lng !== "number" ||
      !Number.isFinite(p.lat) ||
      !Number.isFinite(p.lng)
    ) return;

    bounds.push([p.lat, p.lng]);

    const popupHTML = `
      <div style="width:320px;font-family:Arial,Helvetica,sans-serif;">
        <img src="${p.image}" alt="${p.title || "Project image"}"
             style="width:100%;height:170px;object-fit:cover;border-radius:10px;display:block;background:#eee;">
        <div style="font-size:12px;font-weight:900;line-height:1.2;margin:10px 0 8px 0;">
          ${p.title || "Untitled Project"}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span style="font-size:11px;font-weight:700;color:rgba(0,0,0,.75);">
            ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
          </span>
          ${
            p.page
              ? `<a href="${p.page}" style="text-decoration:none;padding:5px 10px;border:1px solid rgba(0,0,0,.25);background:linear-gradient(#fff,#e2e2e2);color:#111;border-radius:3px;font-size:11px;font-weight:800;">Open</a>`
              : ``
          }
        </div>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng])
      .addTo(map)
      .bindPopup(popupHTML, { maxWidth: 360 });

    // Hover: live preview coords
    marker.on("mouseover", () => setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`));
    marker.on("mouseout", () => setCoords(lockedCoordsText));

    // Click: lock coords (and open popup)
    marker.on("click", () => {
      lockedCoordsText = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
      setCoords(lockedCoordsText);
    });
  });

  // 9) Fit view
  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  } else {
    map.setView([20, 0], 2);
  }

  // 10) Safety: force Leaflet to recalc size after layout settles
  setTimeout(() => map.invalidateSize(), 250);
})();
