/*
 * Portal Client — Dashboard: list client's pages
 */
(function () {
	'use strict';

	portalAuth.requireAuth({
		role: 'client',
		onReady: function (user, userDoc) {
			initDashboard(user, userDoc);
		}
	});

	function initDashboard(user, userDoc) {
		// Greeting
		var name = userDoc.displayName || user.email;
		document.getElementById('user-greeting').textContent = 'Welcome, ' + name;

		// Logout
		document.getElementById('logout-btn').addEventListener('click', function () {
			portalAuth.logout();
		});

		// Load pages for this client
		loadPages(userDoc.clientId);
	}

	function loadPages(clientId) {
		var container = document.getElementById('pages-container');

		db.collection('pages')
			.where('clientId', '==', clientId)
			.get()
			.then(function (snap) {
				if (snap.empty) {
					container.innerHTML = '<p class="portal-empty">No pages available yet.</p>';
					return;
				}

				// Sort reverse-chronologically (newest first)
				var pages = [];
				snap.forEach(function (doc) {
					pages.push({ id: doc.id, data: doc.data() });
				});
				pages.sort(function (a, b) {
					var aTime = a.data.createdAt ? a.data.createdAt.toMillis() : 0;
					var bTime = b.data.createdAt ? b.data.createdAt.toMillis() : 0;
					return bTime - aTime;
				});

				var html = '<div class="portal-table-wrap"><table class="portal-table">';
				html += '<thead><tr><th>Title</th><th>Created</th><th>Updated</th></tr></thead><tbody>';
				pages.forEach(function (p) {
					var created = formatDate(p.data.createdAt);
					var updated = formatDate(p.data.updatedAt);
					html += '<tr class="portal-table-row-link" onclick="window.location.href=\'page.html?id=' + p.id + '\'">';
					html += '<td><a href="page.html?id=' + p.id + '">' + escapeHtml(p.data.title) + '</a></td>';
					html += '<td>' + created + '</td>';
					html += '<td>' + updated + '</td>';
					html += '</tr>';
				});
				html += '</tbody></table></div>';
				container.innerHTML = html;
			})
			.catch(function (err) {
				container.innerHTML = '<p class="portal-error">Error loading pages. Please try again.</p>';
			});
	}

	function formatDate(timestamp) {
		if (!timestamp) return '—';
		var d = timestamp.toDate();
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}
})();
