let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');

let BEST_MUSICS_QUERY = `
select
  deezer_id,
  count(diff) as ranking
from (
  select
    deezer_id,
    year,
    month,
    day,
    id,
    strftime('%Y-%m-%d', year ||'-'|| substr('00'||month,-2,2) ||'-'|| day) diff
  from itapema_music
  where deezer_id is not null
    and isrc like 'BR%'
)
group by deezer_id
order by ranking desc
limit 110
`;/*1/(julianday('now') - julianday(max(diff))) *     */

let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

db.all(BEST_MUSICS_QUERY, [], (err, rows) => {
  console.log(`got ${rows.length} rows`);
  let order = rows.map((row)=>{return row.deezer_id}).join(',')

  let playlist_promise = deezer.get_create_playlist(token,'Itapema - BR');
  playlist_promise.then((playlist) => {
    console.log(`got playlist ${playlist.id}`)

    deezer.deezer_playlist_music_add(token, playlist.id, order)
    .then( () => { deezer.deezer_playlist_sort(token, playlist.id, order) })
    .then( () => { console.log(`Sorted playlist ${playlist.id}`); })
    .then( () => { return deezer.deezer_playlist_tracks(token, playlist.id) } )
    .then( (tracks) => {
      //console.log(tracks);
      let i = 0;
      let last = tracks.filter((x, i) => {return i >= 100}).map((row)=>{return row.id}).join(',')
      console.log(`filtered: ${last}.`);
      deezer.deezer_playlist_tracks_delete(token, playlist.id, last)
      .then((result)=>{
        console.log(`resultado do delete: ${result}`)
      }).catch((err)=>{console.log(`err: ${err}`)});
    }).catch((err)=>{console.log(`err: ${err}`)});



  }).catch( console.log );
}
);
