/* Keep decorative work idle when the hero is offscreen, the tab is hidden,
 * or the visitor requests reduced motion. The first phrase is ordinary HTML.
 */
(function () {
	'use strict';
	var banner = document.getElementById('banner');
	var morph = document.querySelector('#typewriter-text .morph-text');
	if (!banner || !morph) return;
	var phrases = [
		'Evolutionary Bioinformatics', 'Computational Genomics', 'AI/ML for Biology',
		'AI Research Agents', 'Scientific AI Evaluations', 'Software Engineering'
	];
	var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
	var index = 0;
	var visible = true;
	var timer, transition, frame;
	var orbs = banner.querySelectorAll('.biophilic-orbs span');

	function running() { return visible && !document.hidden && !preference.matches; }
	function stop() {
		window.clearTimeout(timer);
		window.clearTimeout(transition);
		window.cancelAnimationFrame(frame);
		timer = transition = frame = null;
		morph.classList.remove('morph-out', 'morph-in');
		orbs.forEach(function (orb) { orb.style.translate = '0px 0px'; });
	}
	function changePhrase() {
		if (!running()) return;
		morph.classList.add('morph-out');
		transition = window.setTimeout(function () {
			if (!running()) return;
			index = (index + 1) % phrases.length;
			morph.textContent = phrases[index];
			morph.classList.remove('morph-out');
			morph.classList.add('morph-in');
			frame = window.requestAnimationFrame(function () {
				frame = window.requestAnimationFrame(function () {
					frame = null;
					morph.classList.remove('morph-in');
				});
			});
		}, 520);
		timer = window.setTimeout(changePhrase, 3200);
	}
	function update() {
		stop();
		banner.classList.toggle('effects-paused', !running());
		if (running()) timer = window.setTimeout(changePhrase, 5700);
	}
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			visible = entries[0].isIntersecting;
			update();
		}).observe(banner);
	}
	document.addEventListener('visibilitychange', update);
	if (preference.addEventListener) preference.addEventListener('change', update);
	else preference.addListener(update);

	var pointerFrame;
	banner.addEventListener('mousemove', function (event) {
		if (!running() || pointerFrame) return;
		var x = event.clientX, y = event.clientY;
		pointerFrame = window.requestAnimationFrame(function () {
			pointerFrame = null;
			if (!running()) return;
			var rect = banner.getBoundingClientRect();
			var cx = ((x - rect.left) / rect.width - 0.5) * 2;
			var cy = ((y - rect.top) / rect.height - 0.5) * 2;
			orbs.forEach(function (orb, i) {
				var depth = 0.25 + (i % 4) * 0.25;
				orb.style.translate = (cx * 14 * depth) + 'px ' + (cy * 10 * depth) + 'px';
			});
		});
	}, { passive: true });
	banner.addEventListener('mouseleave', function () {
		window.cancelAnimationFrame(pointerFrame);
		pointerFrame = null;
		orbs.forEach(function (orb) { orb.style.translate = '0px 0px'; });
	});
	update();
})();
