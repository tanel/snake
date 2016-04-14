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

Snake.Point = function (x, y) {
    this.x = x;
    this.y = y;
};

Snake.Point.prototype.toString = function () {
    return this.x + "," + this.y;
};

Snake.Point.prototype.collides = function (arr) {
    var i;
    for (i = 0; i < arr.length; i = i + 1) {
        if (this.x === arr[i].x && this.y === arr[i].y) {
            return true;
        }
    }
    return false;
};

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

Snake.Config = function () {
    this.pixelSize = 1;
    this.boxSize = 20;
    this.snakeLength = 3;
};

Snake.State = function () {
    this.level = 1;
    this.score = 0;
    this.gameOver = false;
    this.intervalMillis = 1000;
    this.direction = Snake.Direction.Up;
};

Snake.Game = function (doc, wnd) {
    this.config = new Snake.Config();
    this.state = new Snake.State();
    doc.onkeydown = this.onkeydown.bind(this);
    this.wnd = wnd;
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
        console.log(x, y);
    }
    // top
    y = this.config.boxSize - 1;
    for (x = 0; x < this.config.boxSize; x = x + 1) {
        this.box.push(new Snake.Point(x, y));
        console.log(x, y);
    }
    // right
    x = this.config.boxSize - 1;
    for (y = this.config.boxSize - 2; y >= 0; y = y - 1) {
        this.box.push(new Snake.Point(x, y));
        console.log(x, y);
    }
    // bottom
    y = 0;
    for (x = this.config.boxSize - 2; x > 0; x = x - 1) {
        this.box.push(new Snake.Point(x, y));
        console.log(x, y);
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

    // Remove tail
    this.snake.pop();

    // Check if head collides with something
    if (head.collides(this.box)) {
        this.state.gameOver = true;
    }
    if (head.collides(this.snake)) {
        this.state.gameOver = true;
    }

    // FIXME: Check if head collides with treat

    // Set new head
    this.snake.unshift(head);

};

Snake.Game.prototype.placeTreat = function () {
    if (this.state.gameOver) {
        return;
    }
    // FIXME: get random location, but
    // FIXME: check for collision
};

Snake.Game.prototype.update = function () {
    this.initBox();
    this.initSnake();

    this.moveSnake();
    this.placeTreat();
};

Snake.Game.prototype.draw = function () {
    if (this.state.gameOver) {
        console.log('game over!');
        return;
    }
    // FIXME: box
    // FIXME: snake
    // FIXME: treat
    // FIXME: level
    // FIXME: score
};

Snake.Game.prototype.onkeydown = function (evt) {
    if (this.state.gameOver) {
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
        return;
    }
    console.log('pause');
    this.wnd.clearInterval(this.timer);
    delete this.timer;
};

Snake.Game.prototype.resume = function () {
    if (this.state.gameOver) {
        return;
    }
    console.log('resume');
    if (!this.timer) {
        this.timer = this.wnd.setInterval(this.loop.bind(this), this.state.intervalMillis);
    }
};

Snake.Game.prototype.printSnake = function () {
    var i = 0, s = "snake";
    for (i = 0; i < this.snake.length; i = i + 1) {
        s = s + " " + this.snake[i];
    }
    console.log(s);
};

Snake.Game.prototype.loop = function () {
    this.update();
    this.printSnake();
    this.draw();
};

document.game = new Snake.Game(document, window);
