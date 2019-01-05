**Due to Twitter API changes this code no longer works and will not be updated**

# Recipe Trove

A Twitter bot that takes a query and responds with either a recipe from the National Library of Australia's **Trove** digitised newspaper archive, or a message saying nothing can be found.

Uses *webshot*, an awesome package that utilises Phantomjs to enable automated screenshots of websites. This can be a bit tricky to get right - on your own machine it should work pretty easily, but if you use Docker it won't work if you let **webshot** node package install Phantom for you. See *Dockerfile_example* - you'll end up with a pretty big file, but it will work.

## Dependencies

* nodejs
* Phantomjs
* random-js
* request
* twit
* webshot

## Installation

The easiest way to install is to install [Docker](https://www.docker.com/) and use the example Dockerfile.

1. Install [Docker](https://www.docker.com/)
2. Copy in your own API keys to the **Dockerfile**
3. `touch lastId.txt` in the directory where you have saved **recipes.js**.
4. Build your docker image and run it

## Demo

See [@recipe_trove](https://twitter.com/recipe_trove)

## License (MIT)

Copyright 2017 Hugh Rundle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
