const cardsContainer = document.getElementById('cardsContainer');
const categoryFilter = document.getElementById('categoryFilter');
let projects = [];

function createCard(project) {
  // Use nosignal.jpg if website doesn't exist, otherwise use project number image
  const imgSrc = project.website ? `img/${project.n}.jpg` : `img/nosignal.jpg`;
  
  const card = document.createElement('div');
  card.className = "project-card";
  
  // Create image element
  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = project.title || 'Project Image';
  img.className = "card-image";
  img.onerror = function() {
    this.remove();
    const fallback = document.createElement('div');
    fallback.className = "card-image no-signal-image";
    fallback.innerHTML = `
      <div class="text-center">
        <div class="text-3xl mb-2">�</div>
        <div class="text-sm font-medium">No Signal</div>
      </div>
    `;
    this.parentNode.prepend(fallback);
  };

  card.appendChild(img);

  const content = document.createElement('div');
  content.className = "card-content";

  const title = document.createElement('h2');
  title.className = "card-title";
  title.textContent = project.name || 'Untitled Project';

  const developer = document.createElement('div');
  developer.className = "card-developer";
  developer.textContent = `by ${project.developer || 'Unknown Developer'}`;

  const category = document.createElement('span');
  category.className = "card-category";
  category.textContent = project.category || 'Uncategorized';

  const desc = document.createElement('p');
  desc.className = "card-summary";
  
  // Truncate summary if it's more than 300 characters
  let summaryText = project.summary || 'No description available.';
  if (summaryText.length > 300) {
    summaryText = summaryText.substring(0, 300).trim() + ' [...]';
  }
  desc.textContent = summaryText;

  content.appendChild(title);
  content.appendChild(developer);
  content.appendChild(desc);
  content.appendChild(category); // Category is now positioned absolutely

  // Create actions container
  const actions = document.createElement('div');
  actions.className = "card-actions";

  // Add Visit App button if website exists
  if (project.website) {
    const btn = document.createElement('a');
    btn.href = project.website;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = "btn btn-primary";
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15,3 21,3 21,9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      Visit Project
    `;
    
    const status = document.createElement('div');
    status.className = "status-indicator status-online";
    status.innerHTML = `
      <div class="status-dot"></div>
      Online
    `;
    
    actions.appendChild(btn);
    actions.appendChild(status);
  } else {
    // Add status indicator for projects without websites
    const status = document.createElement('div');
    status.className = "status-indicator status-offline";
    status.innerHTML = `
      <div class="status-dot"></div>
      Offline
    `;
    actions.appendChild(status);
  }

  content.appendChild(actions);
  card.appendChild(content);
  return card;
}

function renderCards(filteredProjects) {
  cardsContainer.innerHTML = '';
  if (filteredProjects.length === 0) {
    cardsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No projects found matching the selected criteria.</div>';
    return;
  }
  filteredProjects.forEach(project => {
    cardsContainer.appendChild(createCard(project));
  });
}

function populateCategories(projects) {
  // Only include projects that have names for category population
  const projectsWithNames = projects.filter(p => p.name && p.name.trim() !== '');
  const categories = Array.from(new Set(projectsWithNames.map(p => p.category).filter(Boolean)));
  categories.sort();
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

categoryFilter.addEventListener('change', () => {
  const selected = categoryFilter.value;
  // Filter out projects without names
  const projectsWithNames = projects.filter(p => p.name && p.name.trim() !== '');
  
  if (selected === 'all') {
    renderCards(projectsWithNames);
  } else {
    renderCards(projectsWithNames.filter(p => p.category === selected));
  }
});

fetch('data/projects.json')
  .then(res => res.json())
  .then(data => {
    projects = data;
    populateCategories(projects);
    // Initially render only projects with names
    const projectsWithNames = projects.filter(p => p.name && p.name.trim() !== '');
    renderCards(projectsWithNames);
  })
  .catch(() => {
    cardsContainer.innerHTML = '<div class="col-span-full text-center text-red-500 py-12">Failed to load projects. Please try again later.</div>';
  });