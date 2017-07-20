/*

Copyright 2017 Lucas Augusto Deters <deters@inf.ufsc.br>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var DZ = require('node-deezer');          // A public library to deal with Deezer. It has some bugs, so eventually i'll get rid of him.
var http = require('http');               // I need to call Deezer's api via http for some actions, because node-deezer has some bugs.
var express = require('express');         // Deezer authentication involves sending the user to deezer authentication site and getting back the code via post parameters. That's why I need an http server.
var dateFormat = require('dateformat');   // Date formatter.
var cheerio = require('cheerio');         // Web parser. Used to collect Itapema's information.
var fs = require('fs');                   // We want to save and reuse the Deezer's authentication token. We will save it in a file.
semaphore = require('semaphore')          // Deezer api has a very low usage quota. We will use a sempahore and timeout to limit the request rate.


var request = require('request');

// Due to Deezer usage quotas, the limit will be 10 requests per secound
let DEEZER_QUOTA_REQUESTS=10
let DEEZER_QUOTA_TIME=1

// use a semaphore to limit the simulatenous quota requests.

var sem1 = semaphore(DEEZER_QUOTA_REQUESTS);



var app = express();



// I want to get rid of this.
var deezer = new DZ();

app.get('/', (req, res) => {

	let credentials = config_get_credentials();

	var perms = ['offline_access', 'manage_library', 'delete_library'];
	var loginUrl = deezer.getLoginUrl(credentials.appId, credentials.redirectUrl, perms);

	res.write('<html><body><a href="'+loginUrl+'">Autorizar acesso no Deezer</a><br>');


	if (credentials.accessToken) {

		let user_promise = deezer_get_user(token).catch( (err) => { 
			res.write('<br>Erro ao acessar deezer. Tente autorizar novamente. '+err);	
			res.send()
		 })

		user_promise.then( (user) => {	
			res.write('<br>Bem vindo '+user.id+' - '+user.name);	
			res.send();
		});	

	} else {
		res.write('<br>Você ainda não está logado.');
		res.send();
	}

});


function itapema_list_musics_from_date(date) {

	return new Promise( (resolve, reject) => {

	console.log('itapema_list_musics_from_date ',date);

		let music_list = []


		let destinos = {

			madrugada : {nome: 'Itapema - Madrugada'},
			acorde : {nome: 'Itapema - Acorde'},
			mundo : {nome: 'Itapema - Mundo'},
			soul : {nome: 'Itapema - Soul'},
			fim_de_tarde : {nome: 'Itapema - Fim de Tarde'},

		}


		horarios_playlist={
			'00': destinos.madrugada,
			'01': destinos.madrugada,
			'02': destinos.madrugada,
			'03': destinos.madrugada,
			'04': destinos.madrugada,
			'05': destinos.madrugada,
			'06': destinos.acorde,
			'07': destinos.mundo,
			'08': destinos.mundo,
			'09': destinos.mundo,
			'10': destinos.soul,
			'11': destinos.soul,
			'12': destinos.mundo,
			'13': destinos.mundo,
			'14': destinos.mundo,
			'15': destinos.mundo,
			'16': destinos.mundo,
			'17': destinos.fim_de_tarde,
			'18': destinos.fim_de_tarde,
			'19': destinos.mundo,
			'20': destinos.mundo,
			'21': destinos.mundo,
			'22': destinos.soul,
			'23': destinos.soul,
		}

		request('http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,5,2,'+ date +',PlayList.html', function (error, response, html) {
		    if (!error) {
			var $ = cheerio.load(html);

			$('table.grade tbody').each( (index, value) => {


				let tbody = $(value);


				$('tr', tbody).each ( (index, value) => {

					let tr = $(value);
										
					var musica = { playlist: '', cantor: '', musica: '', disco: ''}

					musica.horario = tr.children().first().text();
					musica.cantor  = tr.children().first().next().text();
					var musica_disco  = tr.children().first().next().next().text();
					musica.musica = musica_disco.match(/[^(]*/)[0].trim();
					found = musica_disco.match(/[(].*[)]/);
		                        if (found) {
						musica.disco =  found[0];
					}

					let hora = musica.horario.substr(0,2)
					let playlist_name = horarios_playlist[hora].nome;
					musica.playlist = playlist_name;


					if (!(/^Vh |^Vinheta|Itapema/.test(musica.musica)) ) {
						music_list.push(musica);
					}

				});
			});
			
			resolve(music_list);

		    } else {
			reject(error);
		    }
		});




	})


}


