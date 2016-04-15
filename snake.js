/*global window, document */
"use strict";

/*
Your task is to create good old snake game where snake runs in a box and eats treats.

Technical requirements
•         Game must be written in pure javascript.
•         No third party libraries.
•         No canvas
•         Should work with latest Chrome. Other browsers support not required.

Game rules:
•         Each time snake eats the treat, new one will be created to random place.
          If snake wonders for too long (30 sec for instance) treat is repositioned.
•         Every now and then (interval should be configurable from code) snake gains speed,
          ie. level is increased.
•         when snake runs into a wall, game is over.
•         when snake bites itself, game is over.
•         snake starts from bottom center

Game features:
•         snake can move only one pixel at a time
•         pixel size is configurable (from code only)
•         box size is configurable (from code only)
•         game can be paused and resumed
•         progressive points - the higher the level, the higher points you get for eating
          the treat
•         display score
•         display level
*/

var Snake = {};

// Configuration
Snake.Config = function () {
    this.pixelSize = 30;
    this.boxSize = 20;
    this.snakeLength = 3;
    this.levelIncreaseIntervalMillis = 30000;
    this.minimumLoopIntervalMillis = 300;
};

// Initial game state
Snake.State = function () {
    this.level = 1;
    this.score = 0;
    this.gameOver = false;
    this.loopIntervalMillis = 1000;
    this.direction = Snake.Direction.Up;
};

// Const keycodes
Snake.Direction = {
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
};

Snake.KeyCode = {
    Pause: 80,
    Resume: 82,
};

// Point represents a point on the screen (x, y)
Snake.Point = function (x, y) {
    this.x = x;
    this.y = y;
};

Snake.Point.prototype.toString = function () {
    return this.x + "," + this.y;
};

Snake.Point.prototype.collides = function (arr) {
    var i;
    if (!arr || !arr.length) {
        throw "cannot check collision with empty array!";
    }
    for (i = 0; i < arr.length; i = i + 1) {
        if (!arr[i]) {
            throw "collision array contains null element!";
        }
        if (this.x === arr[i].x && this.y === arr[i].y) {
            return true;
        }
    }
    return false;
};

// Game engine
Snake.Game = function (doc, wnd) {
    this.config = new Snake.Config();
    this.state = new Snake.State();

    doc.onkeydown = this.onkeydown.bind(this);

    this.doc = doc;
    this.wnd = wnd;

    this.gridDrawn = false;
    this.boxDrawn = false;

    this.resume();
};

Snake.Game.prototype.initBox = function () {
    if (this.box) {
        return;
    }
    var x = 0, y = 0;
    this.box = [];
    // left
    x = 0;
    for (y = 0; y < this.config.boxSize; y = y + 1) {
        this.box.push(new Snake.Point(x, y));
    }
    // top
    y = this.config.boxSize - 1;
    for (x = 0; x < this.config.boxSize; x = x + 1) {
        this.box.push(new Snake.Point(x, y));
    }
    // right
    x = this.config.boxSize - 1;
    for (y = this.config.boxSize - 2; y >= 0; y = y - 1) {
        this.box.push(new Snake.Point(x, y));
    }
    // bottom
    y = 0;
    for (x = this.config.boxSize - 2; x > 0; x = x - 1) {
        this.box.push(new Snake.Point(x, y));
    }
};

Snake.Game.prototype.initSnake = function () {
    if (this.snake) {
        return;
    }
    var i = 0;
    this.snake = [];
    // from head to tail
    for (i = this.config.snakeLength; i > 0; i = i - 1) {
        this.snake.push(new Snake.Point(this.config.boxSize / 2, i));
    }
};

Snake.Game.prototype.calculateShift = function () {
    var shift = new Snake.Point(0, 0);
    switch (this.state.direction) {
    case Snake.Direction.Up:
        shift.y = 1;
        break;
    case Snake.Direction.Down:
        shift.y = -1;
        break;
    case Snake.Direction.Left:
        shift.x = -1;
        break;
    case Snake.Direction.Right:
        shift.x = 1;
        break;
    default:
        throw "invalid direction " + this.direction;
    }
    return shift;
};

Snake.Game.prototype.moveSnake = function () {
    if (this.state.gameOver) {
        return;
    }

    // Calculate new head
    var head = new Snake.Point(this.snake[0].x, this.snake[0].y),
        shift = this.calculateShift();
    head.x = head.x + shift.x;
    head.y = head.y + shift.y;

    // Check if head collides with treat
    if (head.collides([this.treat])) {
        // Leave tail in place, as treat was eaten
        // Give points, according to level
        this.state.points = this.state.points + this.state.level;
        console.log('treat picked up, total points', this.state.points);
    } else {
        // Remove tail, as treat was not eaten
        this.snake.pop();
    }

    // Check if head collides with something
    if (head.collides(this.box)) {
        this.state.gameOver = true;
    }
    if (head.collides(this.snake)) {
        this.state.gameOver = true;
    }

    // Set new head
    this.snake.unshift(head);

};

// http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
Snake.Game.prototype.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Snake.Game.prototype.placeTreat = function () {
    if (this.state.gameOver) {
        return;
    }
    if (this.treat) {
        return;
    }
    var x = 0, y = 0, treat = null;
    while (!this.treat) {
        x = this.getRandomInt(1, this.config.boxSize - 1);
        y = this.getRandomInt(1, this.config.boxSize - 1);
        treat = new Snake.Point(x, y);
        if (!treat.collides(this.snake)) {
            this.treat = treat;
        }
    }
};

