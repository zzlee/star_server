/*
 * Gabriel
 */
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log("[FM] " + str); } : function(str){} ; 

 //  Load the Facebook JSSDK Asynchronously
        (function(d){
        
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if(d.getElementById(id)) {return;}
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/zh_TW/all.js";
            ref.parentNode.insertBefore(js, ref);
            console.log("<------------------ Loading the Facebook JSSDK Asynchronously ------------------>");
        }(document));
        
        //  Initialization must be done after SDK Loading.
        window.fbAsyncInit = function(){
            FB.init({
                appId  : '116813818475773', //  116813818475773 for ShowOff; 243619402408275 for Watasi
                channelUrl: '//'+ window.location.hostname+'/gab_test/channel.html',
                status : true,  //check login status 
                cookie : true,  //enable cookies to allow the server to access the session.
                xfbml  : true   //parse XFBML
            });
            
            console.log("before loadFBObject()");
            
            //  Listen to and handle auth.statusChange events to take a fresh AccessToken.
            FB.Event.subscribe('auth.statusChange', function(response){
                
                if(response.authResponse){
                    var authRes = response.authResponse;
                    console.log("\nGet Permission from FB_User.");
                    FB.api('/me', function(me){
                        if(me.name){
                            console.log("\nFB_User ["+ me.name + "] authorizes Token: " + authRes.accessToken);
                            
                        }
                    });
                    
                    
                    //  Request Longer Lived AccessTtoken to FB.   
                    $.post("https://graph.facebook.com/oauth/access_token",
                        {
                            grant_type: "fb_exchange_token",
                            client_id: "116813818475773",
                            client_secret: "b8f94311a712b98531b292165884124a",
                            fb_exchange_token: authRes.accessToken,
                            scope: "read_stream, publish_stream"
                        },
                        function(result){
                            
                            console.log("\nGot longer lived token: ");
                            console.log(result);
                            var longerToken = result.substring( result.indexOf("=")+1, result.indexOf("&expires") );
                            var longerExpiresIn = parseInt(result.substring( result.lastIndexOf("=")+1 ), 10);
                            var now = new Date();
                            authRes.accessToken = longerToken;
                            authRes.expiresIn = now.getTime() + longerExpiresIn*1000;
                            
                            //  Send FB_id and Token to Server.
                            var url = "http://www.feltmeng.idv.tw/api/signupwithFB";
                            var data = {"authResponse": authRes};
                            
                            $.post(url, data, function(res){
                                console.log("[SignUp with FB] ");
                                console.log(res);
                                
                            });
                            
                            
                            fmfb = new FMFB( authRes.userID, authRes.accessToken );
                            console.log( authRes.userID + " auth.statusChange: ");
                            console.log(authRes);
                            
                            window.close();
                        }
                    );
                    
                }else{
                
                    FM_LOG("\nDoesn't Get Permission from FB_User.");
                    FM_LOG("Response: " + JSON.stringify(response) );
                    var url = "http://www.feltmeng.idv.tw/api/signupwithFB";
                    var fail = {"message": "Doesn't Get Permission from FB_User."};
                    var data = {"fail": fail};
                            
                    $.post(url, data, function(res){
                        FM_LOG("[SignUp with FB] ");
                        logger.info(res);
                                
                    });
                }
                
                FM_LOG("Facebook auth.statusChang: ");
                logger.info(response);
            });
            
            FMFB.login();
        };  // End of window.fbAsyncInit

FM_LOG("Loaded fb.js");



var fmfb = null;

var postOn = function(){

    var what = {
        method: "feed",
        link: "http://www.youtube.com/watch?v=bbC4XG-L1sE",
    };
    
    if(fmfb)
        FB.ui(what, function(res){
        
            if(!res || res.error){
                FM_LOG('postOnMyWall: '+ res.error.message +' type: '+res.error.type);
                FM_LOG('Response: ' + JSON.stringify(res) );
            
            }else{
                FM_LOG('\n postOnMyWall: '+ res);
            }
          
        });
};


