/*
 * Portal Auth — login/logout helpers and route protection
 */
(function () {
	'use strict';

	/* ── Helpers ────────────────────────────────────────────── */

	function getBasePath() {
		// Works whether we're in /portal/ or /assets/
		var path = window.location.pathname;
		if (path.indexOf('/portal/') !== -1) return '../';
		return '';
	}

	/* ── User document cache ───────────────────────────────── */

	var _userDocCache = null;

	function getUserDoc(uid) {
		if (_userDocCache && _userDocCache.uid === uid) {
			return Promise.resolve(_userDocCache.data);
		}
		return db.collection('users').doc(uid).get().then(function (snap) {
			if (!snap.exists) return null;
			var data = snap.data();
			_userDocCache = { uid: uid, data: data };
			return data;
		});
	}

	function clearUserDocCache() {
		_userDocCache = null;
	}

	/* ── Login ─────────────────────────────────────────────── */

	function loginWithEmail(email, password) {
		return auth.signInWithEmailAndPassword(email, password);
	}

	/* ── Logout ────────────────────────────────────────────── */

	function logout() {
		clearUserDocCache();
		return auth.signOut().then(function () {
			window.location.href = getBasePath() + 'portal/login.html';
		});
	}

	/* ── Route Protection ──────────────────────────────────── */

	/**
	 * requireAuth(opts)
	 *   opts.role    — 'admin' | 'client' | undefined (any authenticated)
	 *   opts.onReady — function(user, userDoc) called when auth + role check pass
	 */
	function requireAuth(opts) {
		opts = opts || {};
		var base = getBasePath();
		var loginUrl = base + 'portal/login.html';

		auth.onAuthStateChanged(function (user) {
			if (!user) {
				window.location.href = loginUrl;
				return;
			}

			getUserDoc(user.uid).then(function (userDoc) {
				if (!userDoc) {
					// Auth user exists but no Firestore user doc
					auth.signOut();
					window.location.href = loginUrl;
					return;
				}

				if (opts.role && userDoc.role !== opts.role) {
					// Wrong role — redirect to appropriate page
					if (userDoc.role === 'admin') {
						window.location.href = base + 'portal/admin.html';
					} else {
						window.location.href = base + 'portal/dashboard.html';
					}
					return;
				}

				if (typeof opts.onReady === 'function') {
					opts.onReady(user, userDoc);
				}
			}).catch(function () {
				auth.signOut();
				window.location.href = loginUrl;
			});
		});
	}

	/* ── Redirect if already logged in (for login page) ──── */

	function redirectIfLoggedIn() {
		auth.onAuthStateChanged(function (user) {
			if (!user) return;

			getUserDoc(user.uid).then(function (userDoc) {
				if (!userDoc) return;
				var base = getBasePath();
				if (userDoc.role === 'admin') {
					window.location.href = base + 'portal/admin.html';
				} else {
					window.location.href = base + 'portal/dashboard.html';
				}
			});
		});
	}

	/* ── Public API ────────────────────────────────────────── */

	window.portalAuth = {
		loginWithEmail: loginWithEmail,
		logout: logout,
		requireAuth: requireAuth,
		redirectIfLoggedIn: redirectIfLoggedIn,
		getUserDoc: getUserDoc,
		clearUserDocCache: clearUserDocCache
	};
})();
