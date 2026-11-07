/* Progressive enhancement: without this script, every author list stays open. */
(function () {
	'use strict';
	function enhance() {
		document.querySelectorAll('.pub-author-details:not([data-enhanced])').forEach(function (details) {
			var summary = details.querySelector('summary');
			var authors = details.querySelector('.pub-author-list');
			if (!summary || !authors || !details.closest('.pub-card').querySelector('.pub-title')) return;
			var parts = authors.textContent.trim().split(',');
			var first = parts[0].indexOf('.') === -1 ? parts.slice(0, 2).join(',') : parts[0];
			var preview = document.createElement('span');
			preview.className = 'pub-author-preview';
			preview.textContent = first + ', et al. ';
			var toggle = document.createElement('span');
			toggle.className = 'pub-author-toggle';
			toggle.textContent = 'Show all authors';
			summary.replaceChildren(preview, toggle);
			details.open = false;
			details.setAttribute('data-enhanced', 'true');
			details.addEventListener('toggle', function () {
				toggle.textContent = details.open ? 'Hide author list' : 'Show all authors';
			});
		});
	}
	// Run as the HTML arrives so a long list does not paint and then collapse.
	enhance();
	if (document.readyState === 'loading') {
		var observer;
		if ('MutationObserver' in window) {
			observer = new MutationObserver(enhance);
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
		document.addEventListener('DOMContentLoaded', function () {
			enhance();
			if (observer) observer.disconnect();
		}, { once: true });
	}
})();
