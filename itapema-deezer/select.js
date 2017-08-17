

let deezer = require('./deezer.js')

let credentials = deezer.config_get_credentials();
let token = credentials.accessToken;

var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');


var order = ''
/*1/(julianday('now') - julianday(max(diff))) *     */
db.each("select deezer_id,  count(diff) as ranking from (select deezer_id, year, month, day, strftime('%Y-%m-%d', year ||'-'|| substr('00'||month,-2,2) ||'-'|| day) as diff from ITAPEMA_MUSIC where deezer_id is not null)  group by deezer_id order by ranking desc limit 1000;", (err, result) => {

  console.log(result);

  order = order + ','+result.deezer_id;


},
()=>{


  order = order.substr(1)

  console.log(order);

  deezer.deezer_playlist_music_add(token, 3368767706, order).then( () => {

  deezer.deezer_playlist_sort(token, 3368767706, order).then(()=>{
    console.log('SORTEADO!');
  }).catch(console.log);

  }).catch(console.log);



}
);
