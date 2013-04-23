var scheduleDB = require("../../schedule.js");
var censorship = {};
    waitingList = null;

censorship.censor = function(e){
    console.log("censorship.censor()" + e);
    var evt = waitingList(e.target.data-index).
        id = "evt"+e.target.value;
    
    if(e.target.value === "proved"){
        
        scheduleDB.proved(evt._id, function(err, result){
            if(err) throw err;
            document.getElementById(id).style.display = "none";
        });
        
    }else{
    
        scheduleDB.reject(evt._id, function(err, result){
            if(err) throw err;
            document.getElementById(id).style.display = "none";
        });
    }
};

censorship.setList = function(list){
    waitingList = list;
    console.log("censorship.setList" + list);
};

var test(){
    console.log("Button TEST!");
    
}

console.log("Loading...... censorship.js");