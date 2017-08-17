
let deezer = require('./deezer.js')
var sqlite3 = require('sqlite3').verbose();

let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let db = new sqlite3.Database('./itapema_musics.sqlite');

var stmt = db.prepare("update ITAPEMA_MUSIC set deezer_id = ? where artist = ? and music = ?");

db.run("CREATE TABLE if not exists ITAPEMA_MUSIC (id text primary key, origin text, year int, month int, day int, time text, artist text, music text, disc text, deezer_id int)", (err, result) => {

  db.each('select distinct artist, music from ITAPEMA_MUSIC where deezer_id is null', function (err, music) {
    if (err) {
      console.log(err);
    }
    if (!(/^Vh |^Vinheta|Itapema/.test(music.music)) ) {

      let music_promise = deezer.deezer_music_search(token, music.artist, music.music);
      music_promise.then( (deezer_music) => {

        stmt.run([deezer_music.id, music.artist, music.music ] , (err, result) => {
          if (err){
            console.log(err);
          } else {
            console.log(deezer_music.id);
          }
        });

      }).catch(console.log);
    }

  });
});
