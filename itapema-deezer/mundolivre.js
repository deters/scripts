
var request = require('request-promise');

function getInfo() {

	console.log('getInfo');

	return new Promise( (resolve, reject) => {
		request.get('http://mundolivrefm-static.s3.amazonaws.com/player/infoplayer.json').then((content) => {
			try {
				resolve(JSON.parse(content));
			} catch (e) {
				reject(e);
			}
		}).catch(reject);
	});
};

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./mundolivre.sqlite');

var hash = require('object-hash');



var sleep = require('sleep');

console.log(db);

db.serialize(()=>{

	while(1) {

		console.log(db);

		db.run(`CREATE TABLE if not exists mundolivre (id text primary key, origin text, playdate date, playtime time, artist text, music text, disc text, deezer_id int, isrc text, release_date date)
		`);

		db.run(`insert into mundolivre (id) values ('teste!');
		`, (err, response) => {
			console.log(err);
			console.log(response);
		});

db.close();

		/*.then((result) => {
		console.log(result);
	}).catch((err)=>{
	console.log(err);
});
*/

// .then((result) => {console.log(result)})
// .then(getInfo)
// .then(saveInfo)
// .then((result) => {console.log(`result: ${result}`)})
// .catch((err) => {console.log(`err: ${err}`)});


sleep.sleep(1);


}

})




return;



//music.id = hash(music);

//var stmt = db.prepare("INSERT INTO ITAPEMA_MUSIC VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");


// stmt.run([music.id, music.origin, music.year, music.month, music.day, music.time, music.artist, music.music, music.disco, null] , (err, row) => {
// 	if(err && err.code != 'SQLITE_CONSTRAINT' ) {
// 		console.log(err);
// 	} else {
// 		//console.log('ok '+row);
// 	}
// })
