var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get("/", (req, res) => {
		
	res.write(`
			<html>
			<body>
			Go to https://beta.developer.spotify.com/dashboard/applications   and create an App to get the following parameters: 
			<form method="post" action="/configure">
			Client ID: <input name="clientId"/>
			Client Secret: <input name="clientSecret"/>
			<br>
			<input type="submit"/> 
			</form>
			</body>
			</html>
			`);
	res.send();
});


app.post("/configure", (req, res) => {
	
	console.log(req.body);
	
	 var data = JSON.stringify(req.body);
	 
	 fs.writeFile('./config.json', data, function (err) {
		    if (err) {
		      res.send('Error saving to ./config.json: '+err);
		      return;
		    } else {
		    	res.send('Configuration saved to ./config.json . Program terminated.');
		    	process.exit();
		    }
	 });
	
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on http://localhost:" + port);
});