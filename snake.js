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

Snake.Direction = {
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
};

Snake.Config = function () {
    this.pixelSize = 1;
    this.boxSize = 20;
};

Snake.State = function () {
    this.level = 1;
    this.score = 0;
    this.paused = false;
    this.intervalMillis = 1000;
    this.direction = Snake.Direction.Up;
};

Snake.Game = function (doc, wnd) {
    this.config = new Snake.Config();
    this.state = new Snake.State();
    doc.onkeydown = this.onkeydown;
    this.timer = wnd.setInterval(this.loop.bind(this), this.state.intervalMillis);
};

Snake.Game.prototype.update = function () {
    if (!this.box) {
        this.box = [];
        var x = 0, y = 0;
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
    }
    if (!this.treat) {
        // FIXME: place treat
    }
    if (!this.snake) {
        // FIXME: place snake at the bottom center
    }
};

Snake.Game.prototype.draw = function () {};

Snake.Game.prototype.onkeydown = function (evt) {
    switch (evt.keyCode) {
    case Snake.Direction.Up:
    case Snake.Direction.Down:
    case Snake.Direction.Left:
    case Snake.Direction.Right:
        console.log('new direction', evt.keyCode);
        this.direction = evt.keyCode;
        break;
    }
    return true;
};

Snake.Game.prototype.loop = function () {
    this.update();
    this.draw();
};

document.game = new Snake.Game(document, window);
