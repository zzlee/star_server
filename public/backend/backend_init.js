var FmBackend = window.FmBackend || {};

var DEBUG = true;
var local = false,
    domain = (local) ? "http://localhost:3000" : serverURL;

$(document).bind("mobileinit", function(){
                // Initialization Code here.
                // $.mobile.ns = "fm";
                $.mobile.allowCrossDomainPages = false;
                $.mobile.pushStateEnabled = true;
                
                $.mobile.page.prototype.options.addBackBtn = true;
               
                $("#censorshipPg").live("pagebeforeshow", FmBackend.censorshipPg.loadWaitingEvents);
                //$("#homePg").live("pageshow", FmBackend.homePg.init);
				

				
                console.log("<----------------- LOAD JQM ----------------->");
});



FmBackend.censorshipPg = {

    PAGE_ID: "censorshipPg",
    
    _waitingEvents: null,
    
    //  Page methods.
    loadWaitingEvents: function(){
    
        var url = domain + "/api/eventsOfWaiting",
            data = {"do": "nothing"};
        var thisPage = $(this);
        
        $.get(url, data, function(res){
            if(DEBUG) console.log( "Get waitingEvents: " + JSON.stringify(res) );
            
            if(res.waitingEvents){
                _waitingEvents = res.waitingEvents;
                
                for(var i=0; i < _waitingEvents.length; i++){
                
                    var event = $("<div>").attr("id", "event"+i).appendTo($("#contentArea", thisPage));
                    var video = $("<iframe>").attr({
                        id: "video"+i,
                        src: _waitingEvents[i].videoUrl,
                        width: "560",
                        height: "315",
                        frameborder: "0",
                    }).appendTo(event);
                    
                    $("<br>").appendTo(event);
                    
                    var rejectBtn = $("<button>").attr("id", "rjt"+i).html("©Úµ´").on("click", FmBackend.censorshipPg.reject).appendTo(event);
                    var proveBtn = $("<button>").attr("id", "prv"+i).html("³q¹L").on("click", FmBackend.censorshipPg.prove).appendTo(event);
                    
                }
            }
        });
    },
    
    reject: function(event){
    
        var idx = parseInt(event.target.id.substring(3), 10);
        var url = domain + "/api/reject",
            evtid = _waitingEvents[idx]._id,
            data = {"event": {"oid": evtid} };
            
        if(DEBUG) console.log("Reject " + event.target.id + " events: "+ JSON.stringify(evtid) );  
        
        $("#event"+idx).remove();
        
        $.post(url, data, function(res){
            if(DEBUG) console.log("Res of Reject: " + JSON.stringify(res) );
        })
    },

    prove: function(event){
    
        if(DEBUG) console.log("Prove " + event.target.id);
        var idx = parseInt(event.target.id.substring(3), 10);
        var url = domain + "/api/prove",
            evtid = _waitingEvents[idx]._id,
            data = {"event": {"oid": evtid} };
            
        if(DEBUG) console.log("Prove " + event.target.id + " events: "+ JSON.stringify(evtid) );
        
        $("#event"+idx).remove();
        
        $.post(url, data, function(res){
            if(DEBUG) console.log("Res of Prove: "+ JSON.stringify(res) );
        })
		
		//TODO: inform dooh controller to upload contents to dooh
    },
};