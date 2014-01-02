﻿var FM = {};
var DEBUG = true, FM_LOG = (DEBUG) ? function(str) {
//	logger.info(str);
} : function(str) {
};

FM.pushMgr = (function() {
	var uInstance = null;
	var db = require('./db.js');
	var messageModel = db.getDocModel("message");

	function constructor() {
	    var async = require('async');
	    var db = require('./db.js');

		/**
		 * Google Cloud Messaging, a.k.a., GCM. GCM sender_ID: 701982981612 API
		 * Key: AIzaSyDn_H-0W251CKUjDCl-EkBLV0GunnWwpZ4
		 */
		function GCM(deviceToken, app, msg) {
			
			var gcm = require('node-gcm');

			var message = new gcm.Message();
			//ondascreen
			var sender_ondascreen = new gcm.Sender(
					'AIzaSyDn_H-0W251CKUjDCl-EkBLV0GunnWwpZ4');
			//wowtaipeiarena
			var sender_wowtaipeiarena = new gcm.Sender(
			        'AIzaSyDwbqzeZwq5pjwMqHrvJNem_oRoX2taeP0');
			var registrationIds = [];

			// At least one required
			registrationIds.push(deviceToken);
			// registrationIds.push('regId2');

			/**
			 * Parameters: message-literal, registrationIds-array, No. of
			 * retries, callback-function
			 */
			switch(app){
            case "wowtaipeiarena":
                // Optional
                message.addData('title', '哇!上小巨蛋');
                message.addData('message', msg);
                message.addData('msgcnt', '1');
                message.collapseKey = 'WowTaipeiArena';
                message.delayWhileIdle = true;
                message.timeToLive = 3;
                
                sender_wowtaipeiarena.send(message, registrationIds, 4, function(result) {
    				FM_LOG("[GCM]send : " + result);
    			});
		        break;
            default:
                // Optional
                message.addData('title', '上大螢幕');
                message.addData('message', msg);
                message.addData('msgcnt', '1');
                message.collapseKey = 'OnDascreen';
                message.delayWhileIdle = true;
                message.timeToLive = 3;
                
                sender_ondascreen.send(message, registrationIds, 4, function(result) {
                    FM_LOG("[GCM]send : " + result);
                });
                break;
            }
		}

		// Apple Push Notification Service.
		function APN(deviceToken, app, msg) {
		    var apns = require('apn');
		    var options;
		    
		    //for WowTaipeiarena app
		    if (systemConfig.USE_PRODUCT_PEM){
                switch(app){
                case "wowtaipeiarena":
                    options = {
                        cert: './apn_pem/wowtaipeiarena/apns-prod-cert.pem',           /* Certificate file path */ /*./apns-prod/apns-prod-cert.pem*/ /*./apns/apns-dev-cert.pem*/
                        certData: null,                             /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
                        key:  './apn_pem/wowtaipeiarena/apns-prod-key-noenc.pem',/* Key file path */ /*./apns-prod/apns-prod-key-noenc.pem*/ /*./apns/apns-dev-key-noenc.pem*/
                        keyData: null,                              /* String or Buffer containing key data, as certData */
                        passphrase: null,                           /* A passphrase for the Key file */
                        ca: null,                                   /* String or Buffer of CA data to use for the TLS connection */
                        gateway: 'gateway.push.apple.com',  /* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */ /* Product- gateway.push.apple.com */
                        port: 2195,                                 /* gateway port */
                        enhanced: true,                             /* enable enhanced format */
                        errorCallback: pushErrorCallback,   /* Callback when error occurs function(err,notification) */
                        cacheLength: 100                            /* Number of notifications to cache for error purposes */
                };
                    break;
                default:
                    options = {
                        cert: './apn_pem/ondascreen/apns-prod-cert.pem',           /* Certificate file path */ /*./apns-prod/apns-prod-cert.pem*/ /*./apns/apns-dev-cert.pem*/
                        certData: null,                             /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
                        key:  './apn_pem/ondascreen/apns-prod-key-noenc.pem',/* Key file path */ /*./apns-prod/apns-prod-key-noenc.pem*/ /*./apns/apns-dev-key-noenc.pem*/
                        keyData: null,                              /* String or Buffer containing key data, as certData */
                        passphrase: null,                           /* A passphrase for the Key file */
                        ca: null,                                   /* String or Buffer of CA data to use for the TLS connection */
                        gateway: 'gateway.push.apple.com',  /* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */ /* Product- gateway.push.apple.com */
                        port: 2195,                                 /* gateway port */
                        enhanced: true,                             /* enable enhanced format */
                        errorCallback: pushErrorCallback,   /* Callback when error occurs function(err,notification) */
                        cacheLength: 100                            /* Number of notifications to cache for error purposes */
                };
                    break;
                }

		    }
		    else { //use the PEM for development
                switch(app){
                case "wowtaipeiarena":
                    options = {
                        cert: './apn_pem/wowtaipeiarena/apns-dev-cert.pem',           /* Certificate file path */ /*./apns-prod/apns-prod-cert.pem*/ /*./apns/apns-dev-cert.pem*/
                        certData: null,                             /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
                        key:  './apn_pem/wowtaipeiarena/apns-dev-key-noenc.pem',/* Key file path */ /*./apns-prod/apns-prod-key-noenc.pem*/ /*./apns/apns-dev-key-noenc.pem*/
                        keyData: null,                              /* String or Buffer containing key data, as certData */
                        passphrase: null,                           /* A passphrase for the Key file */
                        ca: null,                                   /* String or Buffer of CA data to use for the TLS connection */
                        gateway: 'gateway.sandbox.push.apple.com',  /* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */ /* Product- gateway.push.apple.com */
                        port: 2195,                                 /* gateway port */
                        enhanced: true,                             /* enable enhanced format */
                        errorCallback: pushErrorCallback,   /* Callback when error occurs function(err,notification) */
                        cacheLength: 100                            /* Number of notifications to cache for error purposes */
                };
                    break;
                default:
                    options = {
                        cert: './apn_pem/ondascreen/apns-dev-cert.pem',           /* Certificate file path */ /*./apns-prod/apns-prod-cert.pem*/ /*./apns/apns-dev-cert.pem*/
                        certData: null,                             /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
                        key:  './apn_pem/ondascreen/apns-dev-key-noenc.pem',/* Key file path */ /*./apns-prod/apns-prod-key-noenc.pem*/ /*./apns/apns-dev-key-noenc.pem*/
                        keyData: null,                              /* String or Buffer containing key data, as certData */
                        passphrase: null,                           /* A passphrase for the Key file */
                        ca: null,                                   /* String or Buffer of CA data to use for the TLS connection */
                        gateway: 'gateway.sandbox.push.apple.com',  /* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */ /* Product- gateway.push.apple.com */
                        port: 2195,                                 /* gateway port */
                        enhanced: true,                             /* enable enhanced format */
                        errorCallback: pushErrorCallback,   /* Callback when error occurs function(err,notification) */
                        cacheLength: 100                            /* Number of notifications to cache for error purposes */
                };
                    break;
                }


		    }

			var apnsConnection = new apns.Connection(options);
			var device = new apns.Device(deviceToken);
			var note = new apns.Notification();
			note.expiry = Math.floor(Date.now() / 1000) + 3600 * 24; // Expires
																		// 1 day
																		// from
																		// now.
			note.badge = 1;
			note.sound = "ping.aiff";
			note.alert = msg;
			note.payload = {
				'messageFrom' : 'Miix.tv'
			};
			note.device = device;

			FM_LOG("PUSH to Device[" + deviceToken + "]");
			apnsConnection.sendNotification(note);

		}
		
		function pushErrorCallback(err, notification){
		    FM_LOG("[_pushErrorCallback] ");
		    if(err)
		        FM_LOG("[error] " + JSON.stringify(err) );
		    if(notification)
		        FM_LOG("[notification] "+ JSON.stringify(notification) );
		};

		return {

			sendMessageToDevice : function(platform, deviceToken, app, message) {
				FM_LOG("[push_mgr]sendMessageToDevice : ");
				FM_LOG(platform + " : " + deviceToken);
				if (platform == "Android") {
					GCM(deviceToken, app, message);
				} else {
					APN(deviceToken, app, message);
				}

			},
			
            sendMessageToDeviceByMemberId : function(memberId, message, cbOfSendMessageToDeviceByMemberId){
                 var memberDB = require("./member.js");

                 memberDB.getDeviceTokenById(memberId, function(err, result){
                     if(err){
                         FM_LOG('[pus_mgr.sendMessageToDeviceByMemberId] error='+err);
                         cbOfSendMessageToDeviceByMemberId(err, result);
                     }else if(!result){
                         FM_LOG('[pus_mgr.sendMessageToDeviceByMemberId] error = result is null'+err);
                         cbOfSendMessageToDeviceByMemberId(err, result);
                     }else if(result.deviceToken){
                         //createMessage for message center
                         FM.pushMgr.getInstance().createMessage(memberId, message, function(err, res){});
                         
                         FM_LOG("deviceToken Array: " + JSON.stringify(result.deviceToken) );
                         for( var devicePlatform in result.deviceToken){
                        	 
                             var deviceTokenCheck = result.deviceToken[devicePlatform];
                             if(!deviceTokenCheck){
                                 logger.info("[push_mgr]deviceToken is null" + JSON.stringify(result.deviceToken)+"memberId="+memberId  );
                                 FM_LOG("[push_mgr]deviceToken is null" + JSON.stringify(result.deviceToken)+"memberId="+memberId ); 
                             }
                             else if(deviceTokenCheck == "undefined"){
                                 logger.info("[push_mgr]deviceToken is undefined" + JSON.stringify(result.deviceToken)+"memberId="+memberId );
                                 FM_LOG("[push_mgr]deviceToken is undefined" + JSON.stringify(result.deviceToken)+"memberId="+memberId ); 
                             }                            	 
                             else if(deviceTokenCheck != "webapp"){
                            		 FM.pushMgr.getInstance().sendMessageToDevice(devicePlatform, result.deviceToken[devicePlatform], result.app, message);
                             }else{
                                 logger.info("[push_mgr]deviceToken error" + JSON.stringify(result.deviceToken)+"memberId="+memberId );
                                 FM_LOG("[push_mgr]deviceToken error" + JSON.stringify(result.deviceToken)+"memberId="+memberId );
                             }
                         }
                         //console.log("Push Successful");
                         logger.info('[pus_mgr.sendMessageToDeviceByMemberId] Push Successful result.deviceToken= '+result.deviceToken);
                         cbOfSendMessageToDeviceByMemberId(err, "Push Successful");
                     }else{
                         FM_LOG('[pus_mgr.sendMessageToDeviceByMemberId] error = deviceToken is null ;'+result);
                         logger.info('[pus_mgr.sendMessageToDeviceByMemberId] error = deviceToken is null ;result= '+result);
                         cbOfSendMessageToDeviceByMemberId(err, result);
                     }
                     
                 });

            },

			createMessage : function(memberId,  message, cbOfCreateMessage){
				var jsonOfNewMessage = {
					content: message,
					ownerId: {_id: memberId},
					showInCenter: false
				}
				
				var newMessage = new messageModel(jsonOfNewMessage);
				newMessage.save(function(err, res){
					if(!err) {
						logger.info('[createMessage] done ,memberId: ', memberId);
						cbOfCreateMessage(null, "done");
					}
					else{
						logger.error('[createMessage] error', err);
						cbOfCreateMessage("new message save to db error: "+err, null);
					}
				});
			
			},
			
			updateMessage : function(messageId,  vjson, cbOfUpdateMessage){
				
				db.updateAdoc(messageModel, messageId, vjson, function(err, result){
					if(!err) {
						logger.info('[updateMessage_updateAdoc] done ,messageId: ', messageId);
						cbOfUpdateMessage(null,'done');
					}
					else{
						logger.error('[updateMessage_updateAdoc] error: ', err);
						cbOfUpdateMessage(err,null);
					}
				});
			
			},
			
            sendMessageToAllMemberByApp : function(message, app, cbOfSendMessageToDeviceByMemberId){
                var memberModel = db.getDocModel("member");
                var condition = null;
                if(app)
                    condition = {"app": app};
                
                var iteratorSendMessageToDeviceByMemberId = function(data, cbOfIteratorSendMessageToDeviceByMemberId){
                   //console.log(data._id, message);
                   logger.info("iteratorSendMessageToDeviceByMemberId member_id  ="+ data._id+',message='+ message);
                    FM.pushMgr.getInstance().sendMessageToDeviceByMemberId( data._id, message, function(err, result){
                        if(!err){
                            logger.info("iteratorSendMessageToDeviceByMemberId result"+ result);
                            cbOfIteratorSendMessageToDeviceByMemberId(null, result);
                        }else{
                            logger.info("iteratorSendMessageToDeviceByMemberId err="+err);
                            cbOfIteratorSendMessageToDeviceByMemberId(null, err);
                        }
                        
                    });
                };
                
                async.waterfall([
                              function(callback1){
                                  memberModel.find(condition).exec(function(err, memberList){
                                      if(!err){
                                          callback1(null, memberList);
                                      }else{
                                          callback1(err, null);
                                      }
                                  });
                              },
                              function(memberList, callback2){
                                 // console.log(memberList.length);
                                  logger.info("sendMessageToAllMemberByApp memberList.length"+ memberList.length);
                                  async.eachSeries(memberList, iteratorSendMessageToDeviceByMemberId, function(errOfEachSeries){
                                      //console.log(errOfEachSeries);
                                      if (!errOfEachSeries) {
                                          callback2(null, "done");
                                      }
                                      else{
                                          callback2(errOfEachSeries, null);
                                      }
                                  });
                              }
                              ],
                              function(err, results){
                                //console.log(err, results);
                                if(!err){
                                    logger.info("sendMessageToAllMemberByApp results "+results);
                                    cbOfSendMessageToDeviceByMemberId("done");
                                }else{
                                    logger.info("sendMessageToAllMemberByApp err "+err);
                                    cbOfSendMessageToDeviceByMemberId(err);
                                }
                              });

           },
			
            /** TEST */
            _testkaiser: function(){
                var userNo = 1234;
                var memberId = '52a0351ff07b1cec1000000a';
                var message = "★哇！聖誕祝福來囉★ 哇！上小巨蛋，提供聖誕特別模板， 今年聖誕，給朋友史上最大的聖誕祝福吧！";
                this.sendMessageToDeviceByMemberId( memberId, message, function(err, result){
                        //console.log(err, result);
                });
            },
		};// end return
	}

	return {
		getInstance : function() {
			if (!uInstance) {
				uInstance = constructor();
			}

			return uInstance;
		}
	};
})();

/* TEST */
// FM.pushMgr.getInstance()._testkaiser();
module.exports = FM.pushMgr.getInstance();