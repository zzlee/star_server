/**
 * FeltMeng.com
 */

 $.ajaxSetup({  
    async : false  
});
 
$(document).ready(function(){
    console.log('service');
    
    var type = 'table';
    $.get('/miix_service/customer_service_items', {type :type}, function(res){
        if (!res.err){
            console.log('res'+res+res.message);
            if(type == 'table')
            $('div.tab_container').html(res);
            if(type == 'list')            
            $('div.message_list').html(res);
        }
    });
    $('div.message_list').html('');
//    var type = 'list';
//    $.get('/miix_service/customer_service_items', {type :type}, function(res){
//        if (!res.err){
//            console.log('res'+res+res.message);
//            if(type == 'table')
//            $('div.tab_container').html(res);
//            if(type == 'list')             
//            $('div.message_list').html(res);
//        }
//    });
});

//$(document).ajaxComplete(function(event,request, settings) {
//    console.log('service');
//    alert('!!!');
//});