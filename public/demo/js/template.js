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
                	    $.ajax( url+"/miix/web/ugcs_info/" + ugcProjectId, {
                	        type: "PUT",
                	        data: {
//                	            imgBase64: reultURI,
//                	            imgDoohPreviewBase64: doohPreviewResultURI,
                	            ownerId: ugcInfo.ownerId._id,
                	            ownerFbUserId: ugcInfo.ownerId.fbUserId,
                	            contentGenre: "mood",
                	            title: ugcInfo.title,
//                	            customizableObjects: localStorage.customizableObjects,
                	            miixToken: localStorage.miixToken,
                	            time: (new Date()).getTime()
                	        },
                	        success: function(data, textStatus, jqXHR ){
//                	        	console.log("Upload result image UGC to server");
//                	        	console.log("Upload result image UGC to server");
                	        	async.series([
                	        	              function(callback_vip){
                	        	            	  var setting_updateVIPinUGC = {
                	                                        type: "PUT",
                	                                        cache: false,
                	                                        data:{projectId:ugcProjectId},
                	                                        success: function(data, textStatus, jqXHR ){
                	                                        	console.log('update the vip field in ugc done');
                	                                        	callback_vip(null);
                	                                        },
                	                                        error: function(jqXHR, textStatus, errorThrown){
                	                                        	callback_vip("setting_updateVIPinUGC " + errorThrown);
                	                                        }                       
                	                                };
                	                                if(localStorage.VIPCodeId){
                	                                	 $.ajax(domainUrl + "/miix/updateVIPinUGC", setting_updateVIPinUGC);
                	                                }else{
                	                                	callback_vip(null);
                	                                }
                	        	              },
                	        	              function(callback_vip){
                	        	            	  var setting_updateVIP = {
                	                                        type: "PUT",
                	                                        cache: false,
                	                                        data:{_id:localStorage.VIPCodeId},
                	                                        success: function(data, textStatus, jqXHR ){
                	                                        	delete localStorage.VIPCodeId;
                	                                        	console.log('update the vip collection done');
                	                                        	callback_vip(null);
                	                                        },
                	                                        error: function(jqXHR, textStatus, errorThrown){
                	                                        	callback_vip("setting_updateVIP " + errorThrown);
                	                                        }                       
                	                                };
                	                                if(localStorage.VIPCodeId){
                	                                	 $.ajax(domainUrl + "/miix/updateVIPStatus", setting_updateVIP);
                	                                }else{
                	                                	callback_vip(null);
                	                                }
                	        	              }
                	        	          ],
                	        	          // optional callback
                	        	          function(err, results){
                	        		             if(!err){
                	        		            	 
                	        		            	 callback(null);
                	        		             }else{
                	        		            	 callback(null);
                	        		             }
                	        	          });
                	        },
                	        error: function(jqXHR, textStatus, errorThrown){
                	            callback("Failed to upload image UGC to server: "+errorThrown);
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
                                      alert("投稿成功！！" + aPush.content.substring(0,14) + "排定時段後，你會收到facebook預告，通知播出日期時間。");
                                      //Let DB know user read the msg
                                      $.ajax(url + "/miix/message/" + aPush._id ,settings_push_after_confirm);
                                      window.location = remotesite + '/template.html';
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
    					}
    	
    			});//end of async.series
   
};

