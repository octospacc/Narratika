/* global monogatari */

// Define the messages used in the game.
monogatari.action ('message').messages ({

});

// Define the notifications used in the game
monogatari.action ('notification').notifications ({

});

// Define the Particles JS Configurations used in the game
monogatari.action ('particles').particles ({

});

// Define the canvas objects used in the game
monogatari.action ('canvas').objects ({

});

// Credits of the people involved in the creation of this awesome game
monogatari.configuration ('credits', {
	'Character Art': {
		'Updated Character Art': 'Deji',
		'Original Character Art': 'Derik',
	},
	'Background Art': {
		'Updated Background Art': 'Mugenjohncel',
		'Original Background Art': 'DaFool',
	},
	'Music': {
		'Music By': 'Alessio',
	},
	'Writing': {
		'Update Written By': 'Lore',
		'Originally Written By': 'mikey (ATP Projects)',
	},
});


// Define the images that will be available on your game's image gallery
monogatari.assets ('gallery', {

});

// Define the music used in the game.
monogatari.assets ('music', {
	'"music/illurock.opus"': 'illurock.opus',
});

// Define the voice files used in the game.
monogatari.assets ('voices', {

});

// Define the sounds used in the game.
monogatari.assets ('sounds', {

});

// Define the videos used in the game.
monogatari.assets ('videos', {

});

// Define the images used in the game.
monogatari.assets ('images', {

});

// Define the backgrounds for each scene.
monogatari.assets ('scenes', {
	'bg_club': 'bg_club.jpg',
	'bg_lecturehall': 'bg_lecturehall.jpg',
	'bg_meadow': 'bg_meadow.jpg',
	'bg_uni': 'bg_uni.jpg',
});


// Define the Characters
monogatari.characters ({
	'm': {
		name: 'Me',
		color: '#c8c8ff',
	},
	's': {
		name: 'Sylvie',
		color: '#c8ffc8',
	},
	'sylvie': {
		sprites: {
			'blue_giggle': 'sylvie blue_giggle.png',
			'blue_normal': 'sylvie blue_normal.png',
			'blue_smile': 'sylvie blue_smile.png',
			'blue_surprised': 'sylvie blue_surprised.png',
			'green_giggle': 'sylvie green_giggle.png',
			'green_normal': 'sylvie green_normal.png',
			'green_smile': 'sylvie green_smile.png',
			'green_surprised': 'sylvie green_surprised.png',
		},
	},
});