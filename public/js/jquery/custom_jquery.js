/**
 * FeltMeng.com
 */
 
//var DOMAIN = "http://www.feltmeng.idv.tw/admin/",
//     SDOMAIN = "https://www.feltmeng.idv.tw/admin/";
var DOMAIN = "/miix_admin/",
     SDOMAIN = "/miix_admin/";

var FM = {};    

var conditions = {};


// PageList object implementation
function PageList( listType, rowsPerPage, urlToGetListContent){
    var _this = this;
    this.currentPage = 1;
    this.rowsPerPage = rowsPerPage;
    this.urlToGetListContent = urlToGetListContent;
    this.totalPageNumber = 1;
    this.listType = listType;
    $.get('/admin/list_size', {listType: listType, token: localStorage.token}, function(res){
        if (!res.err){
            var listSize = res.size;
            _this.totalPageNumber = Math.ceil(res.size/_this.rowsPerPage); 
            $('#totalPage').html(FM.currentContent.totalPageNumber);
        }
    });
}; 

PageList.prototype.showPageContent = function(Page,condition){
    var _this = this;
    $.get(this.urlToGetListContent, {skip: (Page-1)*this.rowsPerPage, limit: this.rowsPerPage, token: localStorage.token, condition:conditions}, function(res){
        if(res.message){
            console.log("[Response] message:" + res.message);
        }else{
            _this.currentPage = Page;
            $('#table-content').html(res);
            $('#pageNoInput').attr('value',_this.currentPage);
            $('input#rowsPerPage').attr('value', _this.rowsPerPage);
        }
    });
    
    $.get('/admin/list_size', {listType: this.listType, token: localStorage.token}, function(res){
        if (!res.err){
            var listSize = res.size;
            _this.totalPageNumber = Math.ceil(res.size/_this.rowsPerPage); 
            $('#totalPage').html(FM.currentContent.totalPageNumber);
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
    var keyRow = this.rowsPerPage*(this.currentPage-1)+1;
    var newPage = Math.ceil(keyRow/newRowsPerPage); 
    this.rowsPerPage = newRowsPerPage;
    this.showPageContent(newPage);
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
            $.get(url, inputData, function(res, textStatus){
                if(res.token){
                    location.reload();
                    localStorage.token = res.token;
                }
                else{
                    console.log("[Response of Login] message:" + res.message);
                }
            });
        }        
        
    });

    $("#logoutBtn").click(function(){
        $.get(DOMAIN + "logout", function(res){
            delete localStorage.token;
            location.reload();
        });
    });
    
    
});