// work in progress...
function http_post_json(path, data, callback) {

	var options = {
	  uri: 'http://api.deezer.com/'+path,
	  method: 'POST',
	  json: data
	};

	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {


		console.log([body]);

		let result = body;
		callback(result.error, result);
	  }
	});
}


function http_get(url, callback) {

	http.get(url, function(res) {

	    var content = '';
	    res.on('data', function(chunk) {
		content += chunk;
	    });
	    res.on('end', function() {
		let result = content;
		callback(result.error, result);

	    });

	}).on('error', function(e) {
	    console.log("Got error on get: " + e.message);
	});
}

function http_get_json(url, callback) {

	http_get(url, (err, content) => {
		callback(err, JSON.parse(content));
	});

}

function deezer_get_access_token(appId, appSecret, code, callback){

	let url='http://connect.deezer.com/oauth/access_token.php?app_id='+appId+'&secret='+appSecret+'&code='+code;

	// extract the token from the raw body of the response

	http_get(url, (err, result) => {
		let accessToken = result.replace(/.*access_token=/,'').replace(/&.*/,'');
		callback(err, {accessToken: accessToken});
	});
}


app.get('/auth', function (req, res) {

	var code = req.query['code'];


	let credentials = config_get_credentials();

	if (!code) {
               var err = req.query['error_reason'];
               console.log(err);		
	} 
	

	deezer_get_access_token(credentials.appId, credentials.appSecret, code, (err, result)=>{

		if (err) {
			console.log('err getting access token', err);
		} else {

			console.log(result.accessToken);

			var myOptions = {
                                appId: credentials.appId,
                                appSecret: credentials.appSecret,
				redirectUrl : credentials.redirectUrl,
		    		code: code,
				accessToken: result.accessToken,
			}

			var data = JSON.stringify(myOptions);


			fs.writeFile('./config.json', data, function (err) {
			    if (err) {
			      console.log('There has been an error saving your configuration data.');
			      console.log(err.message);
			      return;
			    }
			    console.log('Configuration saved successfully.')
			  });

			res.write('<html><body><a href="./run"> Executar importação </a>');
			res.send();


		}

	});

});


function config_get_credentials() {
	var credentials = null;
        var data = fs.readFileSync('./config.json'),
              myObj;
          try {
            credentials = JSON.parse(data);
          }
          catch (err) {
            console.log('There has been an error parsing ./config.json')
            console.log(err);
          }
	return credentials;
}

