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

				var html = '<ul class="portal-cards">';
				pages.forEach(function (p) {
					var dateStr = '';
					if (p.data.createdAt) {
						var d = p.data.createdAt.toDate();
						dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
					}
					html += '<li class="portal-card">';
					html += '<h3>' + escapeHtml(p.data.title) + '</h3>';
					if (dateStr) html += '<p>' + dateStr + '</p>';
					html += '<a href="page.html?id=' + p.id + '">View Page &rarr;</a>';
					html += '</li>';
				});
				html += '</ul>';
				container.innerHTML = html;
			})
			.catch(function (err) {
				container.innerHTML = '<p class="portal-error">Error loading pages. Please try again.</p>';
			});
	}

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}
})();