// Main Page 
$(document).ready(function(){
    FM.memberList = new PageList( 'memberList', 8, '/miix_admin/members');
    FM.miixPlayList = new PageList( 'miixMovieList', 5, '/miix_admin/miix_movies');
    FM.storyPlayList = new PageList( 'storyMovieList', 8, '/miix_admin/story_movies');
    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
    
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
        
        FM.currentContent = FM.miixPlayList;
        FM.currentContent.showCurrentPageContent();
        /*
        FM.miixPlayList(0, 20, function(res){
            if(res.message){
                console.log("[Response of playList] message:" + res.message);
            }else{
                FM.currentContent = FM.miixPlayList;
                $('#table-content').html(res);
            }
        });
        */
    });

    $('#storyPlayListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#storyPlayList').attr("class", "current");
        
        FM.currentContent = FM.storyPlayList;
        FM.currentContent.showCurrentPageContent();
        /*
        FM.storyPlayList(0, 20, function(res){
            if(res.message){
                console.log("[Response of playList] message:" + res.message);
            }else{
                FM.currentContent = FM.storyPlayList;
                $('#table-content').html(res);
            }
        });
        */
    });
    


    $('#UGCListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#UGCList').attr("class", "current");
        
        FM.currentContent = FM.UGCList;
        FM.currentContent.showCurrentPageContent();

    });
    
 // Ajax ---------------------------------------------------------------------    
    $(document).ajaxComplete(function(event,request, settings) {
//        console.dir('settings'+settings);
//        console.dir('request'+request);
//        console.log('settings'+JSON.stringify(settings));
//        console.log('request'+JSON.stringify(request));
//        console.log('ajax');
//        console.log('request'+JSON.stringify(settings.url));
//        console.log('request'+JSON.stringify(censorCheck));
        
        censorCheck = settings.url.substring(0,22);
        if(censorCheck == '/miix_admin/ugc_censor'){
            console.log('ajax_censor');
        /**
         * 查詢影片 搜尋 click
         */
        $('#ugcSearchBtn').click(function(){
            console.log('ugcSearch');
            var inputSearchData = {};
//          var url = DOMAIN + "ugc_censor";
            $('#condition-inner input[class="ugcSearchBtn"]').each(function(){
                console.log("item: " + $(this).attr("value"));
//              inputSearchData[$(this).attr("name")] = $(this).attr("value");
                inputSearchData = {'no':$(this).attr("value")};
                conditions = inputSearchData;
            });
            console.log("inputSearchData: " + JSON.stringify(inputSearchData) );
            if(conditions != null){
                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();
                conditions = {};
            }
        });
        /**
         * 篩選條件 尚未審核 click
         */
        $('#ugcSearchNoRatingBtn').click(function(){
            console.log('ugcSearchNoRatingBtn');

            conditions = 'norating';
            console.log("inputSearchData: " + JSON.stringify(conditions) );
            if(conditions != null){
                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();
                conditions = {};
            }
        });
        /**
         * 篩選條件 已經審核 click
         */
        $('#ugcSearchRatingBtn').click(function(){
            console.log('ugcSearchNoRatingBtn');

            conditions = 'rating';
            console.log("inputSearchData: " + JSON.stringify(conditions) );
            if(conditions != null){
                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();
                conditions = {};
            }
        });
        /**
         * 篩選條件 All click
         */
        $('#ugcSearchAllBtn').click(function(){
            console.log('ugcSearchNoRatingBtn');

            console.log("inputSearchData: " + JSON.stringify(conditions) );
            FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
            $('#main_menu ul[class="current"]').attr("class", "select");
            $('#UGCList').attr("class", "current");
            FM.currentContent = FM.UGCList;
            FM.currentContent.showCurrentPageContent();
            conditions = {};

        });
        /**
         * 投件時間 送出 click
         */
        $('#ugcSearchDateBtn').click(function(){
            console.log('ugcSearchDateBtn');
            var inputSearchData = {};
            var flag = 0;

            $('#condition-inner input[class="ugcSearchDateBtn"]').each(function(){
                console.log("item: " + $(this).attr("value"));
                inputSearchData[$(this).attr("name")] = $(this).attr("value");
                if($(this).attr("value") == "" && flag == 0){
                    alert('you have to enter full date!!');
                    flag = 1; 
                }
                conditions = inputSearchData;
            });
            console.log("inputSearchData: " + JSON.stringify(inputSearchData) );

            FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor',conditions);
            $('#main_menu ul[class="current"]').attr("class", "select");
            $('#UGCList').attr("class", "current");
            FM.currentContent = FM.UGCList;
            FM.currentContent.showCurrentPageContent();
            conditions = {};
        });
        //checkbox
        
        $('#ugcCensor.ugcCensorNoa').click(function(){
            console.log('checkboxGroup__A');
            var url = DOMAIN + "user_content_attribute";
            var no = $(this).attr("name");
            var rating ='a';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        $('#ugcCensor.ugcCensorNob').click(function(){
            console.log('checkboxGroup__B');
            console.log($(this).attr("name"));
            var url = DOMAIN + "user_content_attribute";
            var no = $(this).attr("name");
            var rating ='b';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        $('#ugcCensor.ugcCensorNoc').click(function(){
            console.log('checkboxGroup__C');
            console.log($(this).attr("name"));
            var url = DOMAIN + "user_content_attribute";
            var no = $(this).attr("name");
            var rating ='c';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        $('#ugcCensor.ugcCensorNod').click(function(){
            console.log('checkboxGroup__D');
            console.log($(this).attr("name"));
            var url = DOMAIN + "user_content_attribute";            
            var no = $(this).attr("name");
            var rating ='d';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        $('#ugcCensor.ugcCensorNoe').click(function(){
            console.log('checkboxGroup__E');
            console.log($(this).attr("name"));
            var url = DOMAIN + "user_content_attribute";
            var no = $(this).attr("name");
            var rating ='e';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        $('#ugcCensor.ugcCensorNof').click(function(){
            console.log('checkboxGroup__F');
            console.log($(this).attr("name"));
            var url = DOMAIN + "user_content_attribute";
            var no = $(this).attr("name");
            var rating ='f';

            console.log(no + rating);
            $.get(url, {no: no, rating: rating}, function(res){
                if(res.message){
                    console.log("[Response] message:" + res.message);
                }
            });
        });
        }

    });
  // Ajax End--------------------------------------------------------------------- 
    
    
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
    
    $('#pageNoInput').change(function(){
        var pageNo = parseInt($("#pageNoInput").attr('value'));
        if (pageNo){
            if ( pageNo < 1) {
                pageNo = 1;
            }
            else if ( pageNo > FM.currentContent.totalPageNumber ){
                pageNo = FM.currentContent.totalPageNumber;
            }
            FM.currentContent.showPageContent(pageNo);
        }
        else{
            $("#pageNoInput").attr('value', FM.currentContent.currentPage);
        }
    });
    
    
    
    $('input#rowsPerPage').change(function(){
        var rowsPerPage = parseInt($('input#rowsPerPage').attr('value'));
        if (rowsPerPage){
            if ( rowsPerPage < 1) {
                rowsPerPage = 1;
            }
            FM.currentContent.setRowsPerPage(rowsPerPage);
        }
        else{
            $('input#rowsPerPage').attr('value', FM.currentContent.rowsPerPage);
        }
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
  
