var Datastore = require('nedb')


var request = require('request');
var cheerio = require('cheerio');         // Web parser. Used to collect Itapema's information.

var hash = require('object-hash');


function itapema_list_dates() {
	return new Promise( (resolve, reject) => {
		let dates = []
		request('http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,0,0,0,PlayList.html', function (error, response, html) {
		    if (!error) {
			var $ = cheerio.load(html);
			$('select#data option').each( (index, value) => {
				let select_value = $(value).attr('value');
				if (select_value != 0) {					
					dates.push(select_value);
				}
			});
			resolve(dates);
		    } else {
			reject(error);
		    }
		});
	})		
}

function itapema_list_musics_from_date(date) {
	return new Promise( (resolve, reject) => {
		let music_list = []
		
		let year = date.substr(4,4);
		let month = date.substr(2,2);
		let day = date.substr(0,2);

		let url_date = day+month+year;

		console.log('requesting '+url_date);

		request('http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,5,2,'+ url_date+',PlayList.html', function (error, response, html) {
		    if (!error) {
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
					music.album = music_disco.match(/[^(]*/)[0].trim();
					found = music_disco.match(/[(].*[)]/);
		                        if (found) {
						music.disco =  found[0];
					}
					
					music.id = hash(music);
					
					music_list.push(music);
				});
			});
			resolve(music_list);
		    } else {
			reject(error);
		    }
		});
	})
}


dates = itapema_list_dates();//process.argv.slice(2)


dates.then( (dates) => {
	
	
	let db = new Datastore({ filename: './musics.db', autoload: true })
	
	db.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
		console.log(err);
	});
	
	dates.forEach( (date) => {

		let list = itapema_list_musics_from_date(date)
		list.then( (music_list) => {
			
				console.log(music_list.length);

				music_list.forEach( (music) =>{
					db.update(music, music, { upsert: true },  (err, row) =>{
						if(err) {
							console.log(err);
						}
					})
				});


			}
		).catch(console.log);

	});

});
