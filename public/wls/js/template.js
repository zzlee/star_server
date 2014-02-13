var template = {};
var remotesite = serverUrl;
var url = domainUrl;


template.uploadToServer = function(){
	var ugcInfo = {
			ownerId:{
				_id : localStorage._id,
				fbUserId : localStorage.fbId
			},
			contentGenre : localStorage.selectedTemplate,
			title : "today'smood"
	};
    var ugcProjectId = localStorage.projectId;
    async.series([
                  function(callback){
                	  //upload result image UGC to server
                	    //$.ajax( url+"/miix/web/ugcs_info/" + ugcProjectId, {
						$.ajax( url + "/miix/base64_image_ugcs/" + ugcProjectId, {
                	        type: "PUT",
                	        data: {
                	            imgBase64: localStorage.longphotoUrl ,
                	            imgDoohPreviewBase64: localStorage.doohPreviewUrl,
                	            ownerId: ugcInfo.ownerId._id,
                	            ownerFbUserId: ugcInfo.ownerId.fbUserId,
                	            contentGenre: "wls",
                	            title: ugcInfo.title,
//                	            customizableObjects: localStorage.customizableObjects,
								customizableObjects: localStorage.customizableObjects,
                	            miixToken: localStorage.miixToken,
                	            time: (new Date()).getTime()
                	        },
                	        success: function(data, textStatus, jqXHR ){
                	        	console.log("Upload result image UGC to server");
//                	        	console.log("Upload result image UGC to server");
								callback(null);

                	        },
                	        error: function(jqXHR, textStatus, errorThrown){
                	            callback("Failed to upload image UGC to server: " + errorThrown);
                	        }
                	    });
                  },
                  function(callback){
	                  var settings_push_after_confirm = {
	                          type: "PUT",
	                          cache: false,
	                          asycn:false,
	                          data:{ 
	                              miixToken: localStorage.miixToken,
	                              vjson: {
	                                  read: true
	                              }
	                          },
	                          success: function(data, textStatus, jqXHR ){
	                        	  window.location = remotesite + '/template.html';
	                        	  //Do nothing
	                          },
	                          error: function(jqXHR, textStatus, errorThrown){
	                        	  //Do Nothing
	                          }                       
	                  };
	                  var settings_push_center = {
	                          type: "GET",
	                          cache: false,
	                          data:{ miixToken: localStorage.miixToken },
	                          success: function(data, textStatus, jqXHR ){
	                              var iterator = function(aPush){
//	                            	  console.log('push msg: ' + aPush.content);
										ga('send', 'event', 'button', 'click', localStorage.selectedTemplate);
                                      alert("投稿成功！！" + aPush.content.substring(0,14) + "排定時段後，你會收到facebook預告，通知播出日期時間。");
                                      //Let DB know user read the msg
                                      $.ajax(url + "/miix/message/" + aPush._id ,settings_push_after_confirm);
	                              };
	                              async.eachSeries(data, iterator, function(err, results){
	                                  if (!err){
//	                                	  console.log("async.eachSeries no error");
	                                      callback(null);
	                                  }
	                                  else {
	                                	  callback('Failed to change the read value of db to true: '+err);
	                                  }
	                              });
	                          },
	                          error: function(jqXHR, textStatus, errorThrown){
	                              callback("settings_push_center " + errorThrown);
	                          }                       
	                  };
	                  
	                  $.ajax(url + "/miix/members/" + localStorage._id + "/message", settings_push_center);
                  }],
                  function(err){
    					if(err){
    						alert(err);
    					}else{
							localStorage.projectId = null;
						}
    	
    			});//end of async.series
   
};

