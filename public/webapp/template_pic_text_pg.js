FmMobile.template_pic_text_pg = {
	//  Page constants.
PAGE_ID: "template_pic_text_pg",
    
    //  Page methods.
show: function(){
   // FmMobile.analysis.trackPage("/template_pic_text_pg");
//recordUserAction("enters template_pic_text_pg");
    FmMobile.dummyDiv();
    /* ------  prefill user's previous text   ---- */
    if(FmMobile.userContent.text){
        FmMobile.userContent.text=FmMobile.userContent.text.replace(/\<n\>/ig,"\n");
        $("#ur_text").val(FmMobile.userContent.text);
    }

    /* ------ end of prefill user's previous text   ---- */
},
    
load: function(event, data){
    
	
    

   // FmMobile.userContent.text="aa";
    var textForUgcUtility;
    
    $("#ur_text").bind("blur",function(){
                        $("#nav-bar").show();
                       textForUgcUtility= $("#ur_text").val().replace(/\n/g,"<n>");
                       FmMobile.userContent.text=textForUgcUtility;
                       });
    
    
    $("#ur_text").bind("tap",function(){
                      $("#nav-bar").hide();
                       });
    
    
    $("#ur_text").keyup(function(){
                        var moreLineInBox=$("#ur_text").val();
                        moreLineInBox=$("#ur_text").val().replace(/\n/g,"<n>");
                        var moreLineInBox_2=moreLineInBox.split("<n>");
                        if(moreLineInBox_2.length>3){
                        //FmMobile.showNotification("inAreaTextOver");
                        	alert("超過三行囉!第四行會超過大螢幕");
                        $("#ur_text").val(moreLineInBox_2[0]+"\n"+moreLineInBox_2[1]+"\n"+moreLineInBox_2[2]);
                        return false;
                        }
                        });
   
    //$("#nav-bar").show();
    
    
    $("#back_main").click(function(){
                          $.mobile.changePage("template-sub_template.html");
                          });
    $("#go_cropper").click(function(){
    	//------------- handle text ------------
    	 if($("#ur_text").val().length==0 ||$("#ur_text").val()==" "){
             alert("請至少寫一個字");
         }else{
             
             var check_format= FmMobile.userContent.text.split("<n>");
             //FmMobile.userContent.text=check_format;
             if(check_format.length>3){
                 
                 return false;
                 //alert("more than 4 lines!");
             }
             
             if(check_format[0].length >8){
                 
               //  FmMobile.showNotification("moreWords");
                 return false;
                 
                 
             }
             if(check_format[1] != undefined){
                 if(check_format[1].length >8 ){
                  //   FmMobile.showNotification("moreWords");
                     return false;
                     
                 }
             }
             
             if(check_format[2] != undefined){
                 if(check_format[2].length >8 ){
                    // FmMobile.showNotification("moreWords");
                     return false;
                     
                 }
             }

         }
    	
    	//------------------------
    	
    	
    	
    	
	      if(localStorage.imgForCropper == undefined){
		  alert("請選張圖吧");
		  return false;
		  }
	   
	   fileProcessedForCropperURI = localStorage.imgForCropper;
	   FmMobile.userContent.picture.urlOfOriginal = localStorage.imgForCropper;
      $.mobile.changePage("template-photo_cropper.html");
    });
	  
    
    $('#template_top_img_text_pic').attr({src:FmMobile.selectedTemplateBarImg});
    
    
    
    
    var url = $(this).data('url');
    
    
    
    var itemContentIsReady;
    
    //-------------------------------------------------------------------
	
	  function handleFileSelect(evt) {
var files = evt.target.files; // FileList object

var reader = new FileReader();

// Closure to capture the file information.
reader.onload = (function(theFile) {
  return function(e) {
    // Render thumbnail.
    var span = document.createElement('span');
    span.innerHTML = ['<img class="thumb" src="', e.target.result,
                      '" title="', escape(theFile.name), '"/>'].join('');
      
      //alert("ww");
    localStorage.setItem('imgForCropper', e.target.result);
                document.getElementById('list').src= localStorage.imgForCropper;

  };
})(files[0]);

// Read in the image file as a data URL.
reader.readAsDataURL(files[0]);
// }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

	//------------------------------------------------------------------
    
  
   // $('#btnUseCamera').bind( "click", { photoSource: "camera" }, buttonClick_cb);
   // $('#btnUseAlbum').bind( "click", { photoSource: "album" }, buttonClick_cb);
    
    
}
}