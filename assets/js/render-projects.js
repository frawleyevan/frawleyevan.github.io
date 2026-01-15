// assets/js/render-projects.js
(function () {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  if (!window.PROJECTS || !Array.isArray(window.PROJECTS)) {
    grid.innerHTML = "<p>Projects data not found.</p>";
    return;
  }

  // Infer page type from filename (maps.html, image.html, etc.)
  const page = (location.pathname.split("/").pop() || "").toLowerCase();

  // Map page -> project type
  const typeByPage = {
    "maps.html": "map",
    "image.html": "image",
    "sound.html": "sound",
    "writing.html": "writing",
  };

  const wantedType = typeByPage[page] || null;

  // Filter if type exists; otherwise show all
  const projects = wantedType
    ? window.PROJECTS.filter(p => p.type === wantedType)
    : window.PROJECTS;

  if (!projects.length) {
    grid.innerHTML = "<p>No projects yet.</p>";
    return;
  }

  grid.innerHTML = projects.map((p) => {
    const title = p.title || "Untitled";
    const subtitle = p.subtitle || "";
    const image = p.image || "";
    const link = p.page || "#";

    return `
      <article class="project">
        ${image ? `<img class="project-media" src="${image}" alt="${title}" loading="lazy" />` : ""}
        <div class="project-body">
          <h2 class="project-title">${title}</h2>
          ${subtitle ? `<p class="project-caption">${subtitle}</p>` : ""}
          <a class="project-link" href="${link}">View</a>
        </div>
      </article>
    `;
  }).join("");
})();
