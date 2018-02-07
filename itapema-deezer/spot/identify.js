//var bodyParser = require('body-parser');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../musics.sqlite');
let semaphore = require('semaphore')

let QUOTA_TIME = 1;
let QUOTA = 10;
var sem1 = semaphore(QUOTA) // 10 requests per secound]

function get_slot() {
        return new Promise( (resolve, reject) => {
                sem1.take(()=>{
                        setTimeout(sem1.leave, QUOTA_TIME * 1000);
                        resolve(1);
                });
        });
}


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


let stmt = db.prepare(`
  update music
  set spotify_id = ?
  where
  isrc = ?
  `);


function work(spotifyApi) {
    
 db.each("select distinct isrc, music from music where isrc is not null and spotify_id is null order by music", function(err, row) {


get_slot().then( () =>{


      console.log(row.music );
	spotifyApi.searchTracks('isrc:'+row.isrc).then(
			function(data) {
                                let track = data.body.tracks.items[0];
                                if (track) {                               

                                        stmt.run([track.id,row.isrc], (err, result) => {
						if (err) {
							console.log(row.isrc + ' ' + track.id + ' ' + track.name,err);
						} else {
							console.log(row.isrc + ' ' + track.id + ' ' + track.name,'ok');
						}
					});
				}
			}, function(err) {
				console.log('Something went wrong!', err);
			}).catch((err)=>{console.log('err searching track: '+err)});
  });	

});
	
	

}

// Get an access token and 'save' it using a setter
spotifyApi.clientCredentialsGrant().then(function(data) {
	spotifyApi.setAccessToken(data.body['access_token']);
	work(spotifyApi);
}, function(err) {
	console.log('Something went wrong!', err);
});
