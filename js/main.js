var offset = 145;
var rot = 0;
var lakes = [
    "img/helps/DSC_0074_008.JPG",
    "img/helps/DSC_0486_012.JPG"
];

function stopMedia() {
    //unload audio and video
    var $media = $('.playing');
    if ($media.length > 0) {
        var media = $media.get(0);
        media.pause();
        media.src = '';
        media.load();
        $media.removeClass('playing');
        $('.playingSound').removeClass('playingSound');
    }
}

function hidePlayer() {
    $('.audioDetails').animate({width: '0', 'padding-left': '0'}, function(){
        $('#audio').css({transform: "scale(0)"});
    }).css('opacity', 0);
    $('.audiominimize').hide();
    $('.audiomaximize').show();
    $('#audio h3 strong').text("nothing");
}

function playMedia(media, src, name) {
    $(media).attr('src', src);
    media.load();
    media.play();
    $('.playing').removeClass('playing');
    $(media).addClass('playing');
    log('playing '+src);
    $('#play').hide();
    $('#pause').show();
    $('#audio h3 strong').text(name);
    $('#audio').show().addClass("showall").css({transform: "none"});
    setTimeout(function(){
        $('.audioDetails').css({width: 'auto', 'padding-left': '5vh', 'opacity': 1});
    }, 500);
    $('.audiomaximize').hide();
    $('.audiominimize').show();
    var isVid = media.tagName.toLowerCase() === "video";
    if (!isVid) {
        if (typeof audioCtx === "undefined") {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            audioSource = audioCtx.createMediaElementSource(media);
            audioSource.connect(analyser);
            analyser.connect(audioCtx.destination);
        }
        analyser.fftSize = 32;
        analyser.minDecibels = -70;
        analyser.maxDecibels = -5;
        analyser.smoothingTimeConstant = 0.9;
        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);
        var requestId;
        fadeBGs(requestId, dataArray, analyser, bufferLength);
        $(audio).on('ended pause',function(){
            if (requestId) {
                window.cancelAnimationFrame(requestId);
                requestId = undefined;
            }
        });
    }
}

function fadeBGs(requestId, dataArray, analyser, bufferLength) {
    function draw() {
        analyser.getByteFrequencyData(dataArray);
        //split the dataArray into high mid and low
        var bass = dataArray.slice(0, bufferLength/4);
        var mid = dataArray.slice(bufferLength/4, bufferLength/2);
        var treb = dataArray.slice(bufferLength/2);
        bass = meanArray(bass)/512;
        mid = meanArray(mid)/255;
        treb = meanArray(treb)/90;
        $('#bgBass').css('opacity', bass);
        $('#bgMid').css('opacity', mid);
        $('#bgTreb').css('opacity', treb);
        requestId = requestAnimationFrame(draw);
    }
    draw();
}

function meanArray(arr) {
    var sum = 0;
    for( var i = 0; i < arr.length; i++ ){
        sum += parseInt( arr[i], 10 ); //don't forget to add the base
    }
    return sum/arr.length;
}

function drawGrad(requestId, dataArray, analyser, bufferLength) {
    var gradStart = "linear-gradient(90deg, ";
    var stopStart = "hsla(0,0%,";
    var stopMid = "%, 1) ";
    var stopEnd = "%";
    var gradEnd = ")";
    var gradStops = [];
    var grad = "";
    function draw() {
        gradStops = [];
        analyser.getByteFrequencyData(dataArray);
        dataArray.forEach(function(val, i){
            if (i > 0) {
                var o = String(stopStart);
                o += val/2.55;
                o += stopMid;
                o += (i / (bufferLength - 1))*100;
                o += stopEnd;
                gradStops.push(o);
            }
        });
        grad = gradStart;
        grad += gradStops.join(', ');
        grad += gradEnd;
        $('body').css('background-image', grad);
        console.log(grad);
        requestId = requestAnimationFrame(draw);
    }
    draw();
}

function pauseMedia(media) {
    media.pause();
    $(media).removeClass('playing');
    $('#pause').hide();
    $('#play').show();
}

function resumeMedia(media) {
    media.play();
    $(media).addClass('playing');
    $('#play').hide();
    $('#pause').show();
}

function log(message) {
    $('#log').html($('#log').html()+message+"<br>");
}

function keepAngleInRange(angleToUse) { // 0 <= x < 360
    var isNegative = angleToUse < 0;
    angleToUse = Math.abs(angleToUse);
    var divisor = Math.floor(angleToUse / 360);
    angleToUse -= divisor * 360; // remove 360 until it is in range

    if (isNegative)
        angleToUse = 0 - angleToUse;
    return angleToUse;
}

