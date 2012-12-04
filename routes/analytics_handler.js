exports.recordUserAction_cb = function(req, res) {
	
	if ( req.body ) {
		var records = req.body.records;
		
		for (var i in records) {		
			var actionTime = new Date(Number(records[i].time));
			console.log('[%s] %s %s on %s %s.', actionTime, records[i].user_fb_name, records[i].action, records[i].platform, records[i].os_version );		
		}
		//console.log("user action");
		//console.dir(req.body.records);
	}
	
	//console.log("user action");
	//console.dir(req.body);
}