//var bodyParser = require('body-parser');
var fs = require('fs');

var clientConfiguration;

var data = fs.readFileSync('./config.json'), clientConfiguration;

//var port = process.env.PORT || 5000;

try {
	clientConfiguration = JSON.parse(data);
//	clientConfiguration['redirectUri'] = `http://localhost:` + port
			+ '/callback';
	console.dir(clientConfiguration);
} catch (err) {
	console.log(err);
	console
			.log('There has been an error parsing config.json . Make sure you had run configure.js once before running authorize.js');
}

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi(clientConfiguration);

function work(spotifyApi) {

//	spotifyApi.searchTracks('track:Alright artist:Kendrick Lamar').then(
//			function(data) {
//				console.log(data.body.tracks.items);
//			}, function(err) {
//				console.log('Something went wrong!', err);
//			});
//	
    
	

	spotifyApi.searchTracks('isrc:USUM71502498').then(
			function(data) {
				console.log(data.body.tracks.items);
			}, function(err) {
				console.log('Something went wrong!', err);
			});
	
	

}

// Get an access token and 'save' it using a setter
spotifyApi.clientCredentialsGrant().then(function(data) {
	spotifyApi.setAccessToken(data.body['access_token']);
	work(spotifyApi);
}, function(err) {
	console.log('Something went wrong!', err);
});
