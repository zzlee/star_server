var FM = {};
var DEBUG = true, FM_LOG = (DEBUG) ? function(str) {
	logger.info(str);
} : function(str) {
};

FM.pushMgr = (function() {
	var uInstance = null;

	function constructor() {
		/**
		 * Google Cloud Messaging, a.k.a., GCM. GCM sender_ID: 701982981612 API
		 * Key: AIzaSyDn_H-0W251CKUjDCl-EkBLV0GunnWwpZ4
		 */
		function GCM(deviceToken, msg) {
			
			var gcm = require('node-gcm');

			var message = new gcm.Message();
			var sender = new gcm.Sender(
					'AIzaSyDn_H-0W251CKUjDCl-EkBLV0GunnWwpZ4');
			var registrationIds = [];

			// Optional
			message.addData('title', '登大螢幕');
			message.addData('message', msg);
			message.addData('msgcnt', '1');
			message.collapseKey = 'OnDascreen';
			message.delayWhileIdle = true;
			message.timeToLive = 3;

			// At least one required
			registrationIds.push(deviceToken);
			// registrationIds.push('regId2');

			/**
			 * Parameters: message-literal, registrationIds-array, No. of
			 * retries, callback-function
			 */
			sender.send(message, registrationIds, 4, function(result) {
				FM_LOG(result);
			});
		}

		// Apple Push Notification Service.
		function APN(deviceToken, msg) {
		    var apns = require('apn');
		    var options = {
		            cert: './apns/apns-dev-cert.pem',  			/* Certificate file path */ /*./apns-prod/apns-prod-cert.pem*/ /*./apns/apns-dev-cert.pem*/
		            certData: null,                   			/* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
		            key:  './apns/apns-dev-key-noenc.pem',/* Key file path */ /*./apns-prod/apns-prod-key-noenc.pem*/ /*./apns/apns-dev-key-noenc.pem*/
		            keyData: null,                    			/* String or Buffer containing key data, as certData */
		            passphrase: null,                 			/* A passphrase for the Key file */
		            ca: null,                         			/* String or Buffer of CA data to use for the TLS connection */
		            gateway: 'gateway.sandbox.push.apple.com',	/* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */ /* Product- gateway.push.apple.com */
		            port: 2195,                   				/* gateway port */
		            enhanced: true,               				/* enable enhanced format */
		            errorCallback: pushErrorCallback,	/* Callback when error occurs function(err,notification) */
		            cacheLength: 100              				/* Number of notifications to cache for error purposes */
		    };

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

			sendMessageToDevice : function(platform, deviceToken, message) {
				FM_LOG("[push_mgr]sendMessageToDevice : ");
				FM_LOG(platform + " : " + deviceToken);
				if (platform == "Android") {
					GCM(deviceToken, message);
				} else {
					APN(deviceToken, message);
				}

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
// FM.smsMgr.getInstance()._testkaiser();
module.exports = FM.pushMgr.getInstance();