var FMFB = (function(){
   
    // Private Static attributes.
    var statusHandler = null;
        
    /* Private Static method. */
    
    
    return function(id, token){    // return Constructor
    
        // Private attributes.
        var fbid = id,
            accessToken = token;
        
        // Private method.
        
        /* Privileged methods. */
        this.postOn = function(where, what, cb){
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
            FB.api("/"+where+"/feed", "post", what, cb);
        };
        
        this.postOnMyWall = function(what, cb){
            FB.api("/"+ fbid +"/feed", "post", what, cb);
        };
        
        this.like = function(what, cb){
            FB.api(what+"/likes", "post", cb);
        };
        
    };  // End of FMFB Constructor
})();

FMFB.getLoginStatus = function(callback){
    FB.getLoginStatus(callback);
};


FMFB.setStatusHandler = function(handler){

    if(!FMFB.statusHandler)
        FMFB.statusHandler = handler;
};


/* Public static method. Non-Privileged */
FMFB.login = function(){
        
    FB.getLoginStatus( function(response){
        
        if(FMFB.statusHandler){
            FMFB.statusHandler.send(response);
            FMFB.statusHandler = null;
        }
        
        if(response.status === "connected") {
            /*
             * The user is logged in and has authenticated your app, and response.authResponse supplies
             * the user's ID, a valid access token, a signed request, and the time the access token 
             * and signed request each expire
             */
            FM_LOG("\nUser connected!");
            logger.info(response);
            
            //postOn("/1609171038/feed", "http://vimeo.com/44338220", cb);
            //like("1609171038_452124074827971", cb);
            
            
        }else if (response.status === "not_authorized"){
        
            //  The user is logged in Facebook, but has not authenticated your app
            FM_LOG('User is logged without authenticaing APP.');
            
            FB.login(function(response){
            
                if(response.authResponse){
                
                FM_LOG('Welcome! Fetching your information....');
                    FB.api('/me', function(response){
                        FM_LOG('\nGood to see you, ' + response.name+'.');
                        logger.info(response);
                    });
                    
                } }, {scope: 'read_stream, publish_stream'}
            );
            
        }else{
            //  The user isn't logged in to Facebook.
            FM_LOG("User hasn't logged.");
            
            FB.login(function(response){
            
                if (response.authResponse) {
                    FM_LOG('Welcome! Fetching your information....');
                            FB.api('/me', function(response){
                                FM_LOG('\nGood to see you, '+response.name+'.');
                                logger.info(response);
                            });
                } else {
                    FM_LOG('User cancelled login or did not fully authrize.');
                }
            }, {scope: 'create_note, photo_upload, publish_actions, publish_stream, read_stream, share_item, status_update, video_upload'});
        }
    });
}   // End of FB Log-In

FMFB.logout = function(){
    fmfb = null;
    FB.logout(function(res){
        FM_LOG("\nFB Logout: ");
        logger.info(res);
    });
};

FMFB.post = function(){
    var userID = "100004053532907";
    var token = "AAABqPdYntP0BAGUrJ7sZA0Yy1kIo0NMGqXTDjAdT9F7zB6Bv1u5jkl8ToCLzAPiBFcbwP8F5Tj75HAk9YE0v5YtlKZBIyANmRJ0ObEiqHRgyxZAjhBE";
    var what = {
            access_token: token,
            link: "https://www.youtube.com/watch?v=iGZBzcClsFQ&feature=fvst"
        };
    
    FM_LOG("\nPost Offline: " + JSON.stringify(what) );
    
    FB.api("/"+ userID +"/feed", "post", what, function(res){
        logger.info(res);
    });


};


/* Public, non-privileged */
    /*
        FMFB.prototype = {
            fnName: function(){
            
            },
        };
    */

//module.exports = FMFB;

/*
https://graph.facebook.com/oauth/authorize?client_id=APPLICATION_ID&redirect_uri=http://www.facebook.com/connect/login_success.html&scope=manage_pages,read_stream,publish_stream,offline_access
https://graph.facebook.com/me/friends?access_token=AAAAAAITEghMBAF7kDZCT7lxi9yJOx3ID6XQtqLR1dXQsDNXsrEmUOzEvXL3h2on4NP2qtZB8i1YuCwEfjIZA5N1hPZCR0Mulr68RojWyElTpDxXhwLyc
post request: https://graph.facebook.com/ID?AAA=value&BBB=value
*/