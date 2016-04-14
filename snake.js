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
};

Snake.State = function () {
    this.level = 1;
    this.score = 0;
    this.paused = false;
    this.intervalMillis = 2000;
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
    var i = 0;
    this.snake = [];
    // from head to tail
    for (i = 3; i > 0; i = i - 1) {
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
    var head = new Snake.Point(this.snake[0].x, this.snake[0].y),
        shift = this.calculateShift();
    head.x = head.x + shift.x;
    head.y = head.y + shift.y;
    this.snake.unshift(head);
    this.snake.pop();
};

Snake.Game.prototype.placeTreat = function () {
    // FIXME: get random location, but
    // FIXME: check for collision
};

Snake.Game.prototype.update = function () {
    if (!this.box) {
        this.initBox();
    }
    if (!this.snake) {
        this.initSnake();
    } else {
        this.moveSnake();
    }
    if (!this.treat) {
        this.placeTreat();
    } else {
        this.replaceTreat();
    }
};

Snake.Game.prototype.draw = function () {
    // FIXME: box
    // FIXME: snake
    // FIXME: treat
    // FIXME: level
    // FIXME: score
};

Snake.Game.prototype.onkeydown = function (evt) {
    switch (evt.keyCode) {
    case Snake.Direction.Up:
    case Snake.Direction.Down:
    case Snake.Direction.Left:
    case Snake.Direction.Right:
        console.log('new direction', evt.keyCode);
        this.state.direction = evt.keyCode;
        break;
    case Snake.KeyCode.Pause:
        this.pause();
        break;
    case Snake.KeyCode.Resume:
        this.resume();
        break;
    }
    return true;
};

Snake.Game.prototype.pause = function () {
    console.log('pause');
    this.wnd.clearInterval(this.timer);
    delete this.timer;
};

Snake.Game.prototype.resume = function () {
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
