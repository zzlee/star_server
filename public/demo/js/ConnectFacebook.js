var ConnectFacebook = {};
var remoteUrl = "http://jean.ondascreen.com/demo/";
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
	            	  		  console.log("logIn success ");
//	            	  		  console.dir(response);
	            	  		  accessToken = response.authResponse.accessToken;
	            	  		  expiresIn = Date.now() + response.authResponse.expiresIn;
	            	  		  userID = response.authResponse.userID;
//	            	  		window.location = remoteUrl + "template.html?" + 
//	            	  				"accessToken=" + accessToken + "&" +
//	            	  				"expireIn=" + expiresIn + "&" +
//	            	  				"userId=" + userID;
	            	  		  callback(null);
	            	  	  }else{
	            	  		  console.log("logIn :");
	            	  		  console.dir(response);
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

	            			console.log(JSON.stringify(data));
	            	  		window.location = remoteUrl + "template.html?" + 
//        	  				"accessToken=" + accessToken + "&" +
//        	  				"expireIn=" + expiresIn + "&" +
//        	  				"userId=" + userID;
	            	  		localStorage.fbId = userID;
//	            			$.post(url, data, function(response){
//	                     
//	            				if(response.data){
//	            					console.log(response.data);
//	            					localStorage._id = response.data._id;
//	            					localStorage.miixToken = response.data.miixToken;
//	            					localStorage.fb_accessToken = response.data.accessToken;
//	            					localStorage.verified = (response.data.verified) ? response.data.verified : 'false';
//	            					FM_LOG("localStorage" + JSON.stringify(localStorage));
//	                     
//	            				}else{
//	            					
//	            				}
//	            			});//End of post
	            		});//End of FB.api
	            	  callback(null);
	              }],
	              function(err){
					if(err){
						
					}else{
						
					}
				});
	//});

};