function spin() {
    log("spinning...");
    $('.front').removeClass("front");
    $('.contain').addClass('spinning');
    $('div section').each(function () {
        $(this).css("-webkit-transform", "rotate(" + rot + "deg)");
        $(this).css("transform", "rotate(" + rot + "deg) translateY(-182%) rotate(-"+(rot+360)+"deg)");
        if (rot === 0 || rot === 360) {
            $(this).addClass("front");
            enterSection($(this));
            //add the hash
            var id = $(this).attr("id");
            if(history.pushState) {
                history.pushState(null, null, '#'+id);
            } else {
                location.hash = '#myhash';
            }
            //highlight the nav bit
            $('nav .chosen').removeClass("chosen");
            $('nav a[href="#'+id+'"]').parent().addClass('chosen');
        }
        rot = rot + rotD;
        //rot = keepAngleInRange(rot);
    });
    $('section.front').one('transitionend', function(){
        $('.contain').removeClass('spinning');
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function initializeGallery() {
    var imagewraps = $('.imagewrap').length;
    var slicewidth = 100/imagewraps;
    $('.imagewrap').each(function(i){
        var left = i*slicewidth + "%";
        var right = 100-((i+1)*slicewidth) + "%";
        var src = $(this).find('img').attr('src');
        var image = "url('"+src+"')";
        $(this).css({
            "background-image": image,
            "top": left,
            "bottom": right
        });
        console.log(image);
    });
    $('.imagewrap').click(function(){
        $(this).toggleClass("full")
                .parent()
                .toggleClass('filled');
    });
}

function enterSection($section) {
    if ($section.attr('id') === "gallery") {

    } else if($section.attr('id') === "links") {
        setTimeout(function(){$("#links li").addClass("fall");},  1000);
    }
}

function sizeGallery($galleryImages) {
    log("initialize gallery");
    $galleryImages.each(function($image){
        var width = $(this).width();
        var height = $(this).height();
        console.log('width: '+width+', height: '+height);
        if (width < height){
            //this
            $(this).css('height', '100%');
            $(this).css('width', 'auto');
        } else {
            $(this).css('width', '100%');
            $(this).css('height', 'auto');
        }
    });
}

function makeGalleryOverlay(n) {
    var stops = [];
    for (var i=0; i<=n; ++i) {
        stops[i]=(100/n)*i;
    }
    var color1 = "transparent";
    var color2 = "rgba(255,255,255,0.5)";
    var color2 = "rgba(0,0,0,0.5)";
    var gradient = "linear-gradient(90deg";
    stops.forEach(function(stop){
        gradient += makeStop(color2, stop);
        gradient += makeStop(color1, stop);
    });
    gradient += ")";
    $('.galleryOverlay').css("background-image", gradient);
    function makeStop(color, pos) {
        return ", " + color + " " + pos + "%";
    }
    console.log("done gallery");
    console.log(gradient);
}

function colour() {
    $('div section').each(function () {
        $(this).css("background-color", "hsla(" + rot + ",100%,50%, 1)");
        rot = rot + rotD;
        rot = keepAngleInRange(rot);
    });
}

function gotoPage(link) {
    if ($(link).length !== 0) {
        var index = $(link).index();
        console.log(index);
        var prevrot = rot;
        rot = index * -rotD;
        spin();
    }
}

function goLeft() {
    log("pevious");
    gotoPage('#'+$('section').eq($('section.front').index() - 1).attr('id'));
}

function goRight() {
    log("next");
    var i = $('section.front').index() + 1;
    i = i === $('section').length ? 0 : i;
    gotoPage('#'+$('section').eq(i).attr('id'));
}

$(document).ready(function () {
    var $sections = $('section');
    var $links = $('nav a');
    var audio = $('#audio audio').get(0);
    var video = $('#videoel').get(0);
    rotD = 360 / $sections.length;
    log("loading...");
    if (window.location.hash){
        setTimeout(function(){
            $("nav a[href='"+window.location.hash+"']").click();
        }, 1000);
        $(window).on('hashchange', function(){
            $("nav a[href='"+window.location.hash+"']").click();
        });
    }else{
        $links.first().parent().addClass("chosen");
        spin();
    }
    $links.click(function (e) {
        e.preventDefault();
        setTimeout(function(){window.scrollTo(0, 1);},0);
        $(".chosen").removeClass("chosen");
        $(this).parent().addClass("chosen");
        //this needs to figure out the section to rotate to
        //index = $(this).parent().index();
        var link = $(this).attr('href');

        log($(this).text());
        gotoPage(link);

    });

    var n = 0;
    var url = lakes[n];
    $('#hell-p').css("background-image", "url(" + url + ")");

    $('#help').click(function () {
        log("help");
        var url = lakes[n];
        $('#hell-p').css("background-image", "url(" + url + ")");
        ++n;
        if (n === lakes.length) {
            n  =  0;
        }
    });

    $('.right,.splash').click(function () {
        goRight();
    });
    $('.left').click(function () {
        goLeft();
    });
    $('.contain').swipe({
        swipe: function(event, direction, distance, duration, fingerCount, fingerData){
            console.log('swipe');
            switch(direction) {
                case "left":
                    goRight();
                    break;
                case "right":
                    goLeft();
                    break;
            }
        },
        threshold : 20
    });
    //videos
    $('#video .videolink').click(function(e){
        e.preventDefault();
        var videoplayer = document.getElementById('videoplayer');
        videoplayer.src = $(this).data("source") + ".mp4";
        videoplayer.play();
        $('#video').addClass('playing');
        videoplayer.addEventListener('ended', function() {
            $('#video').removeClass('playing');
        });
    });
    $('#video-close').click(function(){
        var videoplayer = document.getElementById('videoplayer');
        $('#video').removeClass('playing');
        videoplayer.pause();
    });
    $('#fullscreen').click(function(){
        var videoplayer = document.getElementById('videoplayer');
        if(videoplayer.requestFullscreen) {
            videoplayer.requestFullscreen();
        } else if(videoplayer.mozRequestFullScreen) {
            videoplayer.mozRequestFullScreen();
        } else if(videoplayer.webkitRequestFullscreen) {
            videoplayer.webkitRequestFullscreen();
        } else if(videoplayer.msRequestFullscreen) {
            videoplayer.msRequestFullscreen();
        }
    });
    $('#videoplayer, #video-play-pause').click(function() {
        var videoplayer = document.getElementById('videoplayer');
        var $playpausebutton = $('#video-play-pause');
        if (videoplayer.paused) {
            $playpausebutton.removeClass('paused');
            videoplayer.play();
        } else {
            $playpausebutton.addClass('paused');
            videoplayer.pause();
        }
    });
    //choons
    $('.album li').click(function() {
        var src = $(this).data("source");
        var isVid = src.indexOf(".mp4") !== -1;
        if ($(this).hasClass("playingSound")) {
            $('.playingSound').removeClass('playingSound');
            stopMedia();
            hidePlayer();
        } else {
            $('.playingSound').removeClass('playingSound');
            stopMedia();
            if (isVid) {
                var media = video;
            } else {
                var media = audio;
            }
            var name = $(this).text();
            console.log(media);
            playMedia(media, src, name);
            $(this).addClass('playingSound');
        }
    });

    $('.openModal').click(function(e){
        e.preventDefault();
        $(this).closest('section').addClass("modalOpen");
    });
    $('.closeButton').click(function(e){
        e.preventDefault();
        $(this).closest('section').removeClass("modalOpen");
    });

    initializeGallery();

    var media;

    audio.addEventListener("timeupdate", function(){
        var right = (1 - (audio.currentTime/audio.duration)) * 100 + "%";
        $('#audio .progressbar-inner').css("right", right);
        media = audio;
    }, false);

    video.addEventListener("timeupdate", function(){
        var right = (1 - (video.currentTime/video.duration)) * 100 + "%";
        $('#audio .progressbar-inner').css("right", right);
        media = video;
    }, false);

    $('#pause').click(function(){
        pauseMedia(media);
    });
    $('#play').click(function(){
        resumeMedia(media);
    });
    $([audio, video]).on('ended', function() {
        stopMedia();
        hidePlayer();
    });

    $('.progressbar').click(function(click){
        //return as the serveer doesnt support this.
        //return;

        var ex = click.pageX;
        //get ex as a percentage between left and right pos of progress bar
        var norm = ex - $(this).offset().left;
        console.log(norm);
        var prop = norm/$(this).width();
        console.log(prop);
        var tim = Math.floor(prop * media.duration);
        console.log(media.duration);
        console.log(tim);
        //update currentTime
        media.pause();
        media.currentTime = tim;
        media.play();
    });
    $('.audiominimize').click(function(){
        $('.audioDetails').animate({width: '0', 'padding-left': '0'}).css('opacity', 0);
        $(this).hide();
        $('.audiomaximize').show();
    });
    $('.audiomaximize').click(function(){
        $('.audioDetails').css({width: 'auto', 'padding-left': '5vh', 'opacity': 1});
        $(this).hide();
        $('.audiominimize').show();
    });
    $('#contact textarea').focus(function(){
        $('#contact').removeClass('sending success error')
        if ($(this).text() === "Enter your communication here...") {
            $(this).text("");
        }
    });
    $('#contact form').submit(function(e){
        e.preventDefault();
        var m = $(this).serialize();
        $('#contact').addClass('sending');
        try {
            $.ajax({
                method: "POST",
                url: $(this).attr('action'),
                data: m,
                success: function() {
                    $('#contact').removeClass('sending error').addClass('success');
                },
                fail: function() {
                    $('#contact').removeClass('sending success').addClass('error');
                }
            });
        } catch(e) {
            $('#contact').removeClass('sending success').addClass('error');
        }
    })
    $('section').on('focus', function(e){
        $('nav a').eq($(this).index()).click();
    });
    $(window).keydown(function(e){
        switch (e.which){
            case 37:
                $('.left').click();
                break;
            case 39:
                $('.right').click();
                break;
        }

    });
    $('#contact textarea').keyup(function () {
        var len = $(this).val().length;
        if (len > 400) {
            $('#contact .photo').css('opacity', 1);
        } else {
            $('#contact .photo').css('opacity', len/400);
        }
    }).keydown(function(e) {
        e.stopPropagation();
    });

    $('#contact form').submit(function(e) {
        e.preventDefault();
        //alert("OK BOB");
        $(this).addClass('submitted');
        //wait a second, then clear it and remove the class

    });
});
