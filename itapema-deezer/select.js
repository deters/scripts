let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./musics.sqlite');

let BEST_MUSICS_QUERY = `
  select
    deezer_id,
    max(music) as music,
    max(artist) as artist,
    0.0 + count(*) - min(new) as ranking,
    max(release_date) as release_date
  from (
    select
      deezer_id,
      id,
      music,
      artist,
      release_date,
      ( julianday(date('now')) - julianday(release_date) ) as atual,
      ( julianday(date('now')) - julianday(playdate) ) as new
    from music
    where deezer_id is not null
      and isrc like '%'
      and playtime between time('07:00') and time('21:59')
      and julianday(date('now')) <> julianday(playdate)
  ) x
  group by deezer_id
  having count(*) - min(new) > 0
  order by random() --ranking desc, atual desc
`;/*1/(julianday('now') - julianday(max(diff))) *     */

let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let count = 0;

db.all(BEST_MUSICS_QUERY, [], (err, rows) => {
  console.log(`got ${rows.length} rows`);
  let order = rows.map((row)=>{
    if (count++ < 30) {
      console.log(`#${count}: ${row.ranking} ${row.release_date}, ${row.artist} - ${row.music}  `);
    }
    return row.deezer_id;
  }).join(',')

  let playlist_promise = deezer.deezer_get_playlist(token,'Itapema - BR');
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
