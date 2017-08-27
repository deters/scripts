let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');

let stmt = db.prepare(`
  update ITAPEMA_MUSIC
  set isrc = ?,
      release_date = ?
  where deezer_id = ?
  `);



  let DISTINCT_DEEZER_MUSICS_QUERY = `
  select distinct deezer_id
  from ITAPEMA_MUSIC
  where deezer_id is not null
    and (
        isrc is null
        or
        release_date is null
      )
  `;

  db.each(DISTINCT_DEEZER_MUSICS_QUERY, function (err, deezer_music) {
    if (err) {
      console.log(err);
    }

    let track_promise = deezer.deezer_get_track(token, deezer_music.deezer_id);
    track_promise.then( track => {
      // if ((track.isrc + '--').substr(0,2) == 'BR') {
        stmt.run([track.isrc, track.release_date, deezer_music.deezer_id] , (err, result) => {
          if (err){
            console.log(err);
          } else {
            console.log(track.isrc+' '+track.release_date+' '+track.title);
          }
        });
      // }
    }).catch(console.log);
    //}

  });

  console.log('finish');
