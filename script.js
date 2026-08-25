/* Core interaction script — enhanced for premium experience */
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');

/* Header: sticky + subtle background on scroll */
const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

/* Mobile fullscreen menu toggle */
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });
}

/* Close menu on link click or escape */
if (menu) {
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }));
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (menu && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
    closeProjectModal();
  }
});

/* Gallery filters (if present) */
function bindGalleryFilters() {
  document.querySelectorAll('.filter').forEach((filterButton) => {
    filterButton.addEventListener('click', () => {
      const active = document.querySelector('.filter.is-active');
      if (active) active.classList.remove('is-active');
      filterButton.classList.add('is-active');
      const category = filterButton.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach((item) => {
        item.classList.toggle('is-hidden', category !== 'all' && item.dataset.category !== category);
      });
    });
  });
}

/* Load public gallery if API provides it (preserve existing behavior) */
async function loadPublicGallery() {
  try {
    const response = await fetch('/api/gallery');
    if (!response.ok) return;
    const { images } = await response.json();
    const gallery = document.querySelector('.gallery-grid');
    if (!images.length || !gallery) return;
    gallery.innerHTML = images.map((image) => `
      <figure class="gallery-item image-figure" data-category="${image.category}" data-title="${escapeAttribute(image.title)}">
        <img loading="lazy" src="${image.url}" alt="${escapeAttribute(image.title)}">
        <figcaption>
          <span>${image.category}</span>
          <b>${escapeAttribute(image.title)}</b>
        </figcaption>
      </figure>
    `).join('');
    bindGalleryFilters();
    bindGalleryInteractions();
  } catch (error) {
    // Keep the curated placeholders when the API is unavailable
  }
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

/* Bind interactions for gallery items: hover subtle parallax handled in CSS; click opens premium modal case study */
function bindGalleryInteractions() {
  document.querySelectorAll('.gallery-item').forEach((item) => item.addEventListener('click', (e) => {
    // allow links inside figcaption pass-through
    if (e.target.closest('a')) return;
    openProjectModal(item);
  }));
}

/* Create lightweight modal overlay for project case study (uses existing page data) */
let modalEl = null;
function openProjectModal(item) {
  const img = item.querySelector('img');
  const caption = item.querySelector('figcaption b')?.textContent || img.alt || '';
  const category = item.dataset.category || '';
  // create modal if missing
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'project-modal';
    modalEl.innerHTML = `
      <div class="project-modal-inner">
        <button class="modal-close" aria-label="Close project">✕</button>
        <div class="project-media"></div>
        <div class="project-meta">
          <h3 class="project-title"></h3>
          <p class="project-category"></p>
          <div class="project-body"></div>
          <div class="project-controls"><button class="project-next">Next project →</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
    modalEl.querySelector('.modal-close').addEventListener('click', closeProjectModal);
    modalEl.addEventListener('click', (ev) => { if (ev.target === modalEl) closeProjectModal(); });
    modalEl.querySelector('.project-next').addEventListener('click', () => showAdjacentProject(1));
  }
  // populate
  modalEl.querySelector('.project-media').innerHTML = `<img src="${img.src}" alt="${escapeAttribute(caption)}">`;
  modalEl.querySelector('.project-title').textContent = caption.toUpperCase();
  modalEl.querySelector('.project-category').textContent = category.toUpperCase();
  modalEl.querySelector('.project-body').innerHTML = `<p class="large-copy">${(item.querySelector('figcaption span')?.textContent || '')} — A focused look at material, light and detail.</p>`;

  // store current index
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  modalEl.dataset.currentIndex = String(items.indexOf(item));

  document.body.classList.add('modal-open');
  modalEl.classList.add('is-open');
}

function closeProjectModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

function showAdjacentProject(delta) {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let idx = Number(modalEl.dataset.currentIndex || 0);
  idx = (idx + delta + items.length) % items.length;
  const next = items[idx];
  if (next) openProjectModal(next);
}

/* Initial bindings */
bindGalleryFilters();
bindGalleryInteractions();
loadPublicGallery();

/* Scroll reveal (keeps previous behaviour but slightly tuned) */
const revealTargets = document.querySelectorAll('.intro-grid > div, .section-heading, .service-list article, .gallery-item, .package-cards article, .testimonial-inner, .contact-grid > div');
revealTargets.forEach((target) => target.classList.add('scroll-reveal'));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealTargets.forEach((target) => revealObserver.observe(target));

/* Smooth short page fade on internal anchors (improves perceived polish) */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return; // allow normal behavior
    e.preventDefault();
    document.documentElement.classList.add('site-fade-exit-active');
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.documentElement.classList.remove('site-fade-exit-active');
    }, 220);
  });
});
