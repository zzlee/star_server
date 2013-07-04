
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;


FM.facebookMgr = (function(){
    var uInstance = null;
    var request = require("request");
    var fb_url = 'https://graph.facebook.com';
    
    
    /**  for miix.tv @ AWS */
    var app_access_token = "116813818475773|d9EXxXNwTt2eCbSkIWYs9dJv-N0", 
        app_id = "116813818475773",
        app_secret = "b8f94311a712b98531b292165884124a";
    
    
    /** for feltmeng.idv.tw @ Local */
    /*
    var app_access_token = "243619402408275|HA4e-5_fg95gUcT8sAviXHx2SHg",
        app_id = "243619402408275",
        app_secret = "c35e27572a71efcd3035247c024c9d4b";
    */
    
    
    function constructor(){
        
        return {
            
            /*
             *  REF: https://developers.facebook.com/docs/reference/api/batch/
             */
            batchRequestToFB: function( token, path, data, cb){
                var qs;
                
                if(!token){
                    cb( {error: "access_token is necessary."}, null);
                    return;
                }
                
				//console.log("data"+ JSON.stringify(data));
                qs = {'access_token':token, 'batch':JSON.stringify(data) };
                    
                request({
                    method: 'POST',
                    uri: 'https://graph.facebook.com' + ((path)? path: ''),
                    qs: qs,
                    json: true,
                    //body: {'batch': JSON.stringify(data),},
                    
                }, function(error, response, body){
                    
                    if(error){
                        console.logger("[postOnFB] ", error);
                        cb(error, null);
                        
                    }else if(body.error){
						cb(body.error, null);
					}else{
                        var result = [];
                        //console.log("BODY: " + JSON.stringify(body));
                        for(var i in body){
                            if(body[i]){
                                if(typeof(body[i].body) === 'string'){
									var sub_body = JSON.parse(body[i].body);
									//console.log("sub_body" + sub_body.error);
									if(!sub_body.error)
										result.push(sub_body);
                                }else{

									if(!body[i].error)
										result.push(body[i].body);
								}
                            }
                        }
                        
                        cb(null, result);
                    }
                });
            },
            
            /*
             * REF: http://developers.facebook.com/docs/howtos/login/debugging-access-tokens/
             */
            isTokenValid: function(user_token, cb){
                var qs = null;
                var path = "/debug_token";
                
                if(!user_token){
                    cb( {error: "access_token is necessary."}, null);
                    return;
                }
                    
                qs = { 'input_token': user_token, 'access_token': app_access_token };
                    
                request({
                    method: 'GET',
                    uri:  fb_url + path,
                    qs: qs,
                    json: true,
                    //body: {'batch': JSON.stringify(data),},
                    
                }, function(error, response, body){
                    if(error){
                        logger.error("[isTokenValid] ", error);
                        cb(error, null);
                        
                    }else{
                        FM_LOG("[isTokenValid] " + body.data);
                        cb(null, { is_valid: body.data.is_valid, expires_at: body.data.expires_at });
                    }
                });
            },
            
            // Old-school, keep a while until new one has no problem.
            _extendToken: function(accessToken, callback){

                FM_LOG("[ExtendToken]: ");
                
                var https = require('https');
                var path = "/oauth/access_token?grant_type=fb_exchange_token"
                    + "&client_id=" +  app_id
                    + "&client_secret=" + app_secret
                    + "&fb_exchange_token=" + accessToken
                    + "&scope=email,read_stream,publish_stream";
                    
                var host = "graph.facebook.com",
                    urlOpts = {
                        host: host,
                        port: 443,
                        path: path,
                        method: 'POST'
                    },
                    req = https.request(urlOpts, function(res){
                        res.setEncoding('utf8');
                        res.on('data', function(result){
                        
                            if(typeof(result) != 'string'){
                                FM_LOG("Error: " + result.error.message);
                                
                            }else{
                                FM_LOG("[Got longer lived token]: ");
                                FM_LOG(result);
                                
                                var longerToken = result.substring( result.indexOf("=")+1, result.indexOf("&expires") );
                                var longerExpiresIn = parseInt(result.substring( result.lastIndexOf("=")+1 ), 10);
                                var now = new Date();
                                var data = { "data":{
                                    "accessToken": longerToken,
                                    "expiresIn": now.getTime() + longerExpiresIn * 1000
                                }};
                            
                                callback(null, data);
                            }
                        });                  
                    });
                            
                req.on('error', function(e){
                    logger.error("[Failed to Extend Token]: ", e.message );
                    callback({error: e.message}, null);
                });
                
                req.end();
                
            },
            
            
            extendToken: function(accessToken, cb){
                var qs = null;
                var path = "/oauth/access_token?grant_type=fb_exchange_token";
                
                if(!accessToken){
                    cb( {error: "access_token is necessary."}, null);
                    return;
                }
                    
                qs = { 
                        'client_id': app_id
                        , 'client_secret': app_secret
                        , 'fb_exchange_token': accessToken
                        , 'scope': 'email,read_stream,publish_stream'
                     };
                    
                request({
                    method: 'POST',
                    uri:  fb_url + path,
                    qs: qs,
                    json: true,
                    //body: {'batch': JSON.stringify(data),},
                    
                }, function(error, response, body){
                    if(error){
                        logger.error("[extendToken] ", error);
                        cb(error, null);
                        
                    }else if(body.error){
                        logger.error("[extendToken] ", body.error);
                        cb(body.error, null);
                        
                    }else{
                        FM_LOG("[extendToken] body " + JSON.stringify(body));
                        var longerToken = body.substring( body.indexOf("=")+1, body.indexOf("&expires") );
                        var longerExpiresIn = parseInt(body.substring( body.lastIndexOf("=")+1 ), 10);
                        
                        var data = { "data": {
                                    "accessToken": longerToken,
                                    "expiresIn": Date.now() + longerExpiresIn * 1000
                        }};
                        
                        cb(null, data);
                    }
                });
            },
            
            //TODO: need to verify
            postOnFeed: function(fb_id, message, cb){
                if(!fb_id || !message){
                    cb( {error: "fb_id/message is necessary."}, null );
                    return;
                }
                
                var path = "/"+ fb_id+"/feed";
                var qs = { "access_token": app_access_token, "message": message };
                
                request({
                    method: 'POST',
                    uri: fb_url + path,
                    qs: qs,
                    json: true,
                    
                }, function(error, response, body){
                    if(error){
                        cb(error, null);
                    }else if(body.error){
                        cb(body, null);
                    }else{
                        cb(null, body);
                    }
                });
            },
            
            //TODO: need further implement.  Check FM.api.fbGetCommentReq() in api.js
            getComment: function(cb){
                
            },
            
            //TODO: need further implement.  Check FM.api.fbGetThumbnail() in api.js
            getThumbnail: function(cb){
                
            },
            
            /** TEST */
            _test: function(){
                
                var token = "AAABqPdYntP0BADKwGxVqhtQCaWm3dIJtuzPtWZA2KMRVbuzWqP0TmMQlxZAOwYscjwyv4131iWE0CM9UjIO8E6ZAkvMNmblXj18rLi4EAZDZD";
                this.extendToken( token, function(err, result){
                    if(err)
                        console.log("err: " + JSON.stringify(err));
                    else
                        console.log("result: " + JSON.stringify(result));
                });
            },
        };
    }
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            
            return uInstance;
        }
    };
})();

/* TEST */
//FM.facebookMgr.getInstance()._test();

module.exports = FM.facebookMgr.getInstance();