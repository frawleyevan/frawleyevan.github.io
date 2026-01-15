// assets/js/render-projects.js
(function () {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  const list = window.PROJECTS;
  if (!Array.isArray(list)) {
    grid.innerHTML = "<p>Projects data not found.</p>";
    return;
  }

  // Determine the page we are on: "maps.html", "image.html", etc.
  const filename = (location.pathname.split("/").pop() || "").toLowerCase();

  // Filter: show projects whose `page` includes this filename
  // e.g. maps.html shows only entries where page contains "maps.html"
  const filtered = list.filter((p) => {
    if (!p || typeof p.page !== "string") return false;
    return p.page.toLowerCase().includes(filename);
  });

  if (!filtered.length) {
    grid.innerHTML = "<p>No projects yet.</p>";
    return;
  }

  grid.innerHTML = filtered.map((p) => {
    const title = p.title || "Untitled project";
    const img = p.image || "";
    const href = p.page || "#";

    return `
      <article class="project">
        ${img ? `<img class="project-media" src="${img}" alt="${title}" loading="lazy" />` : ""}
        <div class="project-meta">
          <p class="project-caption">${title}</p>
          <a class="project-link" href="${href}">View</a>
        </div>
      </article>
    `;
  }).join("");
})();
