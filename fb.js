/*
 * Gabriel
 */
 

/*
//  Load the SDK Asynchronously
(function(d){

    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if(d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

//  Initialization must be done after SDK Loading.
window.fbAsyncInit = function(){
	FB.init({
		appId  : '243619402408275', 
		channelUrl: '//'+ window.location.hostname+'/gab_test/channel.html',
		status : true,  //check login status 
		cookie : true,  //enable cookies to allow the server to access the session.
		xfbml  : true   //parse XFBML
	});
}
*/
logger.info("Loading fb.js");

var FMDB = require('./db');

var FB = null;
function loadFBObject(fb){
    logger.info("fb.js loadFBObject");
    FB = fb;
    
    //  Listen to and handle auth.statusChange events to take a fresh AccessToken.
    FB.Event.subscribe('auth.statusChange', function(response){
        var fbid = null,
            accessToken = null;
            
        if(response.authResponse){
            var rsp = response.authResponse;
            fbid = rsp.userID;
            accessToken = rsp.accessToken;
            
            FB.api('/me', function(me){
                if(me.name){
                    document.getElementById('auth-displayname').innerHTML = me.name;
                }
            });
            document.getElementById('auth-loggedout').style.display = 'none';
            document.getElementById('auth-loggedin').style.display = 'block';
            
        }else{
            document.getElementById('auth-loggedout').style.display = 'block';
            document.getElementById('auth-loggedin').style.display = 'none';
        }
        
        logger.info("auth.statusChang: " + JSON.stringify(response));
    });

    //  responed to click on the login and logout links.
    document.getElementById('auth-loginlink').addEventListener('click', function(){
        FB.login();
    });
    document.getElementById('auth-logoutlink').addEventListener('click', function(){
        FB.logout();
    });
    
    FB.getLoginStatus(function(response){
        var fbid = null,
            accessToken = null;
        
        if(response.status === "connected") {
            /*
             * The user is logged in and has authenticated your app, and response.authResponse supplies
             * the user's ID, a valid access token, a signed request, and the time the access token 
             * and signed request each expire
             */
            fbid = response.authResponse.userID;
            accessToken = response.authResponse.accessToken;
            logger.info("User "+ fbid + " is logged and has authenticated APP with token: " + accessToken);
            //post("/1609171038/feed", "http://vimeo.com/44338220", cb);
            like("1609171038_452124074827971", cb);
                    
        }else if (response.status === "not_authorized"){
        
            //  The user is logged in Facebook, but has not authenticated your app
            logger.info('User is logged without authenticaing APP.');
            FB.login(function(response){
                if(response.authResponse){
                logger.info('Welcome! Fetching your information....');
                    FB.api('/me', function(response){
                        logger.info('Good to see you, ' + response.name+'.');
                    });
                }}, {scope: 'read_stream, publish_stream'}
            );
            
        }else{
            //  The user isn't logged in to Facebook.
            logger.info('User isn\'t logged.');
            FB.login(function(response){
                if (response.authResponse) {
                    logger.info('Welcome! Fetching your information....');
                            FB.api('/me', function(response){
                                logger.info('Good to see you, '+response.name+'.');
                            });
                } else {
                    logger.info('User cancelled login or did not fully authrize.');
                }
            }, {scope: 'read_stream, publish_stream'});
        }
    });
}

function cb(response){
    var postid = null;
    if(!response || response.error){
        logger.info("Like Error: " + JSON.stringify(response.error));
    }else{
        postid = response.id;
        logger.info("Like Succeed: " + JSON.stringify(response));
    }
}

function post(where, what, cb){
    /* where = /PROFILE_ID/ or /OBJECT_ID/
     * what = 
     * {    "message": "",
     *      "picture": "",
     *         "link": "",
     *         "name": "",
     *      "caption": "",
     *  "description": "",
     *       "source": "",
     *        "place": "",
     *         "tags": "" };
     */
    FB.api(where, "post", what, cb);
}

function like(object_id, cb){
    FB.api(object_id + "/likes", "post", cb);
}

function postShare(){
    FB.api('/me/glo_feltmeng:share', 'post', { link: 'http://www.feltmeng.com/gab_test/link_obj.html' }, 
        function(response){
		    if(!response || response.error){
			    alert('Share Link Error ['+response.error.message+']');
			}else{
			    alert('Share Link Sucessfully! ID: '+response.id);
			}
		}
	);
}	


/*
FB.api("/oauth/access_token?client_id=243619402408275&client_secret=c35e27572a71efcd3035247c024c9d4b&grant_type=client_credentials&response_type=token",
    function(response){
        if(!response || response.error){
            logger.info('Request AppAccessToken Error: '+ response.error.message+' type: '+response.error.type);
            logger.info('Response: '+response[0].access_token+' '+response[1].access_token);
        
        }else{
            logger.info('AppAccessToken: '+ response);
        }
    }
);
*/		



/*
 * UserToken AAADdkgZCw4VMBAJoZAas0u1zR92X7vOpZBY456gjotiTcNmeLr6RDXgpfmV1mPc3kSy7ZBEAGQ2rRhiiEvxuMhLceuHDaU4Nx1lEl32ZBqtLhEGyFsHVq
 * AppToken 243619402408275|HA4e-5_fg95gUcT8sAviXHx2SHg
 */