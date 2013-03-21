/**
 * FeltMeng.com
 */
 
//var DOMAIN = "http://www.feltmeng.idv.tw/admin/",
//     SDOMAIN = "https://www.feltmeng.idv.tw/admin/";
var DOMAIN = "/admin/",
     SDOMAIN = "/admin/";

var FM = {};    

// PageList object implementation
function PageList( rowsPerPage, urlToGetListContent, urlToGetListSize){
    this.currentPage = 1;
    this.rowsPerPage = rowsPerPage;
    this.urlToGetListContent = urlToGetListContent;
    this.totalPageNumber = 3; //TODO: calculate this from list size
}; 

PageList.prototype.showPageContent = function(Page){
    $.get(this.urlToGetListContent, {skip: (Page-1)*this.rowsPerPage, limit: this.rowsPerPage}, function(res){
        if(res.message){
            console.log("[Response] message:" + res.message);
        }else{
            $('#table-content').html(res);
        }
    });
};

PageList.prototype.showCurrentPageContent = function(){
    this.showPageContent(this.currentPage);
};


PageList.prototype.showNextPageContent = function(){
    if (this.currentPage < this.totalPageNumber){
        this.currentPage++;
        this.showCurrentPageContent();
    }
};

PageList.prototype.showPreviousPageContent = function(){
    if (this.currentPage > 1){
        this.currentPage--;
        this.showCurrentPageContent();
    }

};

PageList.prototype.showFirstPageContent = function(){
    this.showPageContent(1);
};

PageList.prototype.showLastPageContent = function(){
    this.showPageContent(this.totalPageNumber);
};

PageList.prototype.setRowsPerPage = function(newRowsPerPage ){

};


 
// Login 
$(document).ready(function(){
    $("#login-btn").click(function(){
        var inputData = {};
        var url = DOMAIN + "login";
        $('#login-inner input[class="login-inp"]').each(function(){
            //console.log("item: " + $(this).attr("value"));
            inputData[$(this).attr("name")] = $(this).attr("value");
        });
        console.log("Input: " + JSON.stringify(inputData) );
        if(inputData.id && inputData.password){
            $.get(url, inputData, function(res){
                if(res.message)
                    console.log("[Response of Login] message:" + res.message);
                else
                    //$('html').html(res);
                    //$('html').replaceWith(res);
                    //$('html').load('/frame.html');
                    location.reload();
            });
        }        
        
    });

    $("#logoutBtn").click(function(){
        $.get(DOMAIN + "logout", function(res){
            location.reload();
        });
    });
    
    
});

// Main Page 
$(document).ready(function(){

    FM.memberList = new PageList( 8, '/admin/member_list', '');
    FM.miixPlayList = new PageList( 3, '/admin/miix_play_list', '');
    FM.storyPlayList = new PageList( 3, '/admin/story_play_list', '');
    
    FM.currentContent = FM.memberList;

    $('#memberListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#memberList').attr("class", "current");
        
        FM.currentContent = FM.memberList;
        FM.currentContent.showCurrentPageContent();
        
        /*
        //FM.memberList(1, 18, function(res){
        FM.memberList.getCurrentPageContent( function(res){
            if(res.message){
                console.log("[Response of memberList] message:" + res.message);
            }else{
                FM.currentContent = FM.memberList;
                $('#table-content').html(res);
            }
        });
        */
    });
    
    
    $('#miixPlayListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#miixPlayList').attr("class", "current");
        
        FM.miixPlayList(0, 20, function(res){
            if(res.message){
                console.log("[Response of playList] message:" + res.message);
            }else{
                FM.currentContent = FM.miixPlayList;
                $('#table-content').html(res);
            }
        });
    });

    $('#storyPlayListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#storyPlayList').attr("class", "current");
        
        FM.storyPlayList(0, 20, function(res){
            if(res.message){
                console.log("[Response of playList] message:" + res.message);
            }else{
                FM.currentContent = FM.storyPlayList;
                $('#table-content').html(res);
            }
        });
    });

    
    $('#goToNextPage').click(function(){
        FM.currentContent.showNextPageContent();
    });

    $('#goToPreviousPage').click(function(){
        FM.currentContent.showPreviousPageContent();
    });

    $('#goToFirstPage').click(function(){
        FM.currentContent.showFirstPageContent();
    });

    $('#goToLastPage').click(function(){
        FM.currentContent.showLastPageContent();
    });
    
    $('#memberListBtn').click();
});

