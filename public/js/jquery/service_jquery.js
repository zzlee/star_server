/**
 * FeltMeng.com
 */

$.ajaxSetup({  
    async : false  
});

var customerServiceItemId = null;
var condition = null;
var DOMAIN = "/miix_service/";

$(document).ready(function(){
    console.log('service');
    var url = DOMAIN + "customer_service_items";
    /**
     * load table and init message list
     */      
    var type = 'table';
    $.get(url, {type :type}, function(res){
        if (!res.err){
            console.log('res'+res+res.message);
            $('div.tab_container').html(res);
        }
    });
    $('div.message_list').html('');

    /**
     * load message list
     */        
    $('#product-table tbody tr').click( function() {
//      alert(this.id);
        customerServiceItemId = this.id;
        reloadList();
//      var type = 'list';
//      var condition = {_id :customerServiceItemId};
//      if(customerServiceItemId){
//      $.get(url, {type :type, condition:condition}, function(res){
//      if (!res.err){
//      console.log('res'+res+res.message);
//      $('div.message_list').html(res);
//      }
//      });
//      }
    });

    /**
     * answer enter
     */
    $('#answerInput').click( function() {
        console.log('anwserInput');
        var url = DOMAIN + "questions";
        $('#answer textarea[class="answerInput"]').each(function(){
            console.log("item: " + $(this).attr("value"));
            $.ajax({
                url: url,
                type: 'PUT',
                data: {_id: customerServiceItemId, answer: $(this).attr("value")},
                success: function(response) {
                    if(response.message){
                        console.log("[Response] message:" + response.message);
                    }
                }
            });

            /**
             * reload  table and list
             */
            reloadTable();
            reloadList();
        });
    });


});


$(document).keyup(function (e) {
    /**
     * quickSearch bind enter
     */
    if ($("quickSearch .input:focus") && (e.keyCode === 13)) {
        $('#quickSearchInput').each(function(){
//          alert('...'+$(this).attr("value"));
            var url = DOMAIN + "customer_service_items";
            var fb_userName = $(this).attr("value");
            var type = 'table';
            condition = {fb_userName: fb_userName};
            if(fb_userName != 'Quick Search'){
                $.get(url, {type :type, condition:condition}, function(res){
                    if (!res.err){
                        console.log('res'+res+res.message);
                        $('div.tab_container').html(res);
                    }
                });
            }
        });
    }
    /**
     * remark enter
     */
    if ($("tr td .textarea:focus") && (e.keyCode === 13)) {
        console.log('+++++++++++');
        $('#service._idRemarks').each(function(){
//          console.log('+++Remarks++++++++'+$(this).attr("value"));
            if($(this).attr("value")){
                var url = DOMAIN + "questions";
//              alert('...'+$(this).attr("value")+$(this).attr("name"));
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {_id: $(this).attr("name"), vjson:{remarks: $(this).attr("value")}},
                    success: function(response) {
                        if(response.message){
                            console.log("[Response] message:" + response.message);
                        }
                    }
                });
                /**
                 * reload  table
                 */
                condition = null;
                reloadTable();
            }
        });

    }

});

/**
 * ajax
 */ 
$(document).ajaxComplete(function(event,request, settings) {
//  console.dir('settings'+settings);
    serviceCheck = settings.url.substring(0,36);
    console.log('ajaxComplete'+serviceCheck);

    if(serviceCheck == '/miix_service/customer_service_items'){
        $('#product-table tbody tr').click( function() {
//          alert(this.id);
            customerServiceItemId = this.id;
            reloadList();
        });

        $(document).keyup(function (e) {
            console.log('keyup');
            if ($("tr td .textarea:focus") && (e.keyCode === 13)) {
                $('#service._idRemarks').each(function(){
//                  console.log('+++Remarks++++++++'+$(this).attr("value"));
                    if($(this).attr("value")){
                        var url = DOMAIN + "questions";
//                      alert('...'+$(this).attr("value")+$(this).attr("name"));
                        $.ajax({
                            url: url,
                            type: 'PUT',
                            data: {_id: $(this).attr("name"), vjson:{remarks: $(this).attr("value")}},
                            success: function(response) {
                                if(response.message){
                                    console.log("[Response] message:" + response.message);
                                }
                            }
                        });
                        /**
                         * reload  table
                         */
                        condition = null;
                        reloadTable();
                    }
                });

            }
        });

    }

});

function reloadTable(){
    url = DOMAIN + "customer_service_items";
    var type = 'table';
    $.get(url, {type :type, condition:condition}, function(res){
        if (!res.err){
            console.log('res'+res+res.message);
            $('div.tab_container').html(res);
        }
    });
};

function reloadList(){
    url = DOMAIN + "customer_service_items";
    var type = 'list';
    var condition = {_id :customerServiceItemId};
    if(customerServiceItemId){
        $.get(url, {type :type, condition:condition}, function(res){
            if (!res.err){
                console.log('res'+res+res.message);
                $('div.message_list').html(res);
            }
        });
    }
};