$(document).ready(function(){
    $('#signup').submit(function(){
            var pfjson = null,
                str = "{";
            
            $('#signup :text').each(function(){
                if($(this).attr('id') != "email")
                    str += '"' + $(this).attr('id') + '":"' + $(this).val() + '", ';
                else
                    str += '"' + $(this).attr('id') + '":"' + $(this).val() + '"';
            });
            
            str += "}";
            pfjson = JSON.parse(str);
            console.log("pfjson = " + JSON.stringify(pfjson));
            
            
    });        
});