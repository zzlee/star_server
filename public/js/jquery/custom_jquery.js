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
        conditions = {};
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#UGCList').attr("class", "current");

        FM.currentContent = FM.UGCList;
        FM.currentContent.showCurrentPageContent();

    });

    $('#UGCPlayListBtn').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#UGCPlayList').attr("class", "current");

        FM.currentContent = FM.UGCPlayList;
        FM.currentContent.showCurrentPageContent();

    });

    // Ajax ---------------------------------------------------------------------    
    $(document).ajaxComplete(function(event,request, settings) {
//      console.dir('settings'+settings);
//      console.dir('request'+request);
//      console.log('settings'+JSON.stringify(settings));
//      console.log('request'+JSON.stringify(request));
//      console.log('ajax');
//      console.log('request'+JSON.stringify(settings.url));
//      console.log('request'+JSON.stringify(censorCheck));

        playlistCheck = settings.url.substring(0,17);
        censorCheck = settings.url.substring(0,22);

//      console.log('playlistCheck'+playlistCheck);
        /**
         * UGCList
         */
        if(censorCheck == '/miix_admin/ugc_censor'){
            console.log('ajax_censor');
            /**
             * �d�߼v�� �j�M click
             */
            $('#ugcSearchBtn').click(function(){
                console.log('ugcSearch');
                var inputSearchData = {};
                $('#condition-inner input[class="ugcSearchBtn"]').each(function(){
                    console.log("item: " + $(this).attr("value"));
                    inputSearchData = {'no':$(this).attr("value")};
                    conditions = inputSearchData;
                });
                console.log("inputSearchData: " + JSON.stringify(inputSearchData) );
                if(conditions != null){
                    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCList').attr("class", "current");
                    FM.currentContent = FM.UGCList;
                    FM.currentContent.showCurrentPageContent();
                }
            });
            /**
             * �z���� �|���f�� click
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
                }
            });
            /**
             * �z���� �w�g�f�� click
             */
            $('#ugcSearchRatingBtn').click(function(){
                console.log('ugcSearchNoRatingBtn');

                conditions = 'rating';
                console.log("inputSearchData: " + JSON.stringify(conditions) );
                if(conditions != null){
                    FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                    $('#main_menu ul[class="current"]').attr("class", "select");
                    $('#UGCList').attr("class", "current");
                    FM.currentContent = FM.UGCList;
                    FM.currentContent.showCurrentPageContent();
                }
            });
            /**
             * �z���� All click
             */
            $('#ugcSearchAllBtn').click(function(){
                console.log('ugcSearchNoRatingBtn');

                console.log("inputSearchData: " + JSON.stringify(conditions) );
                conditions = {};
                FM.UGCList = new PageList( 'ugcCensorMovieList', 5, '/miix_admin/ugc_censor');
                $('#main_menu ul[class="current"]').attr("class", "select");
                $('#UGCList').attr("class", "current");
                FM.currentContent = FM.UGCList;
                FM.currentContent.showCurrentPageContent();

            });
            /**
             * ���ɶ� �e�X click
             */
            $('#ugcSearchDateBtn').click(function(){
                console.log('ugcSearchDateBtn');
                var inputSearchData = {};
                var flag = 0;

                $('#condition-inner input[class="ugcSearchDateBtn"]').each(function(){
                    console.log("item: " + $(this).attr("value"));
                    inputSearchData[$(this).attr("name")] = $(this).attr("value");
                    if($(this).attr("value") == "" && flag == 0){
                        alert('You have to enter full date!!');
                        flag = 1; 
                    }
                    conditions = inputSearchData;
                });
                console.log("inputSearchData: " + JSON.stringify(inputSearchData) );

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
                console.log('check_A');
                var url = DOMAIN + "user_content_attribute";
                var no = $(this).attr("name");
                var rating ='a';
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
                var rating ='b';
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
                var rating ='c';

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
                var rating ='d';

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
                var rating ='e';

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
                var rating ='f';

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
                console.log('value'+$(this).attr("value"));
                if($(this).attr("value") == 'true')
                    mustPlay = false;
                if($(this).attr("value") == 'false')
                    mustPlay = true;

                console.log('mustplay'+no+mustPlay);

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

        }// End of ugc_censor

        /**
         * playList
         */

        if(playlistCheck == '/miix_admin/doohs'){
            $('#createProgramListBtn').click(function(){
                var flag = 0;
                var inputSearchData = {};
                var url = DOMAIN + "doohs/taipeiarena/timeslots";


                $('#condition-inner input[class="createProgramListBtn"]').each(function(i){

                    inputSearchData[$(this).attr("name")] = $(this).attr("value");

                    if($(this).attr("name") == 'ugcSequenceText'){

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
                        alert('You have to enter complete condition!!');
                        flag = 1; 
                    }
                    
                    if(inputSearchData.TimeStart && inputSearchData.TimeEnd && inputSearchData.playtimeStart && inputSearchData.playtimeEnd && inputSearchData.ugcSequenceText && programSequenceArr){
                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: {intervalOfSelectingUGC:{start:inputSearchData.TimeStart, end:inputSearchData.TimeEnd}, intervalOfPlanningDoohProgrames:{start:inputSearchData.playtimeStart, end:inputSearchData.playtimeEnd}, programSequence:programSequenceArr},
                            success: function(response) {
                                if(response.message){
                                    console.log("[Response] message:" + JSON.stringify(response.message.sessionId));
                                    sessionId = response.message;
                                    $('#main_menu ul[class="current"]').attr("class", "select");
                                    $('#UGCPlayList').attr("class", "current");

                                    FM.currentContent = FM.UGCPlayList;
                                    FM.currentContent.setExtraParameters({sessionId: response.message.sessionId});
                                    FM.currentContent.showCurrentPageContent();
                                    programSequenceArr =[];
                                }
                            }
                        });
                    }
                });

            });
            
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
                        }
                    });
                }
            });            

        }// End of doohs

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

