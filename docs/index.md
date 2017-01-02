# Recipe Trove

## What is Recipe Trove?

Recipe Trove is a Twitter bot that uses the [Trove Australia](http://trove.nla.gov.au) API.

## How do I use it?

Simply tweet an ingredient or dish at [@recipe_trove](https://twitter.com/recipe_trove) and it will do its best to reply with an appropriate recipe. **@recipe_trove** returns both a recipe in the form of a JPEG image, and a link to the original article in the Trove interface. Try it now by tweeting `@recipe_trove lamington`.

## How does it work?

@recipe_trove takes your query, adds the word 'recipe', and searches the digitised newspaper collection in Trove for articles. It then chooses at random from the top 100 most relevant results (if any), and returns the result. For best results, use a short query term. If you include any special characters they will be encoded as spaces. This includes qoutes (" or ), as well as question marks (?) and apostrophes ('). Remember that *everything* after `@recipe_trove` will be considered part of your query. If you want to talk about or mention the bot (rather than ask for a recipe), ensure that the `@recipe_trove` handle is not the first part of your tweet:

`@recipe_trove I love you, you're my favourite bot!` will result in a search query of `I%20love%20you%20%20you%20re%20my%20favourite%20bot%20`.
`I love you @recipe_trove, you're my favourite bot!` will be ignored by @recipe_trove, but instructive for your friends.

## How come @recipe_trove can't find a recipe for my query but if I search Trove I get heaps of results?

There are two main reasons for this.

1. The Trove API does not return everything that is available in the Trove web interface. @recipe_trove is restricted to searching newspaper articles (excluding not just books and other material, but also for example advertisements in newspapers). There are also some articles where `articleText` is not returned from an API call - notably the *Australian Women's Weekly* is one of these. If `articleText` can't be retrieved, the search will fail. This is why, for example, if you ask `@recipe_trove` for 'pizza' you won't get any results.

2. There is not 'recipes' collection on Trove, what we're searching is newspaper articles with the word 'recipe' in them. So as to increase the likelihood that the result will actually be a recipe, any result with a 'relevance' ranking of less than 1.5 is ignored. Sometimes this will include *every* result, some of which are actually recipes.

## These recipes are terrible - there are weird typos everywhere and I can't understand it.

Now you know why archivists and librarians sigh and roll their eyes when Business School types think they can 'just digitise it all' and not have to store original texts. The problem here is the [OCR](https://en.wikipedia.org/wiki/Optical_character_recognition) technology used in newspaper digitisation often struggles with old newsprint, smudged printing, and unusual characters. The text returned in the image is the text as recorded in Trove. The link to the actual scanned image often reveals (to humans) a much clearer result. That's why the National Library of Australia has a [volunteer text correction system](http://help.nla.gov.au/trove/digitised-newspapers/text-correction-guidelines). If you see something dodgy, click on the link and help correct it - future recipe searchers will thank you!

## Who made @recipe_trove and can I see the code?

The bot was made (and is hosted) by [Hugh Rundle](https://twitter.com/hughrundle). You can find the code in [the main directory of this GitHub repository](https://github.com/hughrun/recipe_trove). Feel free to fork it and make something else, or log an issue/send a pull request if you notice a problem with the bot.