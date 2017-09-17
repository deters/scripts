let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./musics.sqlite');

let stmt = db.prepare(`
  update music
  set deezer_id = ?
  where
  artist = ? and music = ?
  `);

  let DISTINCT_DEEZER_MUSICS_QUERY = `
  select artist, music, max(playdate) as last_playdate
  from music
  where deezer_id is null
  and music not like '%Itapema%'
  and music not like '%Vinheta%'
  and music not like '%Vh %'
  group by artist, music
  `;

  db.each(DISTINCT_DEEZER_MUSICS_QUERY, function (err, music) {
    if (err) {
      console.log(err);
    }
    //if (!(/^Vh |^Vinheta|Itapema/.test(music.music)) ) {

    deezer.deezer_music_search(token, music.artist, music.music)
    .then( (deezer_music) => {
      stmt.run([deezer_music.id, music.artist, music.music ] , (err, result) => {
        if (err){
          console.log(err);
        } else {
          console.log(deezer_music.id);
        }
      });
    }).catch(console.log);
    //}

  });
