var analysisDB = require('../analysis.js');
var ObjectID = require('mongodb').ObjectID;


exports.recordUserAction_cb = function(req, res) {
	
	if ( req.body ) {
		var records = req.body.records;
		
		for (var i in records) {		
			var actionTime = new Date(Number(records[i].time)),
				user_id = (records[i].user_id) ? ObjectID.createFromHexString(records[i].user_id) : null,
				fb_id = (records[i].user_fb_id) ? records[i].user_fb_id : "Not-Login",
				userName = (records[i].user_fb_name) ? records[i].user_fb_name : "Not-Login",
				action = records[i].action,
				platform = records[i].platform,
				os_version = records[i].os_version;
			
			var record = {
				time: actionTime,
				user_id: user_id,
				userName: userName,
				fb_id: fb_id,
				action: action,
				platform: platform,
				os_version: os_version
			};
			
			/*
			analysisDB.updateRecord( {time: actionTime, user_id: user_id}, record, {upsert: true}, function(err, vdoc){
				if(err)
					logger.log(err);
				if(vdoc)
					logger.log('[%s] %s %s on %s %s.', vdoc.time, vdoc.userName, vdoc.action, vdoc.platform, vdoc.os_version);
					
			}); */
		}
	}
}