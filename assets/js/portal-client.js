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
			.orderBy('sortOrder')
			.get()
			.then(function (snap) {
				if (snap.empty) {
					container.innerHTML = '<p class="portal-empty">No pages available yet.</p>';
					return;
				}

				var html = '<ul class="portal-cards">';
				snap.forEach(function (doc) {
					var page = doc.data();
					html += '<li class="portal-card">';
					html += '<h3>' + escapeHtml(page.title) + '</h3>';
					html += '<a href="page.html?id=' + doc.id + '">View Page &rarr;</a>';
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
