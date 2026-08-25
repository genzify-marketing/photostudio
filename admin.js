const api = '/api';
const loginPanel = document.querySelector('#login-panel');
const dashboard = document.querySelector('#dashboard');
const loginForm = document.querySelector('#login-form');
const imageForm = document.querySelector('#image-form');
const gallery = document.querySelector('#admin-gallery');
const count = document.querySelector('#image-count');
const categoryFilter = document.querySelector('#category-filter');
const logout = document.querySelector('#logout');
const emptyState = document.querySelector('#empty-state');
const tokenKey = 'northline_admin_token';
let images = [];

function setMessage(form, message = '') { form.querySelector('.form-message').textContent = message; }
function authHeaders() { return { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` }; }
function showDashboard() { loginPanel.hidden = true; dashboard.hidden = false; logout.hidden = false; loadImages(); }
function showLogin() { loginPanel.hidden = false; dashboard.hidden = true; logout.hidden = true; }

async function request(url, options = {}) {
  const response = await fetch(`${api}${url}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); setMessage(loginForm, 'Signing in...');
  const formData = new FormData(loginForm);
  try {
    const result = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData)) });
    localStorage.setItem(tokenKey, result.token); setMessage(loginForm); showDashboard();
  } catch (error) { setMessage(loginForm, error.message); }
});

async function loadImages() {
  gallery.innerHTML = '<p class="empty-state">Loading archive...</p>';
  try { const result = await request(`/gallery?category=${categoryFilter.value}`); images = result.images; renderImages(); }
  catch (error) { gallery.innerHTML = ''; emptyState.hidden = false; emptyState.textContent = error.message; }
}

function renderImages() {
  count.textContent = images.length;
  emptyState.hidden = images.length > 0;
  gallery.innerHTML = images.map((image) => `<article class="admin-card"><img src="${image.url}" alt=""><div class="admin-card-body"><h3>${escapeHtml(image.title)}</h3><p>${escapeHtml(image.description || 'No description')}</p><div class="admin-card-meta"><span>${image.category}</span><div class="admin-card-actions"><button type="button" data-edit="${image.id}">Edit</button><button type="button" data-delete="${image.id}">Delete</button></div></div></div></article>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

imageForm.addEventListener('submit', async (event) => {
  event.preventDefault(); setMessage(imageForm, 'Saving...');
  const formData = new FormData(imageForm); const id = formData.get('id');
  try {
    if (id) { formData.delete('image'); await request(`/gallery/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData)) }); }
    else await request('/gallery', { method: 'POST', body: formData });
    resetForm(); setMessage(imageForm); await loadImages();
  } catch (error) { setMessage(imageForm, error.message); }
});

gallery.addEventListener('click', async (event) => {
  const editId = event.target.dataset.edit; const deleteId = event.target.dataset.delete;
  if (editId) {
    const image = images.find((item) => String(item.id) === editId); if (!image) return;
    imageForm.elements.id.value = image.id; imageForm.elements.title.value = image.title; imageForm.elements.category.value = image.category; imageForm.elements.description.value = image.description || ''; document.querySelector('#form-title').textContent = 'Edit image'; window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (deleteId && window.confirm('Delete this image permanently?')) {
    try { await request(`/gallery/${deleteId}`, { method: 'DELETE' }); await loadImages(); } catch (error) { window.alert(error.message); }
  }
});

function resetForm() { imageForm.reset(); imageForm.elements.id.value = ''; document.querySelector('#form-title').textContent = 'New image'; }
document.querySelector('#new-image').addEventListener('click', () => { resetForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
document.querySelector('#cancel-edit').addEventListener('click', resetForm);
categoryFilter.addEventListener('change', loadImages);
logout.addEventListener('click', () => { localStorage.removeItem(tokenKey); showLogin(); });

if (localStorage.getItem(tokenKey)) request('/auth/me').then(showDashboard).catch(() => { localStorage.removeItem(tokenKey); showLogin(); });
else showLogin();
