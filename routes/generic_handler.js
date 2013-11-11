/**
 * By Jean
 * 
 * Get the base 64 image to use zachwill's img64 api
 * Ref. https://github.com/zachwill/img64
 */

var genericHandler = {};
var workingPath = process.cwd();
var fbMgr = require(workingPath + "/facebook_Mgr.js");
var request = require("request");
var img64Url = 'http://img64.com/?q=';

var DEBUG = true,
FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;

genericHandler.getFbProfilePhoto = function(req, res){
	logger.info('[GET ' + req.path + '] is called');
	if(req){
		fbMgr.getUserProfilePicture(req.params.memberId, "ondascreen", function(err, result){
			if(!err){
				logger.info("[genericHandler.getFbProfilePhoto result]" + result);
				
                request({
                    method: 'GET',
                    uri: img64Url + result.picture.data.url,
                    json: true
                    
                }, function(error, response, body){
                    if(error){
                    	FM_LOG("[generic_handle.request error]" + error);
                    }else if(body.error){
                        FM_LOG("[generic_handle.request error]" + body.error);
                    }else{
                    	res.send(body.data);
                    }
                });
                
			}else{
				logger.info("[genericHandler.getFbProfilePhoto error]" + err);
			}
		
		});
	}else{
		res.send({"message": "Failed to get facebook profile photo."});
	}
	
};


module.exports = genericHandler;