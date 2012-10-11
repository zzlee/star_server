var builder = require('xmlbuilder');
var xml = builder.create('root')
  .ele('xmlbuilder', {'for': 'node-js'})
    .ele('repo', {'type': 'git'}, 'git://github.com/oozcitak/xmlbuilder-js.git')
  .end({ pretty: true});

console.log(xml);

var fs = require('fs');
fs.writeFile('mytest.xml', xml, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});