/*
FM.memberList = function(pageToGo, rowsPerPage, cb){
    var url = DOMAIN + "member_list";
    $.get(url, {skip: (pageToGo-1)*rowsPerPage, limit: rowsPerPage}, cb);
};


FM.miixPlayList = function(pageToGo, rowsPerPage, cb){
    var url = DOMAIN + "miix_play_list";
    $.get(url, {skip: (pageToGo-1)*rowsPerPage, limit: rowsPerPage}, cb);
};

FM.storyPlayList = function(pageToGo, rowsPerPage, cb){
    var url = DOMAIN + "story_play_list";
    $.get(url, {skip: (pageToGo-1)*rowsPerPage, limit: rowsPerPage}, cb);
};
*/


// 1 - START DROPDOWN SLIDER SCRIPTS ------------------------------------------------------------------------

$(document).ready(function () {
    $(".showhide-account").click(function () {
        $(".account-content").slideToggle("fast");
        $(this).toggleClass("active");
        return false;
    });
});

$(document).ready(function () {
    $(".action-slider").click(function () {
        $("#actions-box-slider").slideToggle("fast");
        $(this).toggleClass("activated");
        return false;
    });
});

//  END ----------------------------- 1

// 2 - START LOGIN PAGE SHOW HIDE BETWEEN LOGIN AND FORGOT PASSWORD BOXES--------------------------------------

$(document).ready(function () {
	$(".forgot-pwd").click(function () {
		$("#loginbox").hide();
		$("#forgotbox").show();
		return false;
	});

});

$(document).ready(function () {
	$(".back-login").click(function () {
		$("#loginbox").show();
		$("#forgotbox").hide();
		return false;
	});
});

// END ----------------------------- 2



// 3 - MESSAGE BOX FADING SCRIPTS ---------------------------------------------------------------------

$(document).ready(function() {
	$(".close-yellow").click(function () {
		$("#message-yellow").fadeOut("slow");
	});
	$(".close-red").click(function () {
		$("#message-red").fadeOut("slow");
	});
	$(".close-blue").click(function () {
		$("#message-blue").fadeOut("slow");
	});
	$(".close-green").click(function () {
		$("#message-green").fadeOut("slow");
	});
});

// END ----------------------------- 3



// 4 - CLOSE OPEN SLIDERS BY CLICKING ELSEWHERE ON PAGE -------------------------------------------------------------------------

$(document).bind("click", function (e) {
    if (e.target.id != $(".showhide-account").attr("class")) $(".account-content").slideUp();
});

$(document).bind("click", function (e) {
    if (e.target.id != $(".action-slider").attr("class")) $("#actions-box-slider").slideUp();
});
// END ----------------------------- 4
 
 
 
// 5 - TABLE ROW BACKGROUND COLOR CHANGES ON ROLLOVER -----------------------------------------------------------------------
/*
$(document).ready(function () {
    $('#product-table	tr').hover(function () {
        $(this).addClass('activity-blue');
    },
    function () {
        $(this).removeClass('activity-blue');
    });
});
 */
// END -----------------------------  5
 
 
 
 // 6 - DYNAMIC YEAR STAMP FOR FOOTER -----------------------------------------------------------------------

 $('#spanYear').html(new Date().getFullYear()); 
 
// END -----------------------------  6 
  
