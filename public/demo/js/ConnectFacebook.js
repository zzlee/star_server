var ConnectFacebook = {};
//domainUrl;
//var remoteUrl = serverUrl;
var accessToken = null;
var expiresIn = null;
var userID = null;
ConnectFacebook.init = function(){
	window.fbAsyncInit = function() {
		FB.init({
		    	appId      : '154438938098663',	//WowTaipeiArena FB ID
		    	status     : true, // check login status
		    	cookie     : true, // enable cookies to allow the server to access the session
		    	xfbml      : true  // parse XFBML
		  	});
	};
	// Load the SDK asynchronously
	(function(d){
	   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	   if (d.getElementById(id)) {return;}
	   js = d.createElement('script'); js.id = id; js.async = true;
	   js.src = "//connect.facebook.net/zh_TW/all.js";
	   ref.parentNode.insertBefore(js, ref);
	}(document));
	
};

ConnectFacebook.logIn = function(){
	//Check user's mobile device
	if(navigator.userAgent.match(/iPhone|iPad|iPod/i)){
		var client_id = "154438938098663";
		var redirect_url = [serverUrl +"/welcome.html"];
		var authorize_url  = "https://graph.facebook.com/oauth/authorize?";
			authorize_url += "client_id=" + client_id;
			authorize_url += "&redirect_uri=" + redirect_url;
			authorize_url += "&display="+ "touch";
			authorize_url += "&type=user_agent";
			authorize_url += "&scope=read_stream,publish_stream,user_location,email,user_likes,publish_checkins";
			window.open(authorize_url, "_self");
	}else{
		async.series([
	              function(callback){
	            	  FB.login(function(response){
	            	  	  if(response.authResponse){
	            	  		  accessToken = response.authResponse.accessToken;
	            	  		  expiresIn = Date.now() + response.authResponse.expiresIn;
	            	  		  userID = response.authResponse.userID;
	            	  		  callback(null);
	            	  	  }else{
	            	  		  callback("Log In not successfully");
	            	  	  }
	            	  	
	            	    }, {scope: "read_stream,publish_stream,user_location,email,user_likes,publish_checkins"});
	            	  
	              },
	              function(callback){
	            		FB.api('/me', function(response) {
//	            			console.dir(response);
	            			data = {"authResponse": {
	            					"appGenre":"waterlandsecuries", 
	            					"userID": userID,
	            					"userName": response.name,
	            					"email": response.email,
	            					"accessToken": accessToken,
	            					"expiresIn":  expiresIn,
	            					"devicePlatform" : "WLS",
	            					"deviceToken": "webapp", //Water Land Securities
	            					"timestamp": Date.now()
	            				}
	            			};

	            	  		localStorage.fbId = userID;
	            	  		localStorage.name = response.name;
	            	  		var url = domainUrl + "/members/fb_info";
	            			$.post(url, data, function(response){
	            				if(response.data){
	            					localStorage._id = response.data._id;
	            					localStorage.miixToken = response.data.miixToken;
//	            					console.log("localStorage" + JSON.stringify(localStorage));
	            					callback(null);
	            				}else{
	            					callback("[ConnectFacebook.logIn]Get facebook infor falied");
	            				}
	            			});//End of post
	            		});//End of FB.api
	            	  
	              },
	              function(callback){
	            	  //Get user's fb profile photo
	            	  var url = domainUrl + "/members/" + localStorage.fbId + "/thumbnail";
	            	  $.ajax({
	      					type : 'GET',
	      					url : url,
	      					async : true,
	      					success : function(res){
	      						if(res){
	      							localStorage.profilePhoto = res;
	      							window.location = serverUrl + "/template.html";
	      							callback(null);
	      						}else{
	      							callback("Get facebook data failed");
	      						}
	      					},
	      					error : function(jqXHR, textStatus, errorThrown ){
	      						callback("Get facebook data failed");
	      					}
	      				});
	              }],
	              function(err){
					if(err){
						alert('登入時發生錯誤，請重新再試');
					}
						
		});//End of async
	}//End of If

};


ConnectFacebook.redirectLogIn = function(){
	async.series([
	              function(callback){
	            	  //Get facebook access token
	            	  var getUrlHash = location.hash.split("#");
	            	  if(getUrlHash){
	            		  
	            		  accessToken = getUrlHash[1].split("&")[0].split("=")[1];
	            		  expiresIn = Date.now() + parseInt(getUrlHash[1].split("&")[1].split("=")[1]);
	          			
	            		  var url = "https://graph.facebook.com/me?access_token=" + accessToken;
	            		  var req = new XMLHttpRequest();
	            		  req.onreadystatechange = function(e){
	            			  if(req.readyState == 4 && req.status == 200){
	          			            
	            				  var response = JSON.parse(e.target.responseText);
	            				  console.log("[fb_profile]: ");
	            				  console.dir(JSON.stringify(response));
	            				  localStorage.fbId = response.id;
	            				  localStorage.name = response.name;
	            				  if(response.email){
	            					  localStorage.email = response.email;
	            					  data = {"authResponse": {
	            	    					"appGenre":"wowtaipeiarena", 
	            	    					"userID": localStorage.fbId,
	            	    					"userName": response.name,
	            	    					"email": response.email,
	            	    					"accessToken": accessToken,
	            	    					"expiresIn":  expiresIn,
	            	    					"devicePlatform" : "WLS",
	            	    					"deviceToken": "webapp", //Water Land Securities
	            	    					"timestamp": Date.now()
	            	    					}
	            	    				};
	            		    	  		var url = domainUrl + "/members/fb_info";
	            		    			$.post(url, data, function(response){
	            		    				if(response.data){
	            		    					localStorage._id = response.data._id;
	            		    					localStorage.miixToken = response.data.miixToken;
	            		    					console.log("localStorage" + JSON.stringify(localStorage));
	            		    					callback(null);
	            		    					//window.open(serverUrl + "/template.html", "_self");
	            		    				}else{
	            		    					callback("[ConnectFacebook.logIn]Get facebook infor falied");
	            		    				}
	            		    			});//End of post
	            				  }
	            				  
	            			  }
	          			        //console.log(e);
	            		  };
	          			
	            		  req.open("GET", url);
	            		  req.send({"timestamp": Date.now()});
	            		  //callback(null);
	            	  }//End of If
	              },
	              function(callback){
	            	  //Get user's fb profile photo
	            	  var url = domainUrl + "/members/" + localStorage.fbId + "/thumbnail";
	            	  $.ajax({
	      					type : 'GET',
	      					url : url,
	      					async : true,
	      					success : function(res){
	      						if(res){
	      							localStorage.profilePhoto = res;
	      							window.location = serverUrl + "/template.html";
	      							callback(null);
//	      						}else{
//	      							callback("Get facebook data failed");
	      						}
	      					},
	      					error : function(jqXHR, textStatus, errorThrown ){
	      						callback("Get facebook data failed");
	      					}
	      				});
	              }
	              ],function(err){
						if(err){
//							alert("登入Facebook時發生錯誤！");
							alert(err);
						}
			
				});
};
