(function () {
	'use strict';

	const root = document.documentElement;
	const toggle = document.querySelector('.theme-toggle');
	const themeColor = document.querySelector('meta[name="theme-color"]');

	if (!toggle) return;

	function applyTheme(theme) {
		const dark = theme === 'dark';
		root.dataset.theme = dark ? 'dark' : 'light';
		toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
		toggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
		if (themeColor) themeColor.setAttribute('content', dark ? '#16191b' : '#e9e7df');
	}

	applyTheme(root.dataset.theme);

	toggle.addEventListener('click', function () {
		const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
		applyTheme(nextTheme);

		try {
			localStorage.setItem('jlsteenwyk-minimal-theme', nextTheme);
		} catch (error) {}
	});
})();
