/*
Tasks:

1. download itapema's playlist => itapema.db
2. identify musics on deezer   => deezer-musics.db
3. map musics to playlists     => deezer-playlists.db
*/
var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./musics.sqlite');

semaphore = require('semaphore')

let REQUEST_PER_SEC = 1;
var sem1 = semaphore(REQUEST_PER_SEC);

var request = require('request-promise');
var cheerio = require('cheerio');         // Web parser. Used to collect Itapema's information.
var hash = require('object-hash');

function itapema_list_dates() {
	return new Promise( (resolve, reject) => {
		let dates = []
		let url = 'http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,0,0,0,PlayList.html';
		request(url, 'utf-8').then( html => {
			var $ = cheerio.load(html);
			$('select#data option').each( (index, value) => {
				let select_value = $(value).attr('value');
				if (select_value != 0) {
					dates.push(select_value);
				}
			});
			resolve(dates);
		}).catch(reject);

	})
}


const getRaw = function(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

var iconv = require('iconv-lite');

function itapema_list_musics_from_date(date) {


	return new Promise( (resolve, reject) => {

		sem1.take(()=>{
//			setTimeout(sem1.leave, 1 * 2000);


			let music_list = []

			let year = date.substr(4,4);
			let month = date.substr(2,2);
			let day = date.substr(0,2);

			let url_date = day+month+year;

			console.log('requesting '+url_date);
			let url = `http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,5,2,${url_date},PlayList.html`;
			getRaw(url).then( rawhtml => {

				let html = iconv.decode(Buffer.concat(rawhtml), 'iso-8859-1');

				var $ = cheerio.load(html);
				$('table.grade tbody').each( (index, value) => {
					let tbody = $(value);
					$('tr', tbody).each ( (index, value) => {
						let tr = $(value);
						var music = {}
						music.origin = 'Itapema'
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

						music_list.push(music);
					});
				});
                                sem1.leave()
				resolve(music_list);
			}).catch(console.log);

		});

	})



}

var stmt = db.prepare("INSERT INTO MUSIC (id, origin, playdate, playtime, artist, music, disc) VALUES (?, ?, date(?), time(?), ?, ?, ?)");

function itapema_save_musics(music_list) {

	console.log(music_list.length);
	music_list.forEach( (music) =>{

		stmt.run([music.id, music.origin, music.year+'-'+ music.month+'-'+ music.day, music.time+':00', music.artist, music.music, music.disco] , (err, row) => {
			if(err && err.code != 'SQLITE_CONSTRAINT' ) {
				console.log(err);
			} else {
				//console.log('ok '+row);
			}
		})
	});

}

db.run("CREATE TABLE music (id text primary key, origin text, playdate date, playtime time, artist text, music text, disc text, deezer_id int, isrc text,release_date date)", (err, result) => {
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
