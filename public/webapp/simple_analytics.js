/*
var recordUserAction = function( userAction, forceStoreRecordsLocally ){
    
    var aAnalyticsRecord = {
        action: userAction,
        time: (new Date()).getTime(),
        user_id: localStorage._id,
        user_fb_id: localStorage.fb_userID,
        user_fb_name: localStorage.fb_name,
        platform: device.platform,
        os_version: device.version,
        device_uuid: device.uuid
    };
    
    var analyticsRecordsToSend;
    if ( localStorage.unsentAnalyticsRecords ) {
        analyticsRecordsToSend = JSON.parse(localStorage.unsentAnalyticsRecords);
    }
    else {
        analyticsRecordsToSend = new Array();
    }
    analyticsRecordsToSend.push(aAnalyticsRecord);
    
    var analyticsObj = new Object();
    analyticsObj.records = analyticsRecordsToSend;
    analyticsObj.sendTime = (new Date()).getTime();

    if (!forceStoreRecordsLocally){ */
        /*
        $.post(starServerURL+'/record_user_action', analyticsObj, function(result){
            if ( !result.err ) {
               delete localStorage.unsentAnalyticsRecords;
               delete analyticsObj.records;
               delete analyticsRecordsToSend;
               delete analyticsObj;
               console.log("Successfully reported the action "+userAction);
            }
        })
        .error(function() {
           localStorage.unsentAnalyticsRecords = JSON.stringify(analyticsRecordsToSend);
           console.log("Locally saved the action "+userAction);
        });
         */
   /* }
    else {
        localStorage.unsentAnalyticsRecords = JSON.stringify(analyticsRecordsToSend);
        console.log("Forced locally saved the action "+userAction);        
    }
    
};*/
