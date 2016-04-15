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
    this.pixelSize = 20;
    this.boxSize = 20;
    this.snakeLength = 3;
    this.levelIntervalTicks = 20;
    this.levelIncreaseMillis = 100;
    this.minimumLoopIntervalMillis = 300;
};

// Initial game state
Snake.State = function () {
    this.level = 1;
    this.score = 0;
    this.gameOver = false;
    this.loopIntervalMillis = 500;
    this.direction = Snake.Direction.Up;
    this.ticks = 0;
    this.lastKeyTick = 0;
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
    for (i = 0; i < arr.length; i = i + 1) {
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

    // Force first loop, to make game more responsive at first
    this.loop();
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
    }
    return shift;
};

Snake.Game.prototype.moveSnake = function () {
    // Calculate new head
    var head = new Snake.Point(this.snake[0].x, this.snake[0].y),
        shift = this.calculateShift();
    head.x = head.x + shift.x;
    head.y = head.y + shift.y;

    // Check if head collides with treat
    if (head.collides([this.treat])) {
        // Leave tail in place, as treat was eaten
        // Give score, according to level
        this.state.score = this.state.score + this.state.level;
        delete this.treat;
    } else {
        // Remove tail, as treat was not eaten
        this.snake.pop();
    }

    // Check if head collides with box
    if (head.collides(this.box)) {
        this.state.gameOver = true;
        return;
    }

    // Check if head collides with snake itself
    if (head.collides(this.snake)) {
        this.state.gameOver = true;
        return;
    }

    // Set new head
    this.snake.unshift(head);

};

// http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
Snake.Game.prototype.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Snake.Game.prototype.placeTreat = function () {
    if (this.treat) {
        return;
    }
    var x = 0, y = 0, treat = null;
    while (!this.treat) {
        x = this.getRandomInt(1, this.config.boxSize - 1);
        y = this.getRandomInt(1, this.config.boxSize - 1);
        treat = new Snake.Point(x, y);
        if (!treat.collides(this.snake) && !treat.collides(this.box)) {
            this.treat = treat;
        }
    }
};

Snake.Game.prototype.update = function () {
    this.initBox();
    this.initSnake();

    if (this.state.paused) {
        return;
    }

    if (this.state.gameOver) {
        return;
    }

    this.placeTreat();

    this.moveSnake();

    this.increaseLevel();
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
    var i = 0,
        id = null,
        div = null,
        existing = this.doc.getElementsByClassName('snake'),
        requiredIDs = {};
    // lookup required cells
    for (i = 0; i < this.snake.length; i = i + 1) {
        requiredIDs[this.cellID(this.snake[i].x, this.snake[i].y)] = true;
    }
    // check existing cells
    for (i = 0; i < existing.length; i = i + 1) {
        // if the cell is required, leave it as is.
        // else, "delete" it
        if (!requiredIDs[existing[i].id]) {
            div = this.doc.getElementById(existing[i].id);
            div.className = 'cell';
        } else {
            // mark it as not missing
            delete requiredIDs[existing[i].id];
        }
    }
    // draw missing cell(s)
    for (id in requiredIDs) {
        if (requiredIDs.hasOwnProperty(id)) {
            div = this.doc.getElementById(id);
            div.className = 'cell snake';
        }
    }
};

Snake.Game.prototype.drawTreat = function () {
    if (!this.treat) {
        return;
    }
    var div = this.doc.getElementById(this.cellID(this.treat.x, this.treat.y));
    div.className = 'cell treat';
};

Snake.Game.prototype.stateDescription = function () {
    if (this.state.gameOver) {
        return "GAME OVER";
    }
    if (this.state.paused) {
        return "PAUSED";
    }
    return "";
};

Snake.Game.prototype.drawHUD = function () {
    this.doc.getElementById("level").innerHTML = this.state.level;
    this.doc.getElementById("score").innerHTML = this.state.score;
    this.doc.getElementById("state").innerHTML = this.stateDescription();
};

Snake.Game.prototype.draw = function () {
    this.drawHUD();

    if (this.state.gameOver) {
        return;
    }

    this.drawGrid();

    this.drawBox();

    this.drawSnake();

    this.drawTreat();
};

Snake.Game.prototype.onkeydown = function (evt) {
    if (this.state.gameOver) {
        return;
    }
    if (this.state.lastKeyTick == this.state.ticks) {
        // Dont allow multiple keys in same tick
        return;
    }
    var code = evt.keyCode;
    if ((Snake.Direction.Up === code && Snake.Direction.Down !== this.state.direction)
            || (Snake.Direction.Down === code && Snake.Direction.Up !== this.state.direction)
            || (Snake.Direction.Left === code && Snake.Direction.Right !== this.state.direction)
            || (Snake.Direction.Right === code && Snake.Direction.Left !== this.state.direction)) {
        this.state.direction = code;
        this.state.lastKeyTick = this.state.ticks;
    } else if (Snake.KeyCode.Pause === code) {
        this.state.paused = true;
    } else if (Snake.KeyCode.Resume === code) {
        this.state.paused = false;
    }
    return true;
};

Snake.Game.prototype.increaseLevel = function () {
    this.state.ticks = this.state.ticks + 1;
    if (this.state.ticks < this.config.levelIntervalTicks) {
        return;
    }

    this.state.ticks = 0;
    this.state.lastKeyTick = 0;

    this.state.level = this.state.level + 1;

    // Set new loop interval, but not less than n millis
    this.state.loopIntervalMillis = this.state.loopIntervalMillis - this.config.levelIncreaseMillis;
    if (this.state.loopIntervalMillis < this.config.minimumLoopIntervalMillis) {
        this.state.loopIntervalMillis = this.config.minimumLoopIntervalMillis;
    }
};

Snake.Game.prototype.loop = function () {
    this.update();
    this.draw();
    this.wnd.setTimeout(this.loop.bind(this), this.state.loopIntervalMillis);
};

// Start game
document.game = new Snake.Game(document, window);
