(function () {
  const container = document.getElementById("map-window");
  if (!container) {
    console.error('map.js: No element with id="map-window" found.');
    return;
  }

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

  if (typeof L === "undefined") {
    console.error("map.js: Leaflet (L) is not defined. Check Leaflet script tag in index.html.");
    return;
  }

  if (!window.PROJECTS || !Array.isArray(window.PROJECTS)) {
    console.error("map.js: window.PROJECTS missing/not array. Ensure projects.js loads before map.js.");
    return;
  }

  const map = L.map("map", {
    attributionControl: false,
    scrollWheelZoom: false,
    zoomControl: true
  });

  // Satellite tiles
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  // Coordinate display
  const coordsEl = document.getElementById("coords");
  const defaultText = "Move over the map…";
  let isLocked = false;
  let lockedCoordsText = defaultText;

  function setCoords(text) {
    if (coordsEl) coordsEl.textContent = text;
  }

  // Show coords anywhere on the map (mousemove)
  map.on("mousemove", (e) => {
    if (isLocked) return;
    setCoords(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
  });

  // If you leave the map area, show locked coords or default
  map.on("mouseout", () => {
    setCoords(isLocked ? lockedCoordsText : defaultText);
  });

  // Clicking empty map area unlocks
  map.on("click", () => {
    isLocked = false;
    lockedCoordsText = defaultText;
    setCoords(defaultText);
  });

  // Add markers
  const bounds = [];

  window.PROJECTS.forEach((p) => {
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

    // Hover over pin: show the project's exact coords
    marker.on("mouseover", () => {
      if (isLocked) return;
      setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
    });

    // Click pin: LOCK coords
    marker.on("click", (e) => {
      // prevent map click from immediately unlocking
      if (e && e.originalEvent) L.DomEvent.stopPropagation(e);

      isLocked = true;
      lockedCoordsText = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
      setCoords(lockedCoordsText);
    });
  });

  // Fit view to markers
  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });

    // Zoom in one notch (optional "less huge" look).
    // With global pins, this may crop the most distant pins slightly — but feels better.
    const z = map.getZoom();
    map.setZoom(Math.min(z + 1, 19));
  } else {
    map.setView([20, 0], 2);
  }

  // Force Leaflet to calculate size after layout paints
  setTimeout(() => map.invalidateSize(), 250);

  // Initialize coords text
  setCoords(defaultText);
})();
