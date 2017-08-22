let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');

let stmt = db.prepare(`
  update ITAPEMA_MUSIC
  set deezer_id = ?
  where
  artist = ? and music = ?
  `);

  let DISTINCT_DEEZER_MUSICS_QUERY = `
  select distinct artist, music
  from ITAPEMA_MUSIC
  where deezer_id is null
  and music not like '%Itapema%'
  and music not like '%Vinheta%'
  and music not like '%Vh %'
  order by year desc, month desc, day desc
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
