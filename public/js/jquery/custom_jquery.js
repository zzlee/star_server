/**
 * FeltMeng.com
 */
 
var DOMAIN = "http://www.feltmeng.idv.tw/admin/",
     SDOMAIN = "https://www.feltmeng.idv.tw/admin/";

var FM = {};     
 
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
                    $('html').html(res);
            });
        }        
        
    });
});


$(document).ready(function(){
    $('#main_menu a[href="#memberList"]').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#memberList').attr("class", "current");
        
        FM.memberList(0, 20, function(res){
            if(res.message){
                console.log("[Response of memberList] message:" + res.message);
            }else{
                $('#table-content').html(res);
            }
        });
    });
    
    
    $('#main_menu a[href="#playList"]').click(function(){
        $('#main_menu ul[class="current"]').attr("class", "select");
        $('#playList').attr("class", "current");
        
        FM.playList(0, 20, function(res){
            if(res.message){
                console.log("[Response of playList] message:" + res.message);
            }else{
                $('#table-content').html(res);
            }
        });
    });
});


FM.memberList = function(page, row, cb){
    var url = DOMAIN + "memberList";
    $.get(url, {page: page, row: row}, cb);
};

FM.playList = function(page, row, cb){
    var url = DOMAIN + "playList";
    $.get(url, {page: page, row: row}, cb);
};



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
  
