

exports.getTimeData = function(req, res) {
	//get message.
	user = req.headers.rawdata;
	res.writeHead(200, { "Content-Type": "text/plain" });
	/*
	if(user) {
		console.log('DOOH member: ' + req.headers.dooh);
		console.log('Client message: ' + JSON.parse(user));
		//send to client.
		res.write('Hello.');
	} else {
		console.log(user);
		console.log('No data.');
	}
	*/
	var result = "";
	console.log('DOOH member: ' + req.headers.dooh);
	req.on('data', function(chunk) { result += chunk; }).on('end', function() { console.log(JSON.parse(result)); });
	res.end();
};