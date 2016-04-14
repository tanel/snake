default:
	@html-validator --file=index.html
	@jslint snake.js

deps:
	npm install html-validator-cli -g
	npm install jslint -g
