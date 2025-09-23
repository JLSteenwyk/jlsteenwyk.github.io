/*
	Landed by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		themeStorageKey = 'jlsteenwyk-theme',
		glassClass = 'glassmorphism-theme',
		themeToggleControls = [],
		currentTheme = 'glassmorphism';

	var setCurrentYear = function() {
		var year = new Date().getFullYear();
		$('.current-year').text(year);
	};

	var readStoredTheme = function() {
		try {
			var stored = window.localStorage.getItem(themeStorageKey);
			if (stored === 'glassmorphism')
				return 'glassmorphism';
			if (stored === 'modern' || stored === 'default')
				return 'modern';
			return 'glassmorphism';
		} catch (err) {
			return 'glassmorphism';
		}
	};

	var persistTheme = function(theme) {
		try {
			window.localStorage.setItem(themeStorageKey, theme);
		} catch (err) {
			// localStorage might be unavailable; fail silently.
		}
	};

	var applyTheme = function(theme) {
		if (theme === 'glassmorphism')
			$body.addClass(glassClass);
		else
			$body.removeClass(glassClass);
	};

	var syncControls = function(value, origin) {
		for (var i = 0; i < themeToggleControls.length; i++) {
			var $control = themeToggleControls[i];
			if (origin && $control[0] === origin[0])
				continue;
			if ($control.val() !== value)
				$control.val(value);
		}
	};

	var createThemeSelect = function(id) {
		var $select = $('<select></select>')
			.attr('id', id)
			.addClass('site-theme-select')
			.append('<option value="glassmorphism">Glassmorphism</option>')
			.append('<option value="modern">Modern</option>')
			.val(currentTheme);

		themeToggleControls.push($select);

		$select.on('change', function() {
			var value = $(this).val();
			currentTheme = value === 'glassmorphism' ? 'glassmorphism' : 'modern';
			applyTheme(currentTheme);
			persistTheme(currentTheme);
			syncControls(currentTheme, $select);
		});

		return $select;
	};

	var buildThemeToggle = function() {
		var $footer = $('#footer');
		if ($footer.length === 0 || $footer.find('.theme-toggle-footer').length > 0)
			return;

		var $container = $('<div class="theme-toggle-footer"></div>');
		var $label = $('<label class="visually-hidden" for="site-theme-toggle-footer">Site theme</label>');
		var $select = createThemeSelect('site-theme-toggle-footer');
		$container.append($label).append($select);
		$footer.append($container);
	};

	currentTheme = readStoredTheme();
	applyTheme(currentTheme);
	setCurrentYear();

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Touch mode.
		if (browser.mobile)
			$body.addClass('is-touch');

	// Scrolly links.
		$('.scrolly').scrolly({
			speed: 2000
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			alignment: 'right',
			hideDelay: 350
		});

	// Nav.

		// Title Bar.
			$(
				'<div id="titleBar">' +
					'<a href="#navPanel" class="toggle"></a>' +
					'<span class="title">' + $('#logo').html() + '</span>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

		buildThemeToggle();

	// Parallax.
	// Disabled on IE (choppy scrolling) and mobile platforms (poor performance).
		if (browser.name == 'ie'
		||	browser.mobile) {

			$.fn._parallax = function() {

				return $(this);

			};

		}
		else {

			$.fn._parallax = function() {

				$(this).each(function() {

					var $this = $(this),
						on, off;

					on = function() {

						$this
							.css('background-position', 'center 0px');

						$window
							.on('scroll._parallax', function() {

								var pos = parseInt($window.scrollTop()) - parseInt($this.position().top);

								$this.css('background-position', 'center ' + (pos * -0.15) + 'px');

							});

					};

					off = function() {

						$this
							.css('background-position', '');

						$window
							.off('scroll._parallax');

					};

					breakpoints.on('<=medium', off);
					breakpoints.on('>medium', on);

				});

				return $(this);

			};

			$window
				.on('load resize', function() {
					$window.trigger('scroll');
				});

		}

	// Spotlights.
		var $spotlights = $('.spotlight');

		$spotlights
			._parallax()
			.each(function() {

				var $this = $(this),
					on, off;

				on = function() {

					var top, bottom, mode;

					// Use main <img>'s src as this spotlight's background.
						$this.css('background-image', 'url("' + $this.find('.image.main > img').attr('src') + '")');

					// Side-specific scrollex tweaks.
						if ($this.hasClass('top')) {

							mode = 'top';
							top = '-20%';
							bottom = 0;

						}
						else if ($this.hasClass('bottom')) {

							mode = 'bottom-only';
							top = 0;
							bottom = '20%';

						}
						else {

							mode = 'middle';
							top = 0;
							bottom = 0;

						}

					// Add scrollex.
						$this.scrollex({
							mode:		mode,
							top:		top,
							bottom:		bottom,
							initialize:	function(t) { $this.addClass('inactive'); },
							terminate:	function(t) { $this.removeClass('inactive'); },
							enter:		function(t) { $this.removeClass('inactive'); },

							// Uncomment the line below to "rewind" when this spotlight scrolls out of view.

							//leave:	function(t) { $this.addClass('inactive'); },

						});

				};

				off = function() {

					// Clear spotlight's background.
						$this.css('background-image', '');

					// Remove scrollex.
						$this.unscrollex();

				};

				breakpoints.on('<=medium', off);
				breakpoints.on('>medium', on);

			});

	// Wrappers.
		var $wrappers = $('.wrapper');

		$wrappers
			.each(function() {

				var $this = $(this),
					on, off;

				on = function() {

					$this.scrollex({
						top:		250,
						bottom:		0,
						initialize:	function(t) { $this.addClass('inactive'); },
						terminate:	function(t) { $this.removeClass('inactive'); },
						enter:		function(t) { $this.removeClass('inactive'); },

						// Uncomment the line below to "rewind" when this wrapper scrolls out of view.

						//leave:	function(t) { $this.addClass('inactive'); },

					});

				};

				off = function() {
					$this.unscrollex();
				};

				breakpoints.on('<=medium', off);
				breakpoints.on('>medium', on);

			});

	// Banner.
		var $banner = $('#banner');

		$banner
			._parallax();

})(jQuery);
