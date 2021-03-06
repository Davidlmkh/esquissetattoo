var myLatlng = new google.maps.LatLng(45.798739, 4.831777);
var googlePlaceId = "ChIJr-qnlSvr9EcRCozPqLCmyDE";
var instaToken = "5418254715.1677ed0.205ea4ac026d49769a99dcc5d9d96cf5";
var service;
var inter;

var reviewShowed;

function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}

$(window).scroll(collapseNavbar);
$(document).ready(collapseNavbar);
$(document).ready( $('#reviews-container').hide());
// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $(".navbar-collapse").collapse('hide');
});

// Google Maps Scripts
var map = null;
// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);
google.maps.event.addDomListener(window, 'resize', function() {
    map.setCenter(myLatlng);
});

function getLastImages(data){
    var images = [];
    data.forEach(function(element) {
        if((element.type == 'image') && ( images.length < 4 ) && (element.images.standard_resolution !== null)){
            images.push(element);
        }
    });
    return images;
}

function bindInsta(data){
    images = getLastImages(data);
    $('#insta-1').attr('href', images[0].link);
    $('#insta-1').find('img')[0].src = images[0].images.standard_resolution.url;

    $('#insta-2').attr('href', images[1].link);
    $('#insta-2').find('img')[0].src = images[1].images.standard_resolution.url;

    $('#insta-3').attr('href', images[2].link);
    $('#insta-3').find('img')[0].src = images[2].images.standard_resolution.url;

    $('#insta-4').attr('href', images[3].link);
    $('#insta-4').find('img')[0].src = images[3].images.standard_resolution.url;
}

function init() {

    $('#rev1, #rev2, #rev3, #rev4').hide();

    $.ajax({
        type: "get",
        dataType: 'jsonp',
        url: "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + instaToken,
        success: function (data) {
            bindInsta(data.data);
        }
        ,error: function(err) {
            console.log('error');
        }
    })

    reviewShowed = $('#rev0');
    setSelector();
    inter = window.setInterval(function() {nextReview()}, 5000);

    var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 15,

        // The latitude and longitude to center the map (always required)
        center: myLatlng, // New York

        // Disables the default Google Maps UI components
        disableDefaultUI: true,
        scrollwheel: true,
        draggable: true,

        // How you would like to style the map.
        // This is where you would paste any style found on Snazzy Maps.
        styles: [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 10
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 29
            }, {
                "weight": 0.2
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 18
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 21
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "saturation": 36
            }, {
                "color": "#000000"
            }, {
                "lightness": 60
            }]
        }, {
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 19
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }, {
                "weight": 1.2
            }]
        }]
    };

    // Get the HTML DOM element that will contain your map
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');

    // Create the Google Map using out element and options defined above
    map = new google.maps.Map(mapElement, mapOptions);

    // Custom Map Marker Icon - Customize the map-marker.png file to customize your icon
    var image = 'img/tattoo-machine-map.png';
    var myLatLng = myLatlng;
    var beachMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image
    });

    service = new google.maps.places.PlacesService(map);

    this.showLoader();

    service.getDetails({
        placeId: googlePlaceId
    }, function (place, status) {
        this.hideLoader();
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.bindReviews(place.reviews);
        }
    });
}

function bindReviews(reviews){
    var namePrefix = "#review-name";
    var imgPrefix = "#review-image";
    var textPrefix = "#review-text";
    var datePrefix = "#review-date";

    for(var i = 0; i < 5; i++){
        var review = reviews[i];
        $(namePrefix + i).text(review.author_name);
        $(imgPrefix + i).attr("src", review.profile_photo_url);
        $(datePrefix + i).text("( "  + review.relative_time_description + " )");
        $(textPrefix + i).text('"' + review.text + '"');
    }
    $('#reviews-container').fadeIn('slow');
}

function showLoader(){
    $('#reviews-loader').fadeIn('fast');
}

function hideLoader(){
    $('#reviews-loader').fadeOut('fast');
}

function showReview(n){
    var i = parseInt(reviewShowed.get(0).id.substr(3, 1));
    if(i == n || n > 4 || n < 0){
        return;
    }
    reviewShowed.fadeOut(300, function(){
        var rev = '#rev' + n;
        reviewShowed = $(rev);
        setSelector();    
        $(rev).fadeIn(300);
    });
}

function setSelector(){
    var i = parseInt(reviewShowed.get(0).id.substr(3, 1));
    var sel = '#sel' + i;

    $('#sel0').removeClass('active');
    $('#sel1').removeClass('active');
    $('#sel2').removeClass('active');
    $('#sel3').removeClass('active');
    $('#sel4').removeClass('active');
    
    $(sel).addClass('active');
}

function nextReview(){
    var i = parseInt(reviewShowed.get(0).id.substr(3, 1));
    reviewShowed.fadeOut(300, function(){
        var nexti = i < 4 ? i + 1 : 0;
        var rev = '#rev' + nexti;
        reviewShowed = $(rev);
        setSelector();    
        $(rev).fadeIn(300);
    });

}
