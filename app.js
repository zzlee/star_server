
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var fs = require('fs');


app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  //GL
  app.use(express.cookieParser('kooBkooCedoN'));
  app.use(express.session());
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
app.get('/', routes.profile, routes.index);
app.post('/', routes.profile, routes.index);
app.post('/signin', routes.signin, routes.profile, routes.index);
app.post('/signup', routes.signup, routes.profile, routes.index);
app.post('/addEvent', routes.addEvent, routes.event, routes.schedule);
app.del('/', routes.signout, routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
