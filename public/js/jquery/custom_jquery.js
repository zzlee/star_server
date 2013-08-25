/**
 * FeltMeng.com
 */

//var DOMAIN = "http://www.feltmeng.idv.tw/admin/",
//SDOMAIN = "https://www.feltmeng.idv.tw/admin/";
var DOMAIN = "/miix_admin/",
SDOMAIN = "/miix_admin/";

var FM = {};    

var conditions = {};
var sessionId = null;


//PageList object implementation
function PageList( listType, rowsPerPage, urlToGetListContent){
    var _this = this;
    this.currentPage = 1;
    this.rowsPerPage = rowsPerPage;
    this.urlToGetListContent = urlToGetListContent;
    this.totalPageNumber = 1;
    this.listType = listType;
    this.extraParameters = null;
    $.get('/admin/list_size', {listType: listType, token: localStorage.token}, function(res){
        if (!res.err){
            var listSize = res.size;
            _this.totalPageNumber = Math.ceil(res.size/_this.rowsPerPage); 
            $('#totalPage').html(FM.currentContent.totalPageNumber);
        }
    });
}; 

PageList.prototype.setExtraParameters = function(extraParameters){
    this.extraParameters = extraParameters;
};

PageList.prototype.showPageContent = function(Page,condition){
    var _this = this;
    $.get(this.urlToGetListContent, {skip: (Page-1)*this.rowsPerPage, limit: this.rowsPerPage, token:localStorage.token, condition:conditions, extraParameters: JSON.stringify(this.extraParameters)}, function(res){
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



//Login 
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

//Main Page 
$(document).ready(function(){
    FM.memberList = new PageList( 'memberList', 8, '/miix_admin/members');
    FM.miixPlayList = new PageList( 'miixMovieList', 5, '/miix_admin/miix_movies');
    FM.storyPlayList = new PageList( 'storyMovieList', 8, '/miix_admin/story_movies');
    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
    FM.UGCPlayList = new PageList( 'ugcCensorPlayList', 5, '/miix_admin/doohs/taipeiarena/timeslots');
    FM.historyList = new PageList( 'historyList', 5, '/miix_admin/sessions/ ');

    FM.currentContent = FM.memberList;

    $('#memberListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#memberList').attr("class", "current");

        FM.currentContent = FM.memberList;
        FM.currentContent.showCurrentPageContent();
        $('#table-content-header').html('');

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
        $('#table-content-header').html('');
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
        $('#table-content-header').html('');
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
        conditions = {};
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#UGCList').attr("class", "current");

        FM.currentContent = FM.UGCList;
        FM.currentContent.showCurrentPageContent();
        $('#table-content-header').html('');

    });

    $('#UGCPlayListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#UGCPlayList').attr("class", "current");

        $.get('/miix_admin/table_censorPlayList_head.html', function(res){
            $('#table-content-header').html(res);
            $('#table-content').html('');
            
            $('#createProgramListBtn').click(function(){
                var flag = 0;
                var inputSearchData = {};
                var url = DOMAIN + "doohs/taipeiarena/program_timeslot_session";


                $('#condition-inner input[class="createProgramListBtn"]').each(function(i){

                    inputSearchData[$(this).attr("name")] = $(this).attr("value");

                    if($(this).attr("name") == 'ugcSequenceText'){
                        
                        var originSequence = $(this).attr("value");
                        var sequence = encodeURIComponent($(this).attr("value"));
                        
                        programSequenceStringToArr(sequence , function(err ,result){
                            if(!err){
                                console.log('programSequenceStringToArr'+result); 
                            }
                            else
                                console.log('programSequenceStringToArr err'+err);
                        });
                    }
                    
                    if($(this).attr("value") == "" && flag == 0){
                        alert('請輸入完整的條件!!\n時間格式為2013/08/01 00:00:00\n順序請填入類別字首(合成影片填入"合",心情填入"心",etc)\nex:2013/08/01 00:00:00,合心打打文');
                        flag = 1; 
                    }
                    
                    if(inputSearchData.timeStart && inputSearchData.timeEnd && inputSearchData.playTimeStart && inputSearchData.playTimeEnd && inputSearchData.ugcSequenceText && programSequenceArr){
                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: {intervalOfSelectingUGC:{start:inputSearchData.timeStart, end:inputSearchData.timeEnd}, intervalOfPlanningDoohProgrames:{start:inputSearchData.playTimeStart, end:inputSearchData.playTimeEnd}, programSequence:programSequenceArr, originSequence:originSequence},
                            success: function(response) {
                                if(response.message){
                                    console.log("[Response] message:" + JSON.stringify(response.message));
                                    sessionId = response.message;
                                    $('#main_menu ul[class="current"]').attr("class", "select");
                                    $('#UGCPlayList').attr("class", "current");

                                    FM.currentContent = FM.UGCPlayList;
                                    FM.currentContent.setExtraParameters({sessionId: sessionId});
                                    FM.currentContent.showCurrentPageContent();
                                    programSequenceArr =[];
                                }
                            }
                        });
                    }
                });

            });

        });

        //FM.currentContent = FM.UGCPlayList;
        //FM.currentContent.showCurrentPageContent();

    });

    $('#historyListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#historyList').attr("class", "current");
        
        $.get('/miix_admin/table_censorHistoryList_head.html', function(res){
            $('#table-content-header').html(res);
            $('#table-content').html('');
            
            $('#createHistoryProgramListBtn').click(function(){
                var flag = 0;
                var inputSearchData = {};

                $('#condition-inner input[class="createHistoryProgramListBtn"]').each(function(i){

                    inputSearchData[$(this).attr("name")] = $(this).attr("value");
                    if($(this).attr("value") == "" && flag == 0){
                        alert('請輸入完整的條件!!\n時間格式為2013/08/01 00:00:00');
                        flag = 1; 
                    }else{
                     conditions = inputSearchData;
                    }
                });
                  FM.currentContent = FM.historyList;
                  FM.currentContent.showCurrentPageContent();   

            });
        });
        
        FM.currentContent = FM.historyList;
        FM.currentContent.showCurrentPageContent();

    });
    
    // Ajax ---------------------------------------------------------------------    
    $(document).ajaxComplete(function(event,request, settings) {

        var playlistCheck = settings.url.substring(0,17);
        var censorCheck = settings.url.substring(0,22);
        var historyCheck = settings.url.substring(0,20);

        /**
         * UGCList
         */
        if(censorCheck == '/miix_admin/ugc_censor'){
            /**
             * 查詢影片 click
             */
            $('#ugcSearchBtn').click(function(){
                var inputSearchData = {};
                $('#condition-inner input[class="ugcSearchBtn"]').each(function(){
                    inputSearchData = {'no':$(this).attr("value")};
                    conditions = inputSearchData;
                });
                if(conditions != null){
                    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCList').attr("class", "current");
                    FM.currentContent = FM.UGCList;
                    FM.currentContent.showCurrentPageContent();
                }
            });
            /**
             * 尚未審核 click
             */
            $('#ugcSearchNoRatingBtn').click(function(){

                conditions = 'norating';
                if(conditions != null){
                    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCList').attr("class", "current");
                    FM.currentContent = FM.UGCList;
                    FM.currentContent.showCurrentPageContent();
                }
            });
            /**
             * 已經審核 click
             */
            $('#ugcSearchRatingBtn').click(function(){

                conditions = 'rating';
                if(conditions != null){
                    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCList').attr("class", "current");
                    FM.currentContent = FM.UGCList;
                    FM.currentContent.showCurrentPageContent();
                }
            });
            /**
             * All click
             */
            $('#ugcSearchAllBtn').click(function(){

                conditions = {};
                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();

            });
            /**
             * 投件時間 送出 click
             */
            $('#ugcSearchDateBtn').click(function(){
                var inputSearchData = {};
                var flag = 0;

                $('#condition-inner input[class="ugcSearchDateBtn"]').each(function(){
                    inputSearchData[$(this).attr("name")] = $(this).attr("value");
                    if($(this).attr("value") == "" && flag == 0){
                        alert('You have to enter full date!!');
                        flag = 1; 
                    }
                    conditions = inputSearchData;
                });

                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();
            });

            /**
             * checkbox
             */
            $('#ugcCensor.ugcCensorNoa').click(function(){
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='A';
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNob').click(function(){
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='B';
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNoc').click(function(){
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='C';

                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNod').click(function(){
                var url = DOMAIN + "user_content_attribute";            
                var no = $(this).attr("name");
                var rating ='D';

                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNoe').click(function(){
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='E';

                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNof').click(function(){
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='F';

                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{rating: rating}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });
            $('#ugcCensor.ugcCensorNoMP').click(function(){

                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var mustPlay = null;
                if($(this).attr("value") == 'true')
                    mustPlay = false;
                if($(this).attr("value") == 'false')
                    mustPlay = true;

                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {no: no, vjson:{mustPlay: mustPlay}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
            });

        }// End of UGCList

        /**
         * PlayList
         */

        if(playlistCheck == '/miix_admin/doohs'){
            
            $('#ugcCensor.ugcCensorNoSetBtn').click(function(){
                
                var url = DOMAIN + "doohs/taipeiarena/timeslots/sessionId";
                var programTimeSlotId = $(this).attr("name");
                var ugcReferenceNo;

                $('input[class="#ugcCensor.ugcCensorNoSetBtn"]').each(function(){
                    
                    ugcReferenceNo = $(this).attr("value");
                    
                    if(ugcReferenceNo && programTimeSlotId){
                        $.ajax({
                            url: url,
                            type: 'PUT',
                            data: { type: 'setUgcToProgram', programTimeSlotId: programTimeSlotId, ugcReferenceNo: ugcReferenceNo},
                            success: function(response) {
                                if(response.message){
                                    response.message;
                                    console.log("[Response_Set] message:" + response.message);
                                    conditions = { newUGCId :response.message, oldUGCId: programTimeSlotId};

                                    $('#main_menu ul[class="current"]').attr("class", "select");
                                    $('#UGCPlayList').attr("class", "current");

                                    FM.currentContent = FM.UGCPlayList;
                                    FM.currentContent.showCurrentPageContent();

                                }
                            }
                        });
                    }
                });

            });

            $('#ugcCensor.ugcCensorNoRemoveBtn').click(function(){
                var flag = 0;
                var url = DOMAIN + "doohs/taipeiarena/timeslots/sessionId";
                var programTimeSlotId = $(this).attr("name");

                if(sessionId === null && flag == 0){
                    alert('Session Id not exist!!');
                    flag = 1; 
                }
                if(programTimeSlotId && sessionId){
                    $.ajax({
                        url: url,
                        type: 'PUT',
                        data: { type:'removeUgcfromProgramAndAutoSetNewOne', programTimeSlotId: programTimeSlotId},
                        success: function(response) {
                            if(response.message){
                                response.message;
                                console.log("[Response] message:" + response.message);
                                conditions = { newUGCId :response.message, oldUGCId: programTimeSlotId};

                                $('#main_menu ul[class="current"]').attr("class", "select");
                                $('#UGCPlayList').attr("class", "current");

                                FM.currentContent = FM.UGCPlayList;
                                FM.currentContent.showCurrentPageContent();

                            }
                        }
                    });
                }
            });

            $('#pushProgramsBtn').click(function(){
                var flag = 0;
                var url = DOMAIN + "doohs/taipeiarena/ProgramsTo3rdPartyContentMgr/sessionId";
                if(sessionId === null && flag == 0){
                    alert('Session Id not exist!!');
                    flag = 1; 
                }
                if(sessionId){
                    $.ajax({
                        url: url,
                        type: 'PUT',
                        data: {},
                        success: function(response) {
                            if(response.message){
                                console.log("[Response] message:" + response.message);
                            }
                            $('#underPushingText').html('上傳成功!!');
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            $('#underPushingText').html('上傳失敗： '+textStatus+" "+errorThrown);
                        }
                    });
                    $('#pushProgramsBtn').hide();
                    $('#table-content').append($('<p>').attr("id","underPushingText").html('上傳至播放系統中，請稍候....'));
                }
            });            

        }// End of PlayList
        
        /**
         * HistoryList
         */
        if(historyCheck == '/miix_admin/sessions'){
            $('#history._idSetBtn').click(function(){

                sessionItemInfo = $(this).attr("name");
                sessionItemInfoArray = sessionItemInfo.split(',');

                $.get('/miix_admin/table_censorPlayList_head.html', function(res){
                    
                    $('#table-content-header').html(res);
                    $('#timeStartText').attr('value', sessionItemInfoArray[1]);
                    $('#timeEndText').attr('value', sessionItemInfoArray[2]);
                    $('#playTimeStartText').attr('value', sessionItemInfoArray[3]);
                    $('#playTimeEndText').attr('value', sessionItemInfoArray[4]);
                    $('#sequenceText').attr('value', sessionItemInfoArray[5]);

                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCPlayList').attr("class", "current");

                    FM.currentContent = FM.UGCPlayList;
                    FM.currentContent.setExtraParameters({sessionId: sessionItemInfoArray[0]});
                    FM.currentContent.showCurrentPageContent();
                    programSequenceArr =[];

                });
            });
        }// End of HistoryList 
        
    });
    // Ajax End---------------------------------------------------------------------

    var check_in = "%E6%89%93";
    var miix_it = "%E5%90%88";
    var cultural_and_creative = "%E6%96%87";
    var mood = "%E5%BF%83";
    var programSequenceArr = [];
    var next =0;
    
    var programSequenceStringToArr = function(string , cb){

        if(next == string.length){
            cb(null , programSequenceArr);
            next =0;
        }
        else{
            switch (string.substring(next, next+9))
            {
            case check_in:
                programSequenceArr.push('check_in');
                break;
            case miix_it:
                programSequenceArr.push('miix_it');
                break;
            case cultural_and_creative:
                programSequenceArr.push('cultural_and_creative');
                break;
            case mood:
                programSequenceArr.push('mood');
                break;
            default:

            }
            next += 9;
            programSequenceStringToArr(string , cb);
        }
    };
    

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


//1 - START DROPDOWN SLIDER SCRIPTS ------------------------------------------------------------------------

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

//END ----------------------------- 1

//2 - START LOGIN PAGE SHOW HIDE BETWEEN LOGIN AND FORGOT PASSWORD BOXES--------------------------------------

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

//END ----------------------------- 2



//3 - MESSAGE BOX FADING SCRIPTS ---------------------------------------------------------------------

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

//END ----------------------------- 3



//4 - CLOSE OPEN SLIDERS BY CLICKING ELSEWHERE ON PAGE -------------------------------------------------------------------------

$(document).bind("click", function (e) {
    if (e.target.id != $(".showhide-account").attr("class")) $(".account-content").slideUp();
});

$(document).bind("click", function (e) {
    if (e.target.id != $(".action-slider").attr("class")) $("#actions-box-slider").slideUp();
});
//END ----------------------------- 4



//5 - TABLE ROW BACKGROUND COLOR CHANGES ON ROLLOVER -----------------------------------------------------------------------
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
//END -----------------------------  5



//6 - DYNAMIC YEAR STAMP FOR FOOTER -----------------------------------------------------------------------

$('#spanYear').html(new Date().getFullYear()); 

//END -----------------------------  6 

