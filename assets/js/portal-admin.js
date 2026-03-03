/*
 * Portal Admin — Client, User, and Page CRUD with Quill editor
 */
(function () {
	'use strict';

	/* ── State ──────────────────────────────────────────────── */

	var quill = null;
	var editingPageId = null;   // null = creating, string = editing
	var clientsCache = [];      // [{id, ...data}]
	var uploadedHtml = null;    // raw HTML from file upload

	/* ── Auth gate ─────────────────────────────────────────── */

	portalAuth.requireAuth({
		role: 'admin',
		onReady: function (user, userDoc) {
			initAdmin(user, userDoc);
		}
	});

	/* ── Init ──────────────────────────────────────────────── */

	function initAdmin(user, userDoc) {
		document.getElementById('user-greeting').textContent = 'Admin: ' + (userDoc.displayName || user.email);

		document.getElementById('logout-btn').addEventListener('click', function () {
			portalAuth.logout();
		});

		initTabs();
		initQuill();
		initHtmlUpload();
		initClientForm();
		initUserForm();
		initPageForm();

		loadClients();
		loadUsers();
		loadPages();
	}

	/* ── Tabs ──────────────────────────────────────────────── */

	function initTabs() {
		var tabs = document.querySelectorAll('.portal-tab');
		tabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				tabs.forEach(function (t) { t.classList.remove('active'); });
				tab.classList.add('active');

				document.querySelectorAll('.portal-tab-panel').forEach(function (p) {
					p.classList.remove('active');
				});
				document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
			});
		});
	}

	/* ── Quill Editor ──────────────────────────────────────── */

	function initQuill() {
		quill = new Quill('#quill-editor', {
			theme: 'snow',
			placeholder: 'Write page content here...',
			modules: {
				toolbar: {
					container: [
						[{ header: [1, 2, 3, false] }],
						['bold', 'italic', 'underline', 'strike'],
						[{ list: 'ordered' }, { list: 'bullet' }],
						['blockquote', 'code-block'],
						['link', 'image'],
						[{ align: [] }],
						['clean']
					],
					handlers: {
						image: imageHandler
					}
				}
			}
		});
	}

	function imageHandler() {
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = function () {
			var file = input.files[0];
			if (!file) return;

			if (file.size > 10 * 1024 * 1024) {
				alert('Image must be under 10 MB.');
				return;
			}

			var clientId = document.getElementById('page-client-select').value;
			var folder = clientId || 'general';
			var filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
			var ref = storage.ref('portal/' + folder + '/' + filename);

			ref.put(file).then(function (snap) {
				return snap.ref.getDownloadURL();
			}).then(function (url) {
				var range = quill.getSelection(true);
				quill.insertEmbed(range.index, 'image', url);
				quill.setSelection(range.index + 1);
			}).catch(function (err) {
				alert('Image upload failed: ' + err.message);
			});
		};
	}

	/* ── HTML File Upload ──────────────────────────────────── */

	function initHtmlUpload() {
		var fileInput = document.getElementById('html-file-upload');
		var fileNameEl = document.getElementById('html-file-name');

		fileInput.addEventListener('change', function () {
			var file = fileInput.files[0];
			if (!file) {
				uploadedHtml = null;
				fileNameEl.textContent = '';
				return;
			}

			var reader = new FileReader();
			reader.onload = function (e) {
				// Store the full file content — the page viewer will detect
				// full HTML docs and render them in an iframe for style isolation
				uploadedHtml = e.target.result.trim();

				fileNameEl.textContent = file.name + ' loaded';
				// Clear the Quill editor since we're using the file
				quill.root.innerHTML = '';

				// Auto-fill the page title from the HTML <title> tag if present
				var titleInput = document.getElementById('page-title');
				if (!titleInput.value.trim()) {
					var titleMatch = uploadedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
					if (titleMatch) {
						titleInput.value = titleMatch[1].trim();
					} else {
						// Fall back to filename without extension
						titleInput.value = file.name.replace(/\.(html?|htm)$/i, '');
					}
				}
			};
			reader.readAsText(file);
		});
	}

	/* ══════════════════════════════════════════════════════════
	   CLIENTS
	   ══════════════════════════════════════════════════════════ */

	function initClientForm() {
		document.getElementById('create-client-btn').addEventListener('click', createClient);
	}

	function createClient() {
		var nameInput = document.getElementById('client-name');
		var name = nameInput.value.trim();
		if (!name) return;

		var slug = toSlug(name);
		var msgEl = document.getElementById('client-msg');
		msgEl.innerHTML = '';

		db.collection('clients').add({
			name: name,
			slug: slug,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			updatedAt: firebase.firestore.FieldValue.serverTimestamp()
		}).then(function () {
			nameInput.value = '';
			showMsg(msgEl, 'Client "' + name + '" created.', 'success');
			loadClients();
		}).catch(function (err) {
			showMsg(msgEl, 'Error: ' + err.message, 'error');
		});
	}

	function loadClients() {
		var container = document.getElementById('clients-list');
		db.collection('clients').orderBy('name').get().then(function (snap) {
			clientsCache = [];
			if (snap.empty) {
				container.innerHTML = '<p class="portal-empty">No clients yet.</p>';
				populateClientSelects();
				return;
			}

			var html = '<table class="portal-table"><thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead><tbody>';
			snap.forEach(function (doc) {
				var c = doc.data();
				clientsCache.push({ id: doc.id, name: c.name, slug: c.slug });
				html += '<tr>';
				html += '<td>' + escapeHtml(c.name) + '</td>';
				html += '<td>' + escapeHtml(c.slug) + '</td>';
				html += '<td><button class="portal-btn portal-btn-danger portal-btn-small" onclick="portalAdmin.deleteClient(\'' + doc.id + '\')">Delete</button></td>';
				html += '</tr>';
			});
			html += '</tbody></table>';
			container.innerHTML = html;

			populateClientSelects();
		});
	}

	function deleteClient(id) {
		if (!confirm('Delete this client? This will NOT delete their pages or users.')) return;
		db.collection('clients').doc(id).delete().then(function () {
			loadClients();
		});
	}

	function populateClientSelects() {
		var selects = [
			document.getElementById('user-client-select'),
			document.getElementById('page-client-select')
		];
		selects.forEach(function (sel) {
			var val = sel.value;
			sel.innerHTML = '<option value="">-- Select client --</option>';
			clientsCache.forEach(function (c) {
				sel.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
			});
			sel.value = val;
		});
	}

	/* ══════════════════════════════════════════════════════════
	   USERS
	   ══════════════════════════════════════════════════════════ */

	function initUserForm() {
		document.getElementById('create-user-btn').addEventListener('click', createUser);
	}

	function createUser() {
		var email = document.getElementById('user-email').value.trim();
		var password = document.getElementById('user-password').value;
		var displayName = document.getElementById('user-display-name').value.trim();
		var clientId = document.getElementById('user-client-select').value;
		var msgEl = document.getElementById('user-msg');
		msgEl.innerHTML = '';

		if (!email || !password || !clientId) {
			showMsg(msgEl, 'Email, password, and client are required.', 'error');
			return;
		}
		if (password.length < 6) {
			showMsg(msgEl, 'Password must be at least 6 characters.', 'error');
			return;
		}

		// Use Firebase Auth REST API to create user without signing out admin
		var apiKey = firebase.app().options.apiKey;
		var url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey;

		fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: email,
				password: password,
				returnSecureToken: false
			})
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			if (data.error) {
				throw new Error(data.error.message);
			}

			var uid = data.localId;

			// Create Firestore user doc
			return db.collection('users').doc(uid).set({
				email: email,
				displayName: displayName || email,
				role: 'client',
				clientId: clientId,
				createdAt: firebase.firestore.FieldValue.serverTimestamp()
			});
		})
		.then(function () {
			document.getElementById('user-email').value = '';
			document.getElementById('user-password').value = '';
			document.getElementById('user-display-name').value = '';
			showMsg(msgEl, 'User "' + email + '" created.', 'success');
			loadUsers();
		})
		.catch(function (err) {
			showMsg(msgEl, 'Error: ' + err.message, 'error');
		});
	}

	function loadUsers() {
		var container = document.getElementById('users-list');
		db.collection('users').orderBy('email').get().then(function (snap) {
			if (snap.empty) {
				container.innerHTML = '<p class="portal-empty">No users yet.</p>';
				return;
			}

			var html = '<table class="portal-table"><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Client</th><th>Actions</th></tr></thead><tbody>';
			snap.forEach(function (doc) {
				var u = doc.data();
				var clientName = getClientName(u.clientId);
				html += '<tr>';
				html += '<td>' + escapeHtml(u.email) + '</td>';
				html += '<td>' + escapeHtml(u.displayName || '') + '</td>';
				html += '<td>' + escapeHtml(u.role) + '</td>';
				html += '<td>' + escapeHtml(clientName) + '</td>';
				html += '<td>';
				if (u.role !== 'admin') {
					html += '<button class="portal-btn portal-btn-danger portal-btn-small" onclick="portalAdmin.deleteUser(\'' + doc.id + '\')">Delete</button>';
				}
				html += '</td>';
				html += '</tr>';
			});
			html += '</tbody></table>';
			container.innerHTML = html;
		});
	}

	function deleteUser(id) {
		if (!confirm('Delete this user record? (Auth account must be removed from Firebase Console separately.)')) return;
		db.collection('users').doc(id).delete().then(function () {
			loadUsers();
		});
	}

	/* ══════════════════════════════════════════════════════════
	   PAGES
	   ══════════════════════════════════════════════════════════ */

	function initPageForm() {
		document.getElementById('save-page-btn').addEventListener('click', savePage);
		document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
	}

	function savePage() {
		var clientId = document.getElementById('page-client-select').value;
		var title = document.getElementById('page-title').value.trim();
		var sortOrder = parseInt(document.getElementById('page-sort').value, 10) || 0;
		// Prefer uploaded HTML file; fall back to Quill editor content
		var content = uploadedHtml || quill.root.innerHTML;
		var msgEl = document.getElementById('page-msg');
		msgEl.innerHTML = '';

		if (!clientId || !title) {
			showMsg(msgEl, 'Client and title are required.', 'error');
			return;
		}

		var slug = toSlug(title);
		var data = {
			clientId: clientId,
			title: title,
			slug: slug,
			content: content,
			sortOrder: sortOrder,
			parentPageId: null,
			updatedAt: firebase.firestore.FieldValue.serverTimestamp()
		};

		var promise;
		if (editingPageId) {
			promise = db.collection('pages').doc(editingPageId).update(data);
		} else {
			data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
			promise = db.collection('pages').add(data);
		}

		promise.then(function () {
			var action = editingPageId ? 'updated' : 'created';
			showMsg(msgEl, 'Page "' + title + '" ' + action + '.', 'success');
			resetPageForm();
			loadPages();
		}).catch(function (err) {
			showMsg(msgEl, 'Error: ' + err.message, 'error');
		});
	}

	function loadPages() {
		var container = document.getElementById('pages-list');
		db.collection('pages').orderBy('updatedAt', 'desc').get().then(function (snap) {
			if (snap.empty) {
				container.innerHTML = '<p class="portal-empty">No pages yet.</p>';
				return;
			}

			var html = '<table class="portal-table"><thead><tr><th>Title</th><th>Client</th><th>Order</th><th>Actions</th></tr></thead><tbody>';
			snap.forEach(function (doc) {
				var p = doc.data();
				var clientName = getClientName(p.clientId);
				html += '<tr>';
				html += '<td><a href="page.html?id=' + doc.id + '">' + escapeHtml(p.title) + '</a></td>';
				html += '<td>' + escapeHtml(clientName) + '</td>';
				html += '<td>' + (p.sortOrder || 0) + '</td>';
				html += '<td style="white-space:nowrap;">';
				html += '<button class="portal-btn portal-btn-secondary portal-btn-small" onclick="portalAdmin.editPage(\'' + doc.id + '\')" style="margin-right:0.3em;">Edit</button>';
				html += '<button class="portal-btn portal-btn-danger portal-btn-small" onclick="portalAdmin.deletePage(\'' + doc.id + '\')">Delete</button>';
				html += '</td>';
				html += '</tr>';
			});
			html += '</tbody></table>';
			container.innerHTML = html;
		});
	}

	function editPage(id) {
		db.collection('pages').doc(id).get().then(function (doc) {
			if (!doc.exists) return;
			var p = doc.data();

			editingPageId = id;
			document.getElementById('page-form-title').textContent = 'Edit Page';
			document.getElementById('page-client-select').value = p.clientId;
			document.getElementById('page-title').value = p.title;
			document.getElementById('page-sort').value = p.sortOrder || 0;
			quill.root.innerHTML = p.content || '';
			document.getElementById('cancel-edit-btn').classList.remove('portal-hidden');
			document.getElementById('save-page-btn').textContent = 'Update Page';

			// Scroll to form
			document.getElementById('page-form-title').scrollIntoView({ behavior: 'smooth' });
		});
	}

	function cancelEdit() {
		resetPageForm();
	}

	function resetPageForm() {
		editingPageId = null;
		uploadedHtml = null;
		document.getElementById('page-form-title').textContent = 'Create Page';
		document.getElementById('page-title').value = '';
		document.getElementById('page-sort').value = '0';
		document.getElementById('html-file-upload').value = '';
		document.getElementById('html-file-name').textContent = '';
		quill.root.innerHTML = '';
		document.getElementById('cancel-edit-btn').classList.add('portal-hidden');
		document.getElementById('save-page-btn').textContent = 'Save Page';
	}

	function deletePage(id) {
		if (!confirm('Delete this page permanently?')) return;
		db.collection('pages').doc(id).delete().then(function () {
			if (editingPageId === id) resetPageForm();
			loadPages();
		});
	}

	/* ── Helpers ────────────────────────────────────────────── */

	function getClientName(clientId) {
		for (var i = 0; i < clientsCache.length; i++) {
			if (clientsCache[i].id === clientId) return clientsCache[i].name;
		}
		return clientId || '—';
	}

	function toSlug(str) {
		return str.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str || ''));
		return div.innerHTML;
	}

	function showMsg(el, text, type) {
		el.innerHTML = '<div class="portal-msg portal-msg-' + type + '">' + escapeHtml(text) + '</div>';
		setTimeout(function () { el.innerHTML = ''; }, 5000);
	}

	/* ── Public API (for onclick handlers in table rows) ──── */

	window.portalAdmin = {
		deleteClient: deleteClient,
		deleteUser: deleteUser,
		editPage: editPage,
		deletePage: deletePage
	};
})();