function deezer_get_user(token){

	let url = 'http://api.deezer.com/user/me?access_token='+token;
	console.log(url);

	let user_promise = new Promise( (resolve, reject) => {
		http_get_json(url, (err, result)=> {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});

	return user_promise;

}

function deezer_create_playlist(token, title, callback) {

	// cria uma playlist 
	deezer.request(
		token, 
		{
		      resource: 'user/me/playlists',
		      method: 'post',
		      fields: {
			title: title
		      }
		},
		(err, result) => {
			if (result) {
				callback(err, result);
			}
		}
	);

}


function deezer_music_search(token, cantor, musica){

	let result = new Promise( (resolve, reject) => {

		try {

			let url = 'http://api.deezer.com/search?limit=1&access_token='+token+'&q=artist:"'+cantor.replace(/[\"']/g, ' ').replace(/ e .*/g, '')+'" track:"'+ musica.replace(/[\"']/g, ' ') +'"';

			http_get_json(url, (err, result)=> {
				if (err) {
					reject(err);
				} else {
					if (result.total >= 1) {
						let music = result.data[0];
						resolve(music);
					} else {
						reject('music not found', err);
					}
				}
			});

		} catch (err) {
			reject(err);
		}


	});


	return result;

}




function deezer_playlist_tracks(token, playlist_id){


	console.log('deezer_playlist_tracks',token, playlist_id);

	return new Promise( (resolve, reject) => {

		let url = 'http://api.deezer.com/playlist/'+playlist_id+'/tracks?limit=100000&access_token='+token;

		http_get_json(url, (err, result) => {
			if (err) { 
				reject(err);
			} else {
				resolve(result.data);
			}
		});

	});
}



function deezer_playlist_sort(token, playlist_id, order) {

	console.log('deezer_playlist_sort', playlist_id);

	return new Promise( (resolve, reject) => {

		// cria uma playlist 
		deezer.request(
			token, 
			{
			      resource: 'playlist/'+playlist_id+'/tracks',
			      method: 'post',
			      fields: {
				order: order
			      }
			},
			(err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}
		);



	});

}


function sort_playlist(token, playlist_promise) {



	return new Promise( (resolve, reject) => {


		console.log('SORT_PLAYLIST');

		playlist_promise.then( (playlist) => {


			let tracks_promise = deezer_playlist_tracks(token, playlist.id);

			tracks_promise.then( (tracks) => {

				console.log('TRACKS = ',tracks.length);
			
				let new_order = tracks.sort((t1,t2)=>{return Math.random() > 0.5 ? 1 :-1 }).map((track)=>{ return track.id}).reduce( (a,b)=> {return a+','+b;});

				deezer_playlist_sort(token, playlist.id, new_order)
				.then((result) => {resolve(playlist)})
				.catch(reject);
		
			}).catch(reject);

		}).catch(reject);

	});

}


function deezer_playlist_music_add(token, playlist_id, music_id) {

//	console.log('deezer_playlist_music_add ', music_id);


	return new Promise( (resolve, reject) => {

		deezer.request(
			token, 
			{
			      resource: 'playlist/'+playlist_id+'/tracks',
			      method: 'post',
			      fields: {
					songs: music_id
					}
		              
			},
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			}

		);

	});


}

function deezer_get_playlist(token, name) {

	let playlist = new Promise( (resolve, reject) => {

		deezer.request(
			token, 
			{
			      resource: 'user/me/playlists',
			      method: 'get',
			      fields: {
					limit : 1000
			      }
			},
			(err, results) => {

				var found = 0;

				if (err) {
					reject(err);
	 			} else {

					for (var i = 0; i < results.data.length; i++) {
						if (results.data[i].title == name) {



							if (found == 0) {
								found = 1;
								resolve(results.data[i]);
							}




						}
					}
				}

				if (found == 0) {

						deezer_create_playlist(token, name, (err, result) =>{
							if (err) {
								reject(err);
							} else {
								resolve(result);
							}
						});

				}

			}
		);

	});

	return playlist;
}


function get_music_from_deezer(music) {



}



function get_playlist(playlists, playlist_name, token) {


	let playlist_promise =  playlists.get(playlist_name);

	if (!playlist_promise) {

		playlist_promise = deezer_get_playlist( token, playlist_name );
		playlists.set( playlist_name, playlist_promise );

	}

	return playlist_promise;
}

function import_music_to_deezer(music, playlists, token) {

	//console.log('Waiting to import ',music.musica);

	return new Promise((resolve, reject) => {

//		console.log('From itapema: ',music.musica);

		sem1.take(()=>{

			//console.log('Importing ',music.musica);

			setTimeout(sem1.leave, DEEZER_QUOTA_TIME * 1000);

			let playlist_promise = get_playlist(playlists, music.playlist, token);


			playlist_promise.then((playlist) => {


				deezer_music_search(token, music.cantor, music.musica)
				.then( (m) => {

						deezer_playlist_music_add(token, playlist.id, m.id)
						.catch((err)=>{console.log(err)}).then( (result) => { console.log('Imported '+ music.musica); resolve(result)} );



				}).catch((err)=>{console.log(err); resolve(null)});

			}).catch( reject );

		

		});
	});
}


function import_musics_to_deezer(music_list, token){


	return new Promise( (resolve, reject) => {
		
		let playlists = new Map();

		let music_added_promise_list = music_list.map( (music) => {

			return import_music_to_deezer(music, playlists, token);

		});

		Promise.all( music_added_promise_list ).catch( err => console.log('Error on music add: ', err)).then( () => { resolve(playlists) });

	});
}



function sort_playlists(playlists, token) {

	console.log('sort_palylists ', playlists.length);


	return new Promise( (resolve, reject) => {
		let sort_promises = [];
		playlists.forEach( (playlist_promise) => {
			sort_promises.push(sort_playlist(token, playlist_promise));
		});
		Promise.all(sort_promises).then( resolve ).catch(reject);
	});
}




function run(token, date){

	console.log('Using token: ',token);

	itapema_list_musics_from_date( date )
	.then ( music_list => import_musics_to_deezer(music_list, token) )
	.then ( playlists  => sort_playlists(playlists, token) )
	.then ( playlists  => console.log('Playlists sorteadas: ', playlists.length )  )
	.catch( err => { console.log('err: ',err); } );

}


app.get('/run', function (req, res) {

	let today = dateFormat(new Date(), "ddmmyyyy");
	let credentials = config_get_credentials();
	run(credentials.accessToken, today);
	res.send('<a href="http://localhost:3000">Reiniciar</a>');

});


var server = app.listen(3000, () => {  
	console.log('Example app listening on port 3000!');


	let credentials = config_get_credentials();

	process.argv.slice(2).forEach(function (val, index, array) {
		let credentials = config_get_credentials();
		run(credentials.accessToken, val);
	});
});


// need to test without this... i did it because server requests 
server.timeout = server.timeout * 20;

