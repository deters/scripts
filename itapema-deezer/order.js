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

function updatePlaylist(name, query) {
console.log('update');

db.all(query, [], (err, rows) => {
  console.log(`got ${rows.length} rows`);
  let order = rows.map((row)=>{
      console.log(`${name} += ${row.ranking} ${row.release_date}, ${row.artist} - ${row.music}  `);
    return row.deezer_id;
  }).join(',')

  let playlist_promise = deezer.deezer_get_playlist(token,name);
  playlist_promise.then((playlist) => {
    console.log(`got playlist ${playlist.id}`)

    deezer.deezer_playlist_tracks(token, playlist.id)
    .then( (tracks) => {
      //console.log(tracks);
      let i = 0;
      let last = tracks.map((row)=>{return row.id}).join(',')
      if (last != '') {
        return deezer.deezer_playlist_tracks_delete(token, playlist.id, last);
      }
    })
    .then( () => {
      return deezer.deezer_playlist_music_add(token, playlist.id, order)
    })
    .then( () => { return deezer.deezer_playlist_sort(token, playlist.id, order) })
    // .then( () => { return deezer.deezer_playlist_tracks(token, playlist.id) } )
    // .then( (tracks) => {
    //   //console.log(tracks);
    //   let i = 0;
    //   let last = tracks.filter((x, i) => {return i >= 100}).map((row)=>{
    //     return row.id;
    //   }).join(',')
    //   if (last != '') {
    //     deezer.deezer_playlist_tracks_delete(token, playlist.id, last)
    //     .then((result)=>{
    //       console.log(`resultado do delete: ${result}`)
    //     }).catch((err)=>{console.log(`err: ${err}`)});
    //   }
    // })
    .catch((err)=>{console.log(`err: ${err}`)});



  }).catch( console.log );
}
);

}



