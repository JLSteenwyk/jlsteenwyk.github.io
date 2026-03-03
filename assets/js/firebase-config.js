/*
 * Firebase Configuration
 * Replace the placeholder values below with your actual Firebase project config.
 * Find these in: Firebase Console → Project Settings → Your apps → Config
 */
(function () {
	'use strict';

	var firebaseConfig = {
		apiKey: 'AIzaSyDwzoMop0tiEfgd9iy-FHaDzln-sv6EwAw',
		authDomain: 'jlsteenwyk-portal.firebaseapp.com',
		projectId: 'jlsteenwyk-portal',
		storageBucket: 'jlsteenwyk-portal.firebasestorage.app',
		messagingSenderId: '709867702459',
		appId: '1:709867702459:web:5dcb938986485b2a2ac19e'
	};

	firebase.initializeApp(firebaseConfig);

	window.db = firebase.firestore();
	window.auth = firebase.auth();
	window.storage = firebase.storage();
})();
