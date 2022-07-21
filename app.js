const https = require('https');
const http = require('http');

let token;
let gamename;
let isStalling=false;
let streamStarted=false;
let isLive=false;

var postData = 'client_id=mstrgjzmmtwisyhgcxghh03a4bg9s6&client_secret=vz7s1p6n0dewrtt247qqzolyhok0tq&grant_type=client_credentials'
const options = {
  hostname: 'id.twitch.tv',
  path: '/oauth2/token',
  method: 'POST',
  headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
     }
};
var req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
	startServer(JSON.parse(d)['access_token']);
  });
});
req.on('error', (e) => {
  console.error(e);
});
req.write(postData);
req.end();

function startServer(accesstoken){	
	const port = process.env.PORT || 3000;
	token = accesstoken;

	const server = http.createServer((req, res) => {
	  res.statusCode = 200;
	  res.setHeader('Content-Type', 'text/plain');
	  res.end(isLive? isStalling.toString()+'\n'+streamStarted.toString()+'\n'+gamename : "");
	});

	server.listen(port, () => {
	  setInterval(function() {
	  	const options = {
		  hostname: 'api.twitch.tv',
		  path: '/helix/streams?user_login=quin69',
		  method: 'GET',
		  headers: {
				'Content-Type' : 'application/json',
			   'Authorization' : 'Bearer ' + token,
			   'Client-Id' : 'mstrgjzmmtwisyhgcxghh03a4bg9s6'
			 }
		};
		
		var req = https.request(options, (res) => {
		  console.log('statusCode:', res.statusCode);
		  console.log('headers:', res.headers);

		  res.on('data', (d) => {
			let streamdata = JSON.parse(d.toString())['data'][0];
			if (streamdata!= undefined)
			{
				isLive=true;
				let datenow = new Date();
				let started_at = new Date(streamdata['started_at']);
				if ((datenow.getTime()-started_at.getTime())/60000<10)
					streamStarted = true;
				else{
					streamStarted = false;
					gamename = streamdata['game_name'];
					console.log("GAMENAME IS " + gamename);
					if (gamename === "Just Chatting")
						isStalling=true;
					else
						isStalling=false;
				}
			}
			else
				isLive=false;
		  });
		});
		
		req.on('error', (e) => {
		  console.error(e);
		});
		
		req.end();
	  }, 90000);
	});
}


