var ConnectFacebook = {};
var remoteUrl = "http://jean.ondascreen.com/demo";
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
	async.series([
	              function(callback){
	            	  FB.login(function(response){
	            	  	  if(response.authResponse){
	            	  		  accessToken = response.authResponse.accessToken;
	            	  		  expiresIn = Date.now() + response.authResponse.expiresIn;
	            	  		  userID = response.authResponse.userID;
	            	  		  callback(null);
	            	  	  }else{
	            	  		  console.log("logIn :");
	            	  		  callback("Log In not successfully");
	            	  	  }
	            	  	
	            	    }, {scope: "read_stream,publish_stream,user_location,email,user_likes,publish_checkins"});
	            	  
	              },
	              function(callback){
	            		FB.api('/me', function(response) {
	            			console.dir(response);
	            			data = {"authResponse": {
	            					"appGenre":"wowtaipeiarena", 
	            					"userID": userID,
	            					"userName": response.name,
	            					"email": response.email,
	            					"accessToken": accessToken,
	            					"expiresIn":  expiresIn,
	            					"timestamp": Date.now()
	            				}
	            			};

	            	  		localStorage.fbId = userID;
	            	  		localStorage.name = response.name;
	            	  		var url = "http://jean.ondascreen.com" + "/members/fb_info";
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
	            	  var url = "http://jean.ondascreen.com/members/" + localStorage.fbId + "/thumbnail";
	            	  $.ajax({
	      					type : 'GET',
	      					url : url,
	      					async : true,
	      					success : function(res){
	      						if(res){
	      							localStorage.profilePhoto = res;
	      							window.location = remoteUrl + "/template.html";
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
						
				});

};

