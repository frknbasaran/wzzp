$(function() {

    $('#key').friendurl({id : 'key', divider: '+', transliterate: true});

    $('body').on('click', '.music', function() {
        $('div').removeClass('active');
        var url = $(this).attr('data-href');
        url = url.substr(9, 11);
        $('#player').attr('src', "http://www.youtube.com/embed/" + url + "?enablejsapi=1&autoplay=1");
        $(this).addClass('active');
        $('.current-song-info').empty().append('Şu an oynatılan: ' + $(this).attr('data-title'));
    });

    $('body').on('keypress', '#key', function(e) {
	// when pressed enter key
        if (e.which == 13) {
            // send xml http request
            sendAjax();
        }
    });

    $('body').on('click', '#key', function() {
        $(this).css('border', 'none');
        $(this).css('color', '#d35400');
    });

    $('.resultList').slimScroll({
        height: '500px'
    })

});

function sendAjax() {
    $('.resultList').empty();
    var key = $('#key').val();
    console.log(key);
    $.ajax({
        "type": "POST",
        "url": "/search",
        "data": "q=" + key,
        beforeSend: function() {
            $('.main-search-screen').css('display', 'none');
            $('.search-result').css('display', 'block');
            $("#loader").modal({
                escapeClose: false,
                clickClose: false,
                showClose: false
            });
            $('.modal').css('padding', '0');
        },
        success: function(result) {
            $.modal.close();


            for (var i = 0; i < result.length; i++) {
                $('.resultList').append("<div class='music hvr-fade' onClick='playVideo()' data-title='" + result[i].title + "' data-href='" + result[i].href + "''><img class='song-icon' src='img/circular263.png'><span class='title'>" + result[i].title + "</span></div><div style='clear:both'></div>");
            }



        },
        error: function() {
            $('.resultList').empty().append('fak yu');
        }
    });
}

var searchFocus = function() {
    $('#key').css('background-color', '#e74c3c');
    $('.mainNavbar').css('background-color', '#ececec');
    $('.mid').css('display', 'none');
    setTimeout(function() {
        $('#key').css('background-color', 'white');
        $('.mainNavbar').css('background-color', '#f1c40f');
        $('.mid').css('display', 'block');
    }, 500);



}

var replacer = function(text) {
	text = text.toLowerCase();
	text = text.replace("ğ","g");
	text = text.replace("ş","s");
	text = text.replace("ç","c");
	text = text.replace("ö","o");
	text = text.replace("ü","u");
	text = text.replace("ı","i");
	return text;
}

var tag = document.createElement('script');
var temporary;
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        display: 'none',
        videoId: 'M7lc1UVf-VE'
    });
}

function playVideo() {
    player.playVideo();
    if ($.cookie('pause')) {
        $('.current-song-info').empty().append($.cookie('paused_song'));
    }
}

function pauseVideo() {
    player.pauseVideo();
    $.cookie('paused', true);
    $.cookie('paused_song', $('.current-song-info').html());
    $('.current-song-info').empty().append('Müzik duraklatıldı');
}
