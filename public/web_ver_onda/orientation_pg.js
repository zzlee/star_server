FmMobile.orientationPg = {
    PAGE_ID: "orie_1",
    idx: null,
    max: null,
        
    swipeleft: function(){
        if( ++FmMobile.orientationPg.idx > FmMobile.orientationPg.max){
            //FmMobile.orientationPg.idx = FmMobile.orientationPg.max;
            
            /* test for setting flow, so change "if(!localStorage._id)" to
            "if(localStorage._id)", 
            */
            //if (!localStorage._id)
            if(!(localStorage.fb_userID && localStorage.verified=='true'))
              {
                $.mobile.changePage("login_toc.html", {transition: "slide"});
            }
            else {
                $.mobile.changePage("setting-main.html");
            }
        }else{
            $.mobile.changePage( ("orientation_" + FmMobile.orientationPg.idx+".html"), {transition: "slide"});
        }
    },
        
    swiperight: function(){
        if( --FmMobile.orientationPg.idx < 1){
       		FmMobile.orientationPg.idx = 1;	
        }else{
            $.mobile.changePage(("orientation_" + FmMobile.orientationPg.idx+".html")
                                , { transition: "slide",
                                reverse: true});
        }
    },
        
    init: function(){
   		FmMobile.orientationPg.idx = 1;
   		FmMobile.orientationPg.max = 2;
        
        $('#nav-bar').hide();
        //$('#mapArea').attr("coords","0,0,100,100");
        //var or_pic_width = ($('#or_pic').width());
       // var or_pic_height = ($('#or_pic').height());
        //alert(or_pic_width);
        //alert(or_pic_height);

        
    },
        
    show: function(){
        var or_pic_height = ($('#or_pic').height());
        var or_pic_width = ($('#or_pic').width());
        
        FmMobile.or_pic_height=or_pic_height;
        FmMobile.or_pic_width=or_pic_width;
        //var map_height= (FmMobile.or_pic_height)*0.5;
         //var map_height_2= (FmMobile.or_pic_height)*0.25;
        //$('#mapAreaBack').attr("coords","0,"+map_height+","+map_height_2+'"');
        //$('#mapAreaNext').attr("coords","'"+FmMobile.or_pic_width+","+map_height+","+map_height_2+'"');


       // alert(or_pic_height);
        //FmMobile.analysis.trackPage("/orientationPg");
        //FmMobile.push.registerDevice();
    },
};
