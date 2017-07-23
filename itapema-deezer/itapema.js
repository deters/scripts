/*

Copyright 2017 Lucas Augusto Deters <deters@inf.ufsc.br>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/


var cheerio = require('cheerio');         // Web parser. Used to collect Itapema's information.
var request = require('request');

	
exports.list_musics_from_date =  function(date) {

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
