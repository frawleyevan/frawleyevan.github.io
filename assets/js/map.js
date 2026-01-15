// assets/js/map.js
(function () {
  const container = document.getElementById("map-window");
  if (!container) return;

  // Inject the window chrome + map div
  container.innerHTML = `
    <section class="window map-window" aria-label="Portfolio Highlights">
      <div class="titlebar">
        <span class="dot"></span>
        Portfolio Highlights
      </div>
      <div id="map"></div>
    </section>
  `;

  // If Leaflet didn't load, show a readable error in the window
  if (typeof L === "undefined") {
    const mapEl = document.getElementById("map");
    if (mapEl) {
      mapEl.style.position = "static";
      mapEl.style.padding = "18px";
      mapEl.style.fontFamily = "Arial, Helvetica, sans-serif";
      mapEl.innerHTML = "Leaflet failed to load (L is undefined). Check the Leaflet <script> tag and network requests.";
    }
    return;
  }

  const map = L.map("map", {
    attributionControl: false,
    scrollWheelZoom: false,
    zoomControl: true
  });

  // Tiles
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 }
  ).addTo(map);

  // Always show something
  map.setView([20, 0], 2);

  // Coords readout (if present on page)
  const coordsEl = document.getElementById("coords");
  const defaultText = "Move over the map…";
  let isLocked = false;
  let lockedText = defaultText;

  function setCoords(text){
    if (coordsEl) coordsEl.textContent = text;
  }

  map.on("mousemove", (e) => {
    if (isLocked) return;
    setCoords(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
  });

  map.on("mouseout", () => {
    setCoords(isLocked ? lockedText : defaultText);
  });

  map.on("click", () => {
    isLocked = false;
    lockedText = defaultText;
    setCoords(defaultText);
  });

  // Add markers ONLY if data exists
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const bounds = [];

  projects.forEach((p) => {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;

    bounds.push([p.lat, p.lng]);

    const popupHTML = `
      <div style="width:320px;font-family:Arial,Helvetica,sans-serif;">
        <img src="${p.image || ""}" alt="${p.title || "Project image"}"
             style="width:100%;height:170px;object-fit:cover;border-radius:10px;display:block;background:#eee;">
        <div style="font-size:12px;font-weight:900;line-height:1.2;margin:10px 0 8px 0;">
          ${p.title || "Untitled Project"}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span style="font-size:11px;font-weight:700;color:rgba(0,0,0,.75);">
            ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
          </span>
          ${p.page ? `<a href="${p.page}" style="text-decoration:none;padding:5px 10px;border:1px solid rgba(0,0,0,.25);background:linear-gradient(#fff,#e2e2e2);color:#111;border-radius:3px;font-size:11px;font-weight:800;">Open</a>` : ``}
        </div>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng]).addTo(map).bindPopup(popupHTML, { maxWidth: 360 });

    marker.on("mouseover", () => {
      if (isLocked) return;
      setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
    });

    marker.on("click", (e) => {
      if (e && e.originalEvent) L.DomEvent.stopPropagation(e);
      isLocked = true;
      lockedText = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
      setCoords(lockedText);
    });
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  setTimeout(() => map.invalidateSize(), 250);
  setCoords(defaultText);
})();
