// external modules
var phantom = require('phantom');
var express = require('express');
var mongoose = require('mongoose');
// node core module
var path = require('path');
// express middleware
var bodyParser = require('body-parser');

// express app declaration
var app = express();

// mongodb database connnection
mongoose.connect('mongodb://localhost:27017/wzzp');

// mongoose schema variable 
var Schema = mongoose.Schema;

// create new instance from schema object
// data structure mapping
var log = new Schema({
  search : {
    type: String
  },
  searchedAt: {
    type: Date,
    default: Date.now
  },
  addr: {
    type: String
  }
});

// create new object model from mongoose 
var log = mongoose.model('log', log);

// express body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// define public directory for serve client side files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 31557600000
}));

// handle /search POST request
// req.body.q = searching keyword String
app.post('/search', function(req, res) {

    // create new instance from log model
    var logRecord = new log();

    // manipulate instance object
    logRecord.search = req.body.q;
    logRecord.addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // save to database
    logRecord.save(function(err) {
      if(!err) console.log("arama loglandi");
      else console.log("loglama sirasinda veritabani hatasi");
    });

    // configure phantom
    phantom.create(function(ph) {
        // phantom page declaration
        ph.createPage(function(page) {
            // visit site which arg0
            page.open("http://www.youtube.com/results?search_query=" + req.body.q, function(status) {
                console.log("searching on youtube.. keyword:" + req.body.q);
                fetch_youtube(page, ph, function(result) {
                    res.json(result);
                });
            });
        });
    });
});

// phantom string parsing method
function fetch_youtube(page, ph, callback) {
    page.evaluate(function() {
            // youtube playlist array
            var playList = [];

            // find matched DOM Classes
            var matches = document.querySelectorAll('.yt-uix-tile-link');

            for (var i = 0; i < matches.length; i++) {
                playList.push({
                    "title": matches[i].innerHTML,
                    "href": matches[i].getAttribute('href')
                });
            }

            return playList;
        },
        function(result) {
            console.log(result);
            callback(result);
            ph.exit();
        });
}

// run application on :80
app.listen(80);