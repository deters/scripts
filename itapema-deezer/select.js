let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');

let BEST_MUSICS_QUERY = `
select
  deezer_id,
  max(music||' - '||artist) as music_artist,
  count(*)*360 / avg(atual) as ranking,
  max(release_date) as max_release_date
from (
  select
    deezer_id,
    year,
    month,
    day,
    id,
    music,
    artist,
    release_date,
    ( julianday(date('now')) - julianday(release_date) ) as atual,
    ( year * 12 + month) / 12 as new
  from itapema_music
  where deezer_id is not null
    and isrc like '%'
)
group by deezer_id
having count(*)> 1
order by ranking  desc
limit 100
`;/*1/(julianday('now') - julianday(max(diff))) *     */

let deezer = require('./deezer.js')
let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

let count = 0;

db.all(BEST_MUSICS_QUERY, [], (err, rows) => {
  console.log(`got ${rows.length} rows`);
  let order = rows.map((row)=>{
    if (count++ < 30) {
      console.log(`#${count}: ${row.ranking} ${row.music_artist}`);
    }
    return row.deezer_id;
  }).join(',')

  let playlist_promise = deezer.get_create_playlist(token,'Itapema - BR');
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
    .then( () => { return deezer.deezer_playlist_tracks(token, playlist.id) } )
    .then( (tracks) => {
      //console.log(tracks);
      let i = 0;
      let last = tracks.filter((x, i) => {return i >= 100}).map((row)=>{
        return row.id;
      }).join(',')
      if (last != '') {
        deezer.deezer_playlist_tracks_delete(token, playlist.id, last)
        .then((result)=>{
          console.log(`resultado do delete: ${result}`)
        }).catch((err)=>{console.log(`err: ${err}`)});
      }
    })
    .catch((err)=>{console.log(`err: ${err}`)});



  }).catch( console.log );
}
);
