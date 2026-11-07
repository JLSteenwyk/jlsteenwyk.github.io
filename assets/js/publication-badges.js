/* Load citation widgets near the viewport using the vendors' public APIs.
 * Dimensions: https://integration-badge.dimensions.ai/
 * Altmetric: https://docs.altmetric.com/badges/getting-started/
 */
(function () {
	'use strict';
	var providers = {
		dimensions: {
			url: 'https://badge.dimensions.ai/badge.js',
			className: '__dimensions_badge_embed__',
			refresh: function () {
				if (window.__dimensions_embed) window.__dimensions_embed.addBadges();
			}
		},
		altmetric: {
			url: 'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
			className: 'altmetric-embed',
			refresh: function (element) {
				if (window._altmetric_embed_init) window._altmetric_embed_init(element.parentNode);
			}
		}
	};

	function activate(element) {
		var provider = providers[element.getAttribute('data-citation-provider')];
		element.classList.add(provider.className);
		element.removeAttribute('data-citation-provider');
		if (!provider.ready) {
			provider.ready = new Promise(function (resolve, reject) {
				var script = document.createElement('script');
				script.src = provider.url;
				script.async = true;
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		}
		provider.ready.then(function () { provider.refresh(element); }).catch(function () {
			// A blocked vendor must never prevent reading the publication itself.
		});
	}

	var badges = document.querySelectorAll('[data-citation-provider]');
	if (!('IntersectionObserver' in window)) {
		badges.forEach(activate);
		return;
	}
	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				observer.unobserve(entry.target);
				activate(entry.target);
			}
		});
	}, { rootMargin: '600px 0px' });
	badges.forEach(function (badge) { observer.observe(badge); });
})();
