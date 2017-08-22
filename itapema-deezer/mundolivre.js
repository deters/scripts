/*
Tasks:

1. download itapema's playlist => itapema.db
2. identify musics on deezer   => deezer-musics.db
3. map musics to playlists     => deezer-playlists.db
*/
var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./itapema_musics.sqlite');

var request = require('request-promise');
var hash = require('object-hash');

					music.id = hash(music);

var stmt = db.prepare("INSERT INTO ITAPEMA_MUSIC VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

function itapema_save_musics(music_list) {

	console.log(music_list.length);
	music_list.forEach( (music) =>{

		stmt.run([music.id, music.origin, music.year, music.month, music.day, music.time, music.artist, music.music, music.disco, null] , (err, row) => {
			if(err && err.code != 'SQLITE_CONSTRAINT' ) {
				console.log(err);
			} else {
				//console.log('ok '+row);
			}
		})
	});
}

db.run("CREATE TABLE if not exists ITAPEMA_MUSIC (id text primary key, origin text, year int, month int, day int, time text, artist text, music text, disc text, deezer_id int, isrc text)", (err, result) => {
	itapema_list_dates()
	.then( (dates) => {
		dates.forEach( (date) => {
			itapema_list_musics_from_date(date)
			.then(itapema_save_musics)
			.catch(console.log);
		});

	})
	.catch(console.log);;
})

deezer.http_get_json('http://mundolivrefm-static.s3.amazonaws.com/player/infoplayer.json')
.then((music) => {

  var music = {}
  music.origin = 'Mundo Livre'
  music.year = year;
  music.month = month;
  music.day = day;
  music.time = tr.children().first().text();
  music.artist  = tr.children().first().next().text();
  var music_disco  = tr.children().first().next().next().text();
  music.music = music_disco.match(/[^(]*/)[0].trim();
  found = music_disco.match(/[(].*[)]/);
  if (found) {
    music.disco =  found[0];
  }
  music.id = hash(music);



  itapema_save_musics([music])
})
.catch(console.log);

`
create table if not exists mundolivre
( artista text,
  musica text,
  album text,
  programa: '‎Midnight Metal‬'
