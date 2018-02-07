//var bodyParser = require('body-parser');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../musics.sqlite');
let semaphore = require('semaphore')

let QUOTA_TIME = 1;
let QUOTA = 10;
var sem1 = semaphore(QUOTA) // 10 requests per secound]


var rp = require('request-promise');

function https_request(options) {
console.log(options);
        return new Promise( (resolve, reject) => {
                https.request(options, (error, response, body)  => {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body);
        resolve(body);
    } else {
        reject(error);
    }

});
});

}

function https_request_json(url) {
        return new Promise( (resolve, reject) => {
                https_request(options).then( (content) => resolve(JSON.parse(content)) ).catch(reject);
        });
}



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
  artist = ?
  and music = ? 
  `);




function work(spotifyApi) {
    
 db.each(`

  select
    deezer_id,
    spotify_id,
    max(music) as music,
    max(artist) as artist,
    sum(play_rev_ranking) as ranking
  from (
    select 
      deezer_id,
      spotify_id,
      id,
      music,
      artist,
      release_date,
      1/( julianday(date('now')) - julianday(playdate) ) as play_rev_ranking
    from music
    where deezer_id is not null
      and playtime between time('07:00') and time('21:59')
      and julianday(date('now'), '-2 days') <> julianday(playdate)
  ) x
  group by deezer_id, spotify_id
  having deezer_id is not null and spotify_id is not null
  order by ranking + random() desc
  limit 200
`, function(err, row) {

let insert = db.prepare(`
insert into music (
   id,
   origin,
   artist,
   music,
   spotify_id
) values (
   ?,
   ?,
   ?,
   ?,
   ?   
);`);
           
get_slot().then( () =>{


      console.log(row.music );


var options = {
    uri: 'https://api.spotify.com/v1/recommendations',
    qs: {'seed_tracks': row.spotify_id, 'limit': '10', 'min_popularity': '90'}, //, 'target_popularity': '80'},
    headers: {
        'Authorization': 'Bearer '+spotifyApi.getAccessToken()
    },
    json: true
}
      rp(options)
      .then( respos =>{
        respos.tracks.forEach( music => {
          console.log('  %s | %s | %s', music.id, music.name, music.artists[0].name);

        insert.run([ music.id + '#' + row.spotify_id, 'Spotify', music.artists[0].name, music.name, music.id], (err, result) => {
            console.log(err+' '+result);
        });


        })
      }).catch( console.log );
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
