
/**
 * Module dependencies.
 */
var http = require('http'),
    https = require('https'),
    express = require('express'),
    routes = require('./routes'),
	user = require('./routes/user'),
    crypto = require('crypto'),
    Db = require('mongodb').Db,
    dbserver = require('mongodb').Server,
    dbserver_config = new dbserver('localhost', 27017, {auto_reconnect: true, native_parser: true} ),
    fmdb = new Db('feltmeng', dbserver_config, {})
    mongoStore = require('connect-mongodb'),
    app = express(),
	fs = require('fs'),
	path = require('path'),
    server = http.createServer(app),
    secureServer = https.createServer(app),
    sio = require('socket.io').listen(server),
    ssio = require('socket.io').listen(secureServer);
  
  

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
 
  //GL
  app.use(express.query());
  app.use(express.cookieParser('kooBkooCedoN'));
  app.use(express.session({
    secret: "thesecretoffeltmeng",
    maxAge: 24 * 60 * 60 * 1000 ,
    store: new mongoStore({ db: fmdb })
  }));  // sessionID save as "_id" of session doc in MongoDB.

  app.use(express.methodOverride());
  
  /* Must put this before app.router. */
  app.use( function (req, res, next) {
    res.locals.user = req.session.user;
    next(); // Please Don't forget next(), otherwise suspending;
  });  

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler({ dumpExceptions: true })); 
});


app.get('/users', user.list);

//GZ 
app.get('/get_template_list', routes.getTemplateList_cb );
app.get('/get_template_raw_data', routes.getTemplateRawData_cb );
app.get('/get_template_description', routes.getTemplateDescription_cb );
app.get('/get_template_customizable_object_list', routes.getTemplateCustomizableObjectList_cb );
app.post('/upload_user_data', routes.uploadUserData_cb );
app.get('/oauth2callback', routes.YoutubeOAuth2_cb );
app.post('/upload', routes.upload_cb );
app.post('/upload_user_data_info',routes.uploadUserDataInfo_cb);

//GL
/*
app.get('/', routes.profile, routes.index);
app.get('/censorship', routes.censorship);
app.get('/([a-zA-Z0-9]+)', routes.api.profile);

app.post('/', routes.profile, routes.index);
app.post('/signin', routes.signin, routes.profile, routes.index);
app.post('/signup', routes.signup, routes.profile, routes.index);
app.post('/addEvent', routes.addEvent, routes.event, routes.schedule);
app.post('/addVideo', routes.addVideo, routes.profile, routes.index );

app.del('/', routes.signout, routes.index);*/
app.get('/signin_fb', routes.signinFB);

//  FM.API
app.get('/api/eventsOfWaiting', routes.api.eventsOfWaiting);
app.get('/api/schedule', routes.api.eventsOfPeriod);
app.get('/api/userProfile', routes.api.userProfile);
app.get('/api/profile', routes.api.profile);
app.get('/api/fbStatus', routes.api.fbStatus);
app.get('/api/fbGetComment', routes.api.fbGetCommentReq);

app.post('/api/signin', routes.api.signin);

//app.post('/', routes.profile, routes.index);
app.post('/api/signup', routes.api.signup);
app.post('/api/addEvent', routes.api.addEvent);
app.post('/api/reject', routes.api.reject);
app.post('/api/prove', routes.api.prove);
app.post('/api/signupwithFB', routes.api.signupwithFB);

app.del('/', routes.api.signout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
