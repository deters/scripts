let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./musics.sqlite');

const fs = require('fs');

const testFolder = './playlists/';

fs.readdir(testFolder, (err, files) => {
  if (err) {
	console.log(err);
	return;
  }
  files.forEach(file => {
    console.log('Processing '+file);
    fs.readFile(`./playlists/${file}`, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      updatePlaylist(file, data);
    });
  });
})


let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let count = 0;


function query_musics(query, name) {
	return new Promise( (resolve, reject) => {
		db.all(query, [], (err, rows) => {
			resolve(rows);
		})
	});
}

function updatePlaylist(name, query) {
	console.log('update');

	
	let deezer_playlist_promise = deezer.deezer_get_playlist(token,name);
	let database_musics_promise =  query_musics(query, name)
	let deezer_musics_promise = deezer_playlist_promise.then( playlist =>  { return deezer.deezer_playlist_tracks(token, playlist.id) });
	
	Promise.all([deezer_playlist_promise, database_musics_promise, deezer_musics_promise]).then( ([playlist, database_musics, deezer_musics]) => {
		let oldmusic = deezer_musics.map((row)=>{return row.id});
		let newmusic = database_musics.map((row)=>{return row.deezer_id});
		
		let to_delete = oldmusic.filter( i=> { return newmusic.indexOf(i) < 0 } );
		let to_add = newmusic.filter( i=> { return oldmusic.indexOf(i) < 0 } );
		
		console.log(name, to_add.length, to_delete.length);

		let music_deleted_promise = deezer.deezer_playlist_tracks_delete(token, playlist.id, to_delete.join(','));
		let music_added_promise   = deezer.deezer_playlist_music_add(token, playlist.id, to_add.join(','));
		
		return Promise.all([music_deleted_promise, music_added_promise]).then(()=>{
			return deezer.deezer_playlist_sort(token, playlist.id, newmusic)	
			
		})		
	})
	.then( ()=> { console.log('FIM!'); })
	.catch( console.log );
	
			
}



