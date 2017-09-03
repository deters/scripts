
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

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./mundolivre.sqlite');

var hash = require('object-hash');



function createTable(){

	console.log('createTable');

	return new Promise( (resolve, reject)=>{
		let create_table = db.prepare(`create table if not exists mundolivre (
			artista text,
			musica text,
			album text,
			programa text,
			datahora timestamp
		)`);m


		create_table.run([],(err, result) => {
			console.log('erro!')
			resolve(err);
		});

	});
}

function saveInfo(info){

	console.log('saveInfo');

	return new Promise((resolve, reject)=>{
		let insert = db.prepare(`insert into mundolivre (artista, musica, album, programa, datahora) values (?,?,?,?,CURRENT_TIMESTAMP)`)
		let data= [info.artista, info.musica, info.album, info.programa];

		insert.run(data, (result, err) =>{
			if(err) {
				reject(err);
			}
			resolve([info.artista, info.musica]);
		});

	});
}

var sleep = require('sleep');

while(1) {

	console.log('--');

	let p = createTable();

	console.log(p);

	p.then((x) => {console.log(`x: ${x}`)});

	// .then((result) => {console.log(result)})
	// .then(getInfo)
	// .then(saveInfo)
	// .then((result) => {console.log(`result: ${result}`)})
	// .catch((err) => {console.log(`err: ${err}`)});


	sleep.sleep(1);


}

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
