var jade = require('jade');
var express = require('express'), app = express.createServer();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('index.jade');
});
app.listen(3000);