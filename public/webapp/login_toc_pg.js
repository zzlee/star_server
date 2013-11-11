FmMobile.loginTocPg = {
PAGE_ID: "loginTocPg",
    
	init: function(){
		FM_LOG("[loginTocPg.init]")
		FmMobile.bindClickEventToNavBar();
		/*
		if(device.platform == "Android"){
			$("div[class^='login_content_login_toc']").attr({class:"login_content_login_toc_android"});
		}*/
		$("#go_verify").click(function(){
                      $.mobile.changePage('fb_login.html');

        });
    
	},
    
	show: function(){
		//FmMobile.analysis.trackPage("/loginTocPg");
//    recordUserAction("enters loginTocPg");
	},
};