Snake.Game.prototype.update = function () {
    this.initBox();
    this.initSnake();

    this.placeTreat();

    this.moveSnake();

    this.printSnake();
    this.printTreat();
};

Snake.Game.prototype.cellID = function (x, y) {
    return 'cell_' + x + '_' + y;
};

Snake.Game.prototype.drawGrid = function () {
    if (this.gridDrawn) {
        return;
    }
    var i = 0,
        j = 0,
        topMargin = this.doc.getElementById('hud').offsetHeight,
        div = null;
    for (i = 0; i < this.config.boxSize; i = i + 1) {
        for (j = 0; j < this.config.boxSize; j = j + 1) {
            div = this.doc.createElement('div');
            div.className = 'cell';
            div.style.width = this.config.pixelSize + 'px';
            div.style.height = this.config.pixelSize + 'px';
            div.style.left = (i * this.config.pixelSize) + 'px';
            div.style.top = topMargin + (j * this.config.pixelSize) + 'px';
            div.id = this.cellID(i, this.config.boxSize - j - 1);
            this.doc.body.appendChild(div);
        }
    }
    this.gridDrawn = true;
};

Snake.Game.prototype.drawBox = function () {
    if (this.boxDrawn) {
        return;
    }
    var i = 0,
        div = null,
        pt = null;
    for (i = 0; i < this.box.length; i = i + 1) {
        pt = this.box[i];
        div = this.doc.getElementById(this.cellID(pt.x, pt.y));
        div.className = 'cell box';
    }
    this.boxDrawn = true;
};

Snake.Game.prototype.drawSnake = function () {
    // FIXME: remove existing snake:
    var i = 0,
        div = null,
        pt = null;
    for (i = 0; i < this.snake.length; i = i + 1) {
        pt = this.snake[i];
        div = this.doc.getElementById(this.cellID(pt.x, pt.y));
        div.className = 'cell snake';
    }
};

Snake.Game.prototype.drawTreat = function () {
    // FIXME: remove existing treat, if its in a different location
    var div = this.doc.getElementById(this.cellID(this.treat.x, this.treat.y));
    div.className = 'cell treat';
};

Snake.Game.prototype.draw = function () {
    if (this.state.gameOver) {
        console.log('game over!');
        return;
    }

    this.drawGrid();

    this.drawBox();

    this.drawSnake();

    this.drawTreat();

    this.doc.getElementById("level").innerHTML = this.state.level;

    this.doc.getElementById("score").innerHTML = this.state.score;
};

Snake.Game.prototype.onkeydown = function (evt) {
    if (this.state.gameOver) {
        console.log("ignoring key, game is over");
        return;
    }
    var code = evt.keyCode;
    if ((Snake.Direction.Up === code && Snake.Direction.Down !== this.state.direction)
            || (Snake.Direction.Down === code && Snake.Direction.Up !== this.state.direction)
            || (Snake.Direction.Left === code && Snake.Direction.Right !== this.state.direction)
            || (Snake.Direction.Right === code && Snake.Direction.Left !== this.state.direction)) {
        console.log('new direction', evt.keyCode);
        this.state.direction = code;
    } else if (Snake.KeyCode.Pause === code) {
        this.pause();
    } else if (Snake.KeyCode.Resume === code) {
        this.resume();
    }
    return true;
};

Snake.Game.prototype.pause = function () {
    if (this.state.gameOver) {
        console.log('cannot pause, game is over');
        return;
    }
    console.log('pause');

    this.wnd.clearInterval(this.timer);
    delete this.timer;

    this.wnd.clearInterval(this.increaseLevelTimer);
    delete this.increaseLevelTimer;

};

Snake.Game.prototype.isPaused = function () {
    return !this.timer;
};

Snake.Game.prototype.resume = function () {
    if (this.state.gameOver) {
        console.log('cannot resume, game is over');
        return;
    }
    console.log('resume');

    if (!this.timer) {
        this.timer = this.wnd.setInterval(this.loop.bind(this), this.state.loopIntervalMillis);
    }

    if (!this.increaseLevelTimer) {
        this.increaseLevelTimer = this.wnd.setInterval(this.increaseLevel.bind(this), this.config.levelIncreaseIntervalMillis);
    }
};

Snake.Game.prototype.increaseLevel = function () {
    if (this.isPaused()) {
        console.log("will not increase level, game is paused");
        return;
    }
    if (this.state.gameOver) {
        console.log("will not increase level, game is over");
        return;
    }
    this.state.level = this.state.level + 1;
    delete this.timer;
    this.state.loopIntervalMillis = this.state.loopIntervalMillis - 100;
    if (this.state.loopIntervalMillis < this.config.minimumLoopIntervalMillis) {
        this.state.loopIntervalMillis = this.config.minimumLoopIntervalMillis;
    }

    console.log('new level', this.state.level);

    this.resume();
};

Snake.Game.prototype.loop = function () {
    this.update();
    this.draw();
};

// Debugging

Snake.Game.prototype.printSnake = function () {
    var i = 0, s = "snake";
    for (i = 0; i < this.snake.length; i = i + 1) {
        s = s + " " + this.snake[i];
    }
    console.log(s);
};

Snake.Game.prototype.printTreat = function () {
    if (!this.treat) {
        throw "no treat";
    }
    console.log("treat", this.treat);
};

// Start game
document.game = new Snake.Game(document, window);
