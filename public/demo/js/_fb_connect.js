/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log("\n[FM] "+ str); } : function(str){} ;

function FBConnect(){
    
}

FBConnect.prototype.onConnect;

FBConnect.prototype.connect = function(client_id, redirect_uri, display)
{
    
	this.client_id = client_id;
	this.redirect_uri = redirect_uri;
	
	var authorize_url  = "https://graph.facebook.com/oauth/authorize?";
		authorize_url += "client_id=" + client_id;
		authorize_url += "&redirect_uri=" + redirect_uri;
		authorize_url += "&display="+ ( display ? display : "touch" );
		authorize_url += "&type=user_agent";
        authorize_url += "&scope=read_stream,publish_stream,user_location,email,user_likes,publish_checkins";
//	var authorize_url = "https://www.facebook.com/dialog/oauth?client_id=" + client_id + "&redirect_uri=" + redirect_uri;
	
    window.open(authorize_url, "popUpWindow",'height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
//        window.top.location = authorize_url;
};


FBConnect.prototype.Logout = function() {
};


FBConnect.prototype.onClose = function(){
//    FM_LOG("[onClose]");
};

FBConnect.prototype.onLocationChange = function(newLoc)
{
//    FM_LOG("[onLocationChange] newLoc= "+newLoc);
	if(newLoc.indexOf(this.redirect_uri[0]) == 0 || newLoc.indexOf(this.redirect_uri[1]) == 0 )
	{
//        FM_LOG("[onLocationChange] Redirect");
		var result = unescape(newLoc).split("#")[1];
//        FM_LOG("[onLocationChange] result= "+result);
        
        if (result){
            // Token Parsing.
            this.accessToken = result.split("&")[0].split("=")[1];
//            FM_LOG("accessToken: " + this.accessToken);
            this.expiresIn = Date.now() + parseInt( result.split("&")[1].split("=")[1] );
//            FM_LOG("expiresIn: " + this.expiresIn);
            
            localStorage.fb_accessToken = this.accessToken;
            this.getUserID();
        }
	}
};

FBConnect.prototype.getUserID = function(){
//    FM_LOG("[getUserID] ");
    
    /* --------- Profile of FB --------- */
    
    var url = "https://graph.facebook.com/me?access_token=" + this.accessToken;
    var self = this;
    
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(e){
        
        if(req.readyState == 4 && req.status == 200){
            
            var res = JSON.parse(e.target.responseText);
            FM_LOG("[fb_profile]: " + JSON.stringify(res));
            localStorage.fb_userID = res.id;
            localStorage.fb_name = res.name;
            if(res.email)
                localStorage.email = res.email;
            
            $.jStorage.set("fb_profile", res);
            
            self.onConnect();
        }
    };
    
    /* --------- Profile Picture of FB --------- */
    
    var url_pic = "https://graph.facebook.com/me/picture?redirect=false&access_token=" + this.accessToken;
    var req_pic = new XMLHttpRequest();
    
    req_pic.onreadystatechange = function(e){
        //FM_LOG("req_pic: " + JSON.stringify(req_pic));
        if(req_pic.readyState == 4 && req_pic.status == 200){
//            FM_LOG("req_pic response: " + e.target.responseText);
            var res = JSON.parse(e.target.responseText);
//            FM_LOG("user_pic: " + res.data.url);
            localStorage.fb_user_pic = res.data.url;
        }
    };
    
    req.open("GET", url);
    req_pic.open("GET", url_pic);
    req.send({"timestamp": Date.now()});
    req_pic.send({"timestamp": Date.now()});
    
};


FBConnect.prototype.getFriends = function()
{
	var url = "https://graph.facebook.com/me/friends?access_token=" + this.accessToken;
	var req = new XMLHttpRequest();
	
	req.open("get",url,true);
	req.send(null);
	req.onerror = function(){alert("Error");};
	return req;
};

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
// Static method.
FBConnect.install = function()
{
    
	if(!window.plugins){
		window.plugins = {};	
	}
	window.plugins.fbConnect = new FBConnect();
                                                
	return window.plugins.fbConnect;
};

