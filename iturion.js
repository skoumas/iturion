// Our lovely vars
var type = "movie";
var term = "*";
 
// MASONRY AREA
var $grid= $('.grid').masonry({ 
  itemSelector: '.item'
});

$grid.on('click', '.item', function() {
	if ($(this).hasClass('item-big')) {
		return;
		$(this).removeClass('item-big');
		$(this).find(".small").show();
		$(this).find(".big").hide();
		$grid.masonry();
		return;
	}
	$(".item").removeClass('item-big');
	$(this).addClass('item-big');
	$(".item").find(".small").show();
	$(".item").find(".big").hide();
	$(this).find(".small").hide();
	$(this).find(".big").show();
	$grid.masonry();
});

// DO a query on load - its free!
query();

// EVENTS
$("#search-icon").click(function(e) {
	$(this).html("<i class='fa fa-times'></i>");
	$("#search-text").toggle();
	$("#search-text").focus();
});

$(".selection").click(function(e){
	type = $(this).attr("data-type");
	$(".selection").removeClass("selection-active");
	$(this).addClass("selection-active");
	query();
})

$("body").on('click','.fav-button',function(e){
	addToFavorites($(this).attr("data-id"));
});

$("body").on('click','.fav-delete',function(e){
	removeFromFavorites($(this).attr("data-id"));
});

$("#search").change(function(e){
	term = $(this).val();
	query();
});

$('#search-text').keyup(throttle(function(){
	term = $("#search-text").val();
	query();
}));

$('#favorites-icon').click(function() {
	$("#favorites").slideToggle();
	$("#favorites-icon").toggleClass("icon-selected");
	var storage_favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	if (storage_favorites.length>0){
		$("#no-favorites").hide();
	} else {
		$("#no-favorites").show();
		return;
	}	
	loadFavorites();
});

// Main magic here
function query() {
	$("#loading").show();
	if (term=="") term="*" // Search for all when unsure
	$grid.masonry('remove' ,$(".item"))
 
	$.ajax({
	  url: "https://itunes.apple.com/search?term=" + term + "&entity=" + type,
	    dataType: "jsonp"
	})
	.done(function( data ) {

	 entries = (data.results.length);

 		for (var i=0; i<entries; i++) { //Using for var for now - don't judge me
			entry = data.results[i];
 
			if (entry.kind == "song") {
				price = entry.trackPrice;
			} else if (entry.kind == "music-video") {
				price = entry.trackPrice;
			} else if (entry.kind == "podcast") {
				price = entry.trackHdPrice;
			} else if (entry.kind == "feature-movie") {
				price = entry.trackHdPrice;
			}
			if (price==0){
				button_text = "Download";
				final_price = "Free!";
			} else {
				button_text = "Buy";
				final_price = price + "$";
			}

			if (entry.longDescription==undefined){
				longDescription = "";
			} else {
				longDescription = entry.longDescription;
			}

			meta = "Artist Name " + entry.artistName + ", " + entry.primaryGenreName + ", " + (entry.releaseDate);
			small_html = "<div class='small'><div class='image' style='background-image:url(" + entry.artworkUrl100 +")'/><br><h6>" + entry.trackName + "</h6>";
			big_html = "<div class='big'><div class='row'><div class='columns large-3'><img src='" + entry.artworkUrl100 +"'/><br><br><strong>" +  final_price + 
		  "</strong><br><br><div class='button btn btn-small'>" + button_text + "</div><br><div class='fav-button button btn btn-small btn-primary' data-id='" + entry.trackId + "'>" + "<i class='fa fa-heart'></i>" + "</div></div><div class='columns large-9'>" + 
			"<h4>" + entry.trackName + "</h4>" + 
			"<div class='longDesc'>" + longDescription + "<br><small>" + meta + "</small></div>" 
			+ "</div></div></div>";

			item = $("<div class='item'>" + small_html  +  "</div>" + big_html + "</div>");
 
			$grid.append(item).masonry( 'appended', item );
			$grid.masonry();
 
		}
		$("#loading").hide();
 	
	});
}

function loadFavorites() {
	//$("#favorites_inner").html("");
	var storage_favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	for (var i=0;i<storage_favorites.length;i++) {
		if ($(".favorite-item[data-id=" + storage_favorites[i] + "]").length>0) return;
		$.ajax({
	  	url: "https://itunes.apple.com/lookup?id=" + storage_favorites[i],
	    dataType: "jsonp"
		})
		.done(function(data) {
			entry = data.results[0];
			favorite_item = "<div>";
			small_html = "<div class='row'><div class='columns small-2'><div class='image' style='background-image:url(" + entry.artworkUrl100 +")'/></div><div class='columns small-9'>" + entry.trackName + "</div><div class='columns small-1'><a data-id='" + entry.trackId + "' class='fav-delete fa fa-times'></a></div></div>";
			item = $("<div class='favorite-item' data-id=" + entry.trackId + ">" + small_html  +  "</div></div>");
			$("#favorites_inner").append(item);
		});
	}
}

function addToFavorites(id) { 
	var storage_favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	for (var i=0;i<storage_favorites.length;i++) {
		if (storage_favorites[i] == id) {
			toastr.info("Already in your favorites!");
			return;
		}
	}
	storage_favorites.push(id);
	localStorage.setItem('favorites', JSON.stringify(storage_favorites));
	toastr.info("Added to your favorites!");
	loadFavorites();
}

function removeFromFavorites(id) {
	var storage_favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	for (var i=0;i<storage_favorites.length;i++) {
		if (storage_favorites[i] == id) {
			storage_favorites.splice(i,1);
			$(".favorite-item[data-id=" + id + "]").remove();
			localStorage.setItem('favorites', JSON.stringify(storage_favorites));
			toastr.info("Removed from your favorites!");
			return;
		}
	}

}

/* THIRD PARTY - Too bored to code them */
/* Timer Function used for the input */
function throttle(f, delay){
    var timer = null;
    return function(){
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = window.setTimeout(function(){
            f.apply(context, args);
        },
        delay || 500);
    };
} 