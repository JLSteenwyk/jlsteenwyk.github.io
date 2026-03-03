/*
 * Portal Page — fetch and render a single page's content from Firestore
 */
(function () {
	'use strict';

	portalAuth.requireAuth({
		onReady: function (user, userDoc) {
			initPage(user, userDoc);
		}
	});

	function initPage(user, userDoc) {
		// Greeting
		var name = userDoc.displayName || user.email;
		document.getElementById('user-greeting').textContent = name;

		// Logout
		document.getElementById('logout-btn').addEventListener('click', function () {
			portalAuth.logout();
		});

		// Get page ID from query string
		var params = new URLSearchParams(window.location.search);
		var pageId = params.get('id');

		if (!pageId) {
			showError('No page specified.');
			return;
		}

		loadPage(pageId, userDoc);
	}

	function loadPage(pageId, userDoc) {
		var container = document.getElementById('page-container');

		db.collection('pages').doc(pageId).get()
			.then(function (doc) {
				if (!doc.exists) {
					showError('Page not found.');
					return;
				}

				var page = doc.data();

				// Client users can only see their own client's pages
				if (userDoc.role !== 'admin' && page.clientId !== userDoc.clientId) {
					showError('You do not have access to this page.');
					return;
				}

				// Update document title
				document.title = page.title + ' | Client Portal';

				// Determine back link
				var backHref = userDoc.role === 'admin' ? 'admin.html' : 'dashboard.html';

				var html = '';
				html += '<a href="' + backHref + '" class="portal-back-link">&larr; Back</a>';
				html += '<header class="major"><h2>' + escapeHtml(page.title) + '</h2></header>';
				html += '<div class="portal-page-content">' + page.content + '</div>';

				container.innerHTML = html;
			})
			.catch(function () {
				showError('Error loading page. Please try again.');
			});
	}

	function showError(msg) {
		var container = document.getElementById('page-container');
		container.innerHTML = '<p class="portal-error">' + escapeHtml(msg) + '</p>' +
			'<a href="dashboard.html" class="portal-back-link">&larr; Back to Dashboard</a>';
	}

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}
})();
