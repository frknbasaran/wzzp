var phantom = require('phantom');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 31557600000
}));

app.post('/search', function(req, res) {
    phantom.create(function(ph) {
        ph.createPage(function(page) {
            page.open("http://www.youtube.com/results?search_query=" + req.body.q, function(status) {
                console.log("searching on youtube.. keyword:" + req.body.q);
                fetch_youtube(page, ph, function(result) {
                    res.json(result);
                });
            });
        });
    });
});

function fetch_youtube(page, ph, callback) {
    page.evaluate(function() {
            var playList = [];

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

app.listen(80);