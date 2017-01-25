// require packages
const fs = require('fs');
const http = require('http');
const Random = require('random-js');
const request = require('request');
const Twit = require('twit');
const webshot = require('webshot');

// initiate package settings
const r = new Random();
const T = new Twit({
  consumer_key:         process.env.TWITTER_KEY,
  consumer_secret:      process.env.TWITTER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_TOKEN_SECRET,
});

const stream = T.stream('user', {replies: 'all'});
const apikey = process.env.TROVE_API_KEY;

// create server
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Trove Recipes Bot\nThis is not the app you are looking for\nGo to <a href="https://twitter.com/recipe_trove">@recipe_trove</a>');
}).listen(8010);

stream.on('uncaughtException', (err) => {
	console.log(`## exception with Twitter stream ## \n ${err}`)
})

stream.on('error', (err) => {
	console.log(`## error with Twitter stream ## \n ${err}`)
})

stream.on('tweet', function(tweet){
	var text = tweet.text;
	var name = text.slice(0,13).toLowerCase();

	// only respond to @s, not mentions
	if (name === '@recipe_trove') {
		var searchTerm = text.slice(14);
		var user = tweet.user.screen_name;
		// use tweet id_str (not id)
		var currentId = tweet.id_str;
		// make sure bot doesn't respond to self (to avoid an infinite loop)
		if (user !== 'recipe_trove') {
			// respond
			console.log(`got query ${searchTerm}`)
			getRecipes(searchTerm, user);
			// update last tweet ID
			setLast(currentId);			
		};
	}
});

// ****** fallover
// whenever we (re)connect to Twitter, check for any mentions since we last responded
stream.on('connected', function(response){
	// Get the last tweet id to which we responded
	fs.readFile('lastId.txt', (err, data) => {
		if (err) {
			console.log('### Twitter reconnection error ###');
			console.log(err);
		}
		var lastTweet = data.toString();
		getMentions(lastTweet);
	});
});

function getMentions(id) {
	// create empty array
	var replies = [];
	// get mentions since the lastId
	T.get('statuses/mentions_timeline', {since_id: id, include_entities: false}, function(err, data, response) {
		if (data.length > 0) {
			for (i in data) {
				var currentId = data[i].id_str;					
				var tweet = data[i].text;
				var name = tweet.slice(0,13).toLowerCase();
				// only respond to @s, not mentions
				if (name === '@recipe_trove') {
					var searchTerm = tweet.slice(14);
					var user = data[i].user.screen_name;
					// trigger a reply
					getRecipes(searchTerm, user);
				};
			};
			// push every ID to an array
			replies.push(currentId);				
			// set new 'lastId' using the biggest (i.e. latest) ID
			// sort descending using a compare function 
			replies.sort(function(a,b){return b-a});
			// get biggest number
			var newId = replies[0];							
			setLast(newId);
		} else {
			console.log("no new tweets");
		}
	});
};
// ****** end fallover

function setLast(id){
	// write it to file so we're up to date if the script falls over
	fs.writeFile('lastId.txt', id);
};

function getRecipes(searchTerm, user) {
	// encode anything in searchTerm that's not a letter or number as a space (%20)
	searchTerm = searchTerm.replace(/\W/g, "%20");
	request(`http://api.trove.nla.gov.au/result?key=${apikey}&encoding=json&zone=newspaper&include=articletext&n=100&q=recipe%20${searchTerm}`, (err, resp, body) => {
		if (err) {
			console.error(`** error requesting from Trove API ** \n ${err})`);
			tryAgainMessage(searchTerm, user);
		}
		var result;
		try {
			result = JSON.parse(body);
		} catch (err) {
			console.error(`## JSON parsing error ## \n Query was: ${searchTerm} \n response body below... \n ${body}`);
		}
		if (typeof result !== "undefined") {
			const articles = result.response.zone[0].records.article;
			try {
				// put relevant articles in an array
				var articleArray = [];
				articles.forEach((article) => {
					if (article.relevance.score > 1.5 && article.articleText) {
						articleArray.push(article);
					}
				});
				// pick a recipe
				var recipe = r.pick(articleArray);
				// clear the array
				articleArray = [];
				// save html string as a 'screenshot' image
				const options = {windowSize: {width: 320, height: 'all'}, shotSize: {width: 'all', height: 'all'}, siteType: 'html', defaultWhiteBackground: true};
				const text = `${recipe.articleText}<p style="text-align:center"><strong>From ${recipe.title.value}</strong><br><br><img src="http://help.nla.gov.au/sites/default/files/trove_author/API-dark.png" alt="Powered by Trove"></p>`;
				webshot(text, 'pic.png', options, (err)=>{
					if (err) {
						console.error(`** webshot error **\n${err}`);
						// try again
						getRecipes(searchTerm, user);
					} else {
						sendTweet(searchTerm, user, recipe.troveUrl)
					}
				});			
			} catch (err) {
				console.error(`** error getting recipe **\n${err}`);
				tryAgainMessage(searchTerm, user);
			}
		} else {
			tryAgainMessage(searchTerm, user);
		}		
	});
};

// if no search results
function tryAgainMessage(searchTerm, user) {
	const face = r.pick(['😯','😞','😟','😢'])
	searchTerm = searchTerm.replace(/%20/g, " ");
	var msg = `@${user} Sorry, I couldn't find a recipe for ${searchTerm} ${face}`;
	T.post('statuses/update', { status: msg }, function(err, data, response) {
	})
};

// send the tweet
function sendTweet(searchTerm, user, url) {
	try {
		var image = fs.readFileSync('pic.png', { encoding: 'base64'});
		// clean up search term encoding, and capitalise first letter
		searchTerm = searchTerm.replace(/%20/g, " ");
		function capitalise (string){
	     return string.charAt(0).toUpperCase() + string.slice(1);
		};
		const ingredient = capitalise(searchTerm);
		const messages = [`I found @${user} the perfect ${ingredient} recipe - ${url}`, `Mmm, a delicious ${ingredient} recipe for @${user}... ${url}`, `Guess what @${user} is cooking tonight? ${ingredient}! ${url}`, `Hope you enjoy this ${ingredient} recipe, @${user}! - ${url}`];
		var msg = r.pick(messages);
		// first we must post the media to Twitter 
		T.post('media/upload', { media_data: image }, function (err, data, response) {
			 if (err){
			 	console.log(`### error uploading pic ### \n ${err}`);
			 	// try again
			 	getRecipes(searchTerm, user);
			 } else {
				// now we can reference the media and post a tweet (media will attach to the tweet) 
			 	var mediaIdStr = data.media_id_string;
				var params = { status: msg, media_ids: [mediaIdStr] }
				T.post('statuses/update', params, function (err, data, response) {
				  	if (err) {
				  		console.log(`### error posting to Twitter ### \n ${err}`);
				  		// try again
				  		getRecipes(searchTerm, user);
				  	} else {
				  		console.log(data.text)
				  	}
			  });			 	
			 }
		});
		image = null;
	} catch (err) {
		console.log(`### error on sendTweet ### \n ${err}`);
		getRecipes(searchTerm, user);
	}
};