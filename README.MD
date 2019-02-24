#FindFlix

My first "real" portfolio project running on Node and Express.

Built with: Node, Express, Bootstrap and jQuery

It's a site made to let the user sort netflix avilable movies and series by
imdb rating etc.

To achieve that I made a microservice called flixscraper to scrape all the movie
and series titles from netflix, and then match them with results from the public OMDB-API

All of this is necessary since Netflix doesn't have a public API. Also, this let's me
update whenever I want, which is set to auto-update every 2 hours.