DoohInfo = (function(){
    var uInstance = null;
    
    function constructor(cbOfConstructor){
        var doohDescriptions = null;
        
        var obj = {
            //==public services of DoohInfo==
                
            /**
             * Get the URL of cover image for DOOH preview of UGC
             * 
             * @param doohId
             */             
            getPreviewCoverImageUrl: function(doohId){
                return 'dooh_info/'+doohId+'/'+doohDescriptions[doohId].preview.coverImageUrl;
            },
            /**
             * Get the zones where people can view the DOOH
             * 
             * @param doohId
             */
            getViewingZones: function(doohId){
                return doohDescriptions[doohId].viewingZones;
            }
        };
        
        //read dooh_descriptions.json
        var settings = {
                type: "GET",
                dataType: "json",
                data:{ miixToken: localStorage.miixToken },
                success: function(data, textStatus, jqXHR ){
                    //console.dir(data);
                    doohDescriptions = data;
                    cbOfConstructor(null, obj);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    cbOfConstructor('Failed to read dooh_descriptions.json: '+errorThrown, null);
                }                       
        };
        $.ajax('dooh_info/dooh_descriptions.json',settings);
    }

    return {
        getInstance: function(cbOfGetInstance){
            if(!uInstance){
                constructor(function(errOfConstructor, _uInstance){
                    uInstance = _uInstance;
                    cbOfGetInstance(errOfConstructor, uInstance);
                });
            }
            else {
                cbOfGetInstance(null, uInstance);
            }
        }
    };
})();