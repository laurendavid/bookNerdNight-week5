var bookApp = {};
// Books
bookApp.key = 'Rv4mTdOExNkC9WBmZLxEwA'; // Goodreads API key
bookApp.endpoint = 'https://www.goodreads.com/book/title.xml';
bookApp.bookTitles = 'https://sheetsu.com/apis/fd4e89d2/'; // My Sheetsu API
//LCBO
bookApp.lcboKey = 'MDo0MDFlNTk3ZS1kNmIxLTExZTUtYjU5My1lYjNlNWM1NzExZTc6bXFhSkNpSlQ0aG9vanQyckhRQmdnZjNpaktBMjlUT0VNVWtZ'; // LCBO API key

bookApp.wineList = [];

// Get book title from Sheetsu API category and randomize it (one book result)
bookApp.getSheetsu = function(mood) {
	$.ajax({
		url: bookApp.bookTitles + '/column/' + mood,
		dataType: 'json',
		method: 'GET'
	}).then(function(res) {
		console.log(res); // using book data select one at random
		var randomBook = Math.random() * res.result.length;
		console.log(randomBook);
		var randomTheBook = Math.floor(randomBook);
		console.log(randomTheBook);
		var randomBookResult = (res.result[randomTheBook]);
		// Promise below
		bookApp.getInfo(randomBookResult);
	});
}

// Get information from Goodreads and LCBO
bookApp.getInfo = function(random) {
	// Goodreads
	bookApp.goodreads = $.ajax({
		url: 'http://proxy.hackeryou.com', // Send the initial request through the HY proxy API because the endpoint returns XML. We need to mask the URL through another.
		dataType: 'json',
		method: 'GET',
		data: { // This is where we pass in info regarding the endpoint we want to use. 
			reqUrl: bookApp.endpoint, // API endpoint 
			params: { // act as a query string ie. data property in jquery
				key: bookApp.key,
				title: random
			},
			xmlToJSON: true
		}
	}).then(function(res) {
		console.log(res);
		bookApp.displayInfo(res.GoodreadsResponse);
	});

	// LCBO
	bookApp.lcbo = $.ajax({
		url: 'https://lcboapi.com/products?access_key=' + bookApp.lcboKey,
		headers: { 'Authorization': 'token' + bookApp.lcboKey },
		method: 'GET',
		dataType: 'json',
		data: {
			format: 'json',
			per_page: 50,
			q: 'wine'
		}
	}).then(function(wineData) {
		console.log(wineData);
		bookApp.wineList = wineData.result;
		console.log(bookApp.wineList);
		var redOrWhite = $('input[name=boozeCategory]:checked').val();
		bookApp.wineSorter(redOrWhite);
	});
};

// Filter the 50 wine results by red or white 
bookApp.wineSorter = function(redOrWhite) {
	console.log(bookApp.wineList);
	for(i = 0; i < bookApp.wineList.length; i = i + 1) {
		if(bookApp.wineList[i].secondary_category === redOrWhite) {
			// code here only corresponds to red wines
			var name = bookApp.wineList[i].name; 
			var wineImage = bookApp.wineList[i].image_url;
			var wineStyle = bookApp.wineList[i].style;
			var tastingNote = bookApp.wineList[i].tasting_note;
			bookApp.displayWine(wineImage, name, wineStyle, tastingNote);
		} else if(bookApp.wineList[i].secondary_category === redOrWhite) {
			// code here only corresponds to white wines (NOT red wines)	
			var name = bookApp.wineList[i].name; 
			var wineImage = bookApp.wineList[i].image_url;
			var wineStyle = bookApp.wineList[i].style;
			var tastingNote = bookApp.wineList[i].tasting_note;
			bookApp.displayWine(wineImage, name, wineStyle, tastingNote);
		}
	}
	// right now displaying 1 bottle of wine but needs to be random
};

// Display book and wine data on the page
bookApp.displayInfo = function(books) {
	console.log('yay');
	// Display book
	var cleanup = function(string) {
		return string.replace(/&lt;\/*[a-z]*&gt;/g, " ").replace(/&amp;/g, "&");
	}

	// var bookImage = books.book.image_url;
	// var string = "https://d.gr-assets.com/books/1358751325m/144173.jpg";
	// ​
	// function findLetter(substring, string) {
	//   var a = [], i = -1;
	//   while((i = string.indexOf(substring, i+1)) >=0) a.push(i);
	//   var secondLetterIndex = a[1];
	//   return secondLetterIndex;
	// }
	// ​
	// var mIndex = findLetter('m', string);
	// console.log(mIndex);
	// ​
	// var wordArray = string.split("");
	// ​
	// var updatedString = wordArray.map(function(val, i) {
	// 	if (i === mIndex) {
	// 		return val = 'l'
	// 	} else {
	// 		return val
	// 	}
	// }).join('');
	// ​
	// console.log(updatedString);
	// do I replace string with bookImage? 

	var openLibraryCover = 'http://covers.openlibrary.org/b/isbn/' + books.book.isbn + '-L.jpg';
	var image = $('<img class="cover">').attr('src', openLibraryCover);
	var title = $('<h2>').addClass('title').html(cleanup(books.book.title));
	var author = $('<h2>').addClass('author').text(cleanup(books.book.authors.author.name));
	var description = $('<p>').addClass('describe').text(cleanup(books.book.description));
	// Build the div and display the book cover, title, author, description on the page
	var eachBook = $('<div>').append(image, title, author, description);
	$('#bookInfo').html(eachBook);
};

bookApp.displayWine = function(image, name, style, tasting_note) {
	// Display Wine: image, name, style, tasting note
	var winePic = $('<img class="winePic">').attr('src', image);
	var wineTitle = $('<h2>').addClass('wineName').text(name);
	var wineDescribe = $('<h2>').addClass('wineDescribe').text(style);
	var wineTaste = $('<p>').addClass('describe').text(tasting_note);
	var eachWine = $('<div>').append(winePic, wineTitle, wineDescribe, wineTaste);
	$('#wineInfo').html(eachWine);
};

// Start it up and keep as little as possible in our document ready
bookApp.init = function() {
	$.when(bookApp.goodreads, bookApp.lcbo)
		.done(function(d1, d2) {console.log(d1, d2);})
		.fail(function(err) {console.log(err);})
};

$(function() {
	// Radio button click styling
	$('.bookType label').on('click', function() {
		$(this).addClass('selected');
		$(this).siblings('.bookType label').removeClass('selected');
	}); // End of bookType radio button click styles

	$('.booze label').on('click',  function() {
		$(this).addClass('selected');
		$(this).siblings('.booze label').removeClass('selected');
	}); // End of booze radio button click styles

	// On form submit send get request to Goodreads and LCBO to return random selection (one book, one bottle of wine)
	$('form').on('submit', function(e) {
		e.preventDefault();
		$('#bookInfo').empty();
		$('#wineInfo').empty();
		var bookMood = $('input[name=bookCategory]:checked').val();
		bookApp.getSheetsu(bookMood);
		console.log(bookApp.wineList);
	});

	bookApp.init();

});

