/*eslint-env browser */
/*globals game_loop pause:true*/
$(document).ready(function(){
	
document.body.onmousedown = function() { return false; } //so page is unselectable

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	var mx, my;

	//Global map
	var map;
	
	//Tool for creating map
	var createTool;
	
	//Game object for score, turns, stages
	var game;
	
		

	/////////////////////////////////
	////////////////////////////////
	////////	GAME INIT
	///////	Runs this code right away, as soon as the page loads.
	//////	Use this code to get everything in order before your game starts 
	//////////////////////////////
	/////////////////////////////
	function init()
	{

	//////////
	////STATE VARIABLES
	
	//Creates a new game with number of players
	game = new Game(2);
	
	//Creates new map with size and view
	map = new Map(50, 50, 10, 10);
	
	//Creates square array and calls for environment
	map.createSquares();
	
	//Asks user for random creation
	//map.randomGenerateQuery();
	
	//Creates tool for creating map - only if not randomly generating
	if (!map.randomCreate) {
		createTool = new CreateTool();
		//Noah
	}
	
	
	
	
	
	//////////////////////
	///GAME ENGINE START
	//	This starts your game/program
	//	"paint is the piece of code that runs over and over again, so put all the stuff you want to draw in here
	//	"60" sets how fast things should go
	//	Once you choose a good speed for your program, you will never need to update this file ever again.

	if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 60);
	}

	init();	
	


	

	///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////
	////////	Main Game Engine
	////////////////////////////////////////////////////
	///////////////////////////////////////////////////
	function paint()
	{
	
		//Runs paint method of map
		map.paint()
		
		if (createTool.creationChange) {
			createTool.paintChange();
		}
		
	}////////////////////////////////////////////////////////////////////////////////END PAINT/ GAME ENGINE
	
	//Game class
	function Game(numPlayers) {
		this.playing = false;
		//this.turn;
		
		this.numPlayers = numPlayers;
		
	}
	
	//Map class
	function Map(width, height, viewWidth, viewHeight) {
		//Stores parent - whatever this is
		var parent = this;
		
		//Boolean for initial state
		this.settingUp = true;
		
		//Width and height of map
		this.width = width;
		this.height = height;
		
		//Boolean - keeps track of whether the map will randomly create
		this.randomCreate;
		
		this.randomGenerateQuery = function() {
			this.randomCreate = prompt("Would you like to random-generate the map?", "yes or no");
			
			if (this.randomCreate.toUpperCase() === "YES") {
				this.randomCreate = true;
			}
			else {
				this.randomCreate = false;
			}
		}
		
		//Array of squares
		this.squares = [];
		
		this.createSquares = function() {
			//Loops through map array and creates 2D array
			for (var i = 0; i < this.height; i++) {
				//Makes each element an array
				this.squares[i] = [];
				
				for (var j = 0; j < this.width; j++) {
					//Makes each element a square
					this.squares[i][j] = new Square(i, j);
					
					//Creates environment for each square
					this.squares[i][j].createEnvironment();

				}
			}
		}
		
		//this.createSquares();
		
		//Creates the view
		this.view = new View(viewWidth, viewHeight, parent);
		
		//Tells view to paint
		this.paint = function() {
			this.view.paint();
		}
		
		//Converts map to string
		this.toString = function() {
			var string;
			
			//Adds map width and height to the string
			string = 'width:' + map.width;
			string += ':height:' + map.height + ':';
			
			//Beginning of composition of map
			string += 'map:';
			
			for (var i = 0; i < map.height; i++) {
				for (var j = 0; j < map.width; j++) {
					switch(map.squares[i][j].contents) {
						case 'wall':
							string += 'w';
							break;
						default:
							//Includes ground
							string += 'g';
							break;
					}
				}
			}
			return string;
		}
		
		//Takes a string and applies it to the map
		this.fromString = function(string) {
			var parsed = string.split(":");
			//Search for map width and height
			map.width = Number(parsed[1]);
			map.height = Number(parsed[3]);
			var mapString = parsed[5];
			var index =0;
			for (var i = 0; i < map.height; i++) {
				for (var j = 0; j < map.width; j++,index++) {
					switch(mapString[index]) {
						case 'w':
							map.squares[i][j].contents = 'wall';
							break;
						default:
							//Includes ground
							map.squares[i][j].contents = 'ground';
							break;
					}
				}
			}
		}
		
		//Saves map to current mapNumber in localStorage
		this.saveMap = function() {
			localStorage.setItem("map" + localStorage.mapNumber, map.toString());
		}
		
		//Calls fromString on map filed under mapNumber in localStorage
		this.loadMap = function(mapNumber) {
			map.fromString(localStorage.getItem("map" + localStorage.mapNumber));
			//localStorage.mapNumber = Number(localStorage.mapNumber) + 1;
		}
	}
	
	function View(width, height, parent) {
		this.width = width;
		this.height = height;
		
		//Stores parent
		this.parent = parent;
		
		//Origin of view
		this.x = 0;
		this.y = 0;
				
		//Paint function of view
		this.paint = function() {
			//Loops through only the squares in the view
			//Starts with this.x,y and ends at this.width,height
			for (var i = this.y; i < this.y + this.height; i++) {
				for (var j = this.x; j < this.x + this.width; j++) {
					//Calls each square to paint
					map.squares[i][j].paint();
				}
			}
		}
		
		//Moving methods of view
		this.moveLeft = function() {
			if (this.x > 0) {
				this.x -= 1;
			}
		}
		this.moveRight = function() {
			if (this.x + this.width <= this.parent.width - 1) {
				this.x += 1;
			}
		}
		this.moveUp = function() {
			if (this.y > 0) {
				this.y -= 1;
			}
		}
		this.moveDown = function() {
			if (this.y + this.height <= this.parent.height - 1) {
				this.y += 1;
			}
		}
		
		//Zooming methods of view
		this.zoomIn = function() {
			//As long as view.width is greater than 5
			if (this.width > 5) {
				//Halves the view
				this.setWidth(Math.floor(this.width/2));
				this.setHeight(Math.floor(this.height/2));
			}
		}
		this.zoomOut = function() {
			if (this.width < map.width) {
				//Doubles the view
				this.setWidth(Math.floor(this.width*2));
				this.setHeight(Math.floor(this.height*2));
				
				//If the width is greater than the map width
				if (this.width > map.width) {
					this.setWidth(map.width);
					//Resets x
					this.x = 0;
				}
				//If the view extends past the edge of the map
				while (this.x + this.width > map.width) {
					this.x--;
				}
				//If the view height is greater than the map height
				if (this.height > map.height) {
					this.setHeight(map.height);
					//Resets y
					this.y = 0;
				}
				while (this.y + this.height > map.height) {
					this.y--;
				}
			}
		}
		
		//Set width and height functions
		this.setWidth = function(width) {
			this.width = width;
			//Resets square width automatically
			Square.width = w/this.width;
		}
		this.setHeight = function(height) {
			this.height = height;
			//Resets square height automatically
			Square.height = h/this.height;
		}
	}

	//Square class
	function Square(row, column) {
		//State values
		this.row = row;
		this.column = column;
		
		//Variable for the contents of each square
		this.contents = "nothing";
		
		//Method for randomly making the contents of each square
		this.createEnvironment = function() {
			this.contents = 'ground';
			
			if (map.randomCreate === true) {
				//Wall layout
				//Does not make walls around outer edge
				if (row > 0 && column > 0 && row < map.height - 1 && column <= (map.width - 1)) {
					//Creates a random number for each square-to be compared later
					var random = Math.random();
					
					//If there is no wall above and left
					if (this.noWallAround()) {
						if (random < 0.20) {
							this.contents = 'wall';
						}
					}
					//If there is a wall above or left
					else if (this.adjacentWall()) {
						//Only if there is no diagonal wall
						if (!this.diagonalBlock() && random < 0.80) {
							this.contents = 'wall';
						}
					}
					//If there is one block above or to the left
					else if (this.oneAdjacentBlock()) {
						//Only if there is no diagonal wall
						if (!this.diagonalBlock()) {
							if (random < 0.60) {
								this.contents = 'wall';
							}
						}
					}
				}
		    }
		};
		
		//Checks if there are no walls around
		this.noWallAround = function() {
			return (map.squares[row][column-1].contents != 'wall') && 
				   (map.squares[row-1][column].contents != 'wall'); 
		}
	
		//Checks if there is one block above or to the left
		this.oneAdjacentBlock = function() {
			return (map.squares[row][column-1].contents == 'wall') || 
				   (map.squares[row-1][column].contents == 'wall'); 
		}
		
		//Checks if there is a wall above or to the left
		this.adjacentWall = function() {
			return (column > 1 && map.squares[row][column-1].contents == 'wall' && map.squares[row][column-2].contents == 'wall') || 
			       (row > 1 && map.squares[row-1][column].contents == 'wall' && map.squares[row-2][column].contents == 'wall'); 
		}
		
		//Checks if there is a block above and to the left
		this.diagonalBlock = function() {
			return (map.squares[row-1][column-1].contents == 'wall'); 
		}
					
		
		//Paint method-paints each square based on contents
		this.paint = function() {
			if (this.contents == 'wall') {
				ctx.drawImage(Square.wallImage, (column - map.view.x)*Square.width, (row - map.view.y)*Square.height, Square.width, Square.height);
			}
			else if (this.contents == 'player') {
				ctx.drawImage(Square.playerImage, (column - map.view.x)*Square.width, (row - map.view.y)*Square.height, Square.width, Square.height);
			}
			else if (this.contents == 'baddie') {
				ctx.drawImage(Square.diamondImage, (column - map.view.x)*Square.width, (row - map.view.y)*Square.height, Square.width, Square.height);
			}
			else {
				ctx.drawImage(Square.floorImage, (column - map.view.x)*Square.width, (row - map.view.y)*Square.height, Square.width, Square.height);
			}
		}
	}
	
	//CreateTool class
	function CreateTool() {
		//Creates an array of possible creations
		this.creations = [];
		//Pushes in possible creations
		this.creations.push('ground');
		this.creations.push('engineer');
		this.creations.push('base');
		this.creations.push('turret');
		this.creations.push('generator');
		this.creations.push('soldier');
		this.creations.push('commando');
		this.creations.push('sniper');
		this.creations.push('elite');
		
		//currentCreation begins with the first
		this.currentCreation = 0;
		
		this.create = function(row, column) {
			//Sets square's contents to the current creation of createTool
			map.squares[row][column].contents = createTool.creations[createTool.currentCreation];
			
			switch(createTool.creations[createTool.currentCreation]) {
				case "engineer":
					//Make new object
					break;
				default:
					//Make a common object
					break;
			}
		}
		
		//Boolean for whether a creation has recently changed
		this.creationChange = false;
		
		//Changes the current creation
		this.changeCreation = function() {
			//If the currentCreation hasn't reached the end of the array yet
			if (createTool.currentCreation <= createTool.creations.length - 2) {
				createTool.currentCreation++;
			}
			//If the currentCreation has reached the end of the array
			else if (createTool.currentCreation === createTool.creations.length - 1) {
				createTool.currentCreation = 0;
			}

			this.creationChange = true;
		}
		
		this.paintChange = function() {
			if (count > 1) {
				ctx.fillStyle = 'black';
				ctx.fillText("You have changed the creation to " + createTool.creations[createTool.currentCreation],100,100);
				count--;
			}
			else if (count === 0) {
				count = 50;
				this.creationChange = false;
			}
			else {
				var count = 50;
			}
		}
	}

	function Unit() {
		this.cost;
		//Radius of announcements
		this.attackRadius;
		this.defenseRadius;
		this.announcements;
		this.range;
		this.drainCost;
		//Percentage health - default is 100%
		this.health = 100;
		//0 for aggressive, 1 for strategic, 2 for defensive
		this.mode = 0;
	
		this.paint;
		
		//Attack and defense arrays
		this.attack = [];
		this.defense = [];
		
		this.row;
		this.column;
		
	}
	
	function Engineer(row, column) {
		//Inherits properties and methods of unit
		this.prototype = new Unit();
		
		this.row = row;
		this.column = column;
		
		//Static variables that do not change
		this.cost = 2;
		this.attackRadius = null;
		this.defenseRadius = null;
		this.announcements = 0
		this.range = 1;
		this.drainCost = 1;
		
		this.attack[0] = 1;
		this.attack[1] = 0;
		this.attack[2] = 0;
		
		this.defense[0] = 0;
		this.defense[1] = 1;
		this.defense[2] = 2;
		
		
		this.move
		
	}
		
		
    // Statics
	//Sets up square width and height as properties of Square constructor
	Square.width = w/map.view.width;
	Square.height = h/map.view.height;
	
	//Creates images as properties of Square constructor
	Square.wallImage = new Image();
	Square.wallImage.src = "Pictures/wall.jpg";
	Square.floorImage = new Image();
	Square.floorImage.src = "Pictures/floor.jpg";
	Square.playerImage = new Image();
	Square.playerImage.src = "Pictures/Player.jpg";
	Square.diamondImage = new Image();
	Square.diamondImage.src = "Pictures/Diamond.jpg";
			
	
	////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////
	/////	MOUSE LISTENER 
	//////////////////////////////////////////////////////
	/////////////////////////////////////////////////////
	





	/////////////////
	// Mouse Click
	///////////////
	canvas.addEventListener('click', function (evt){
		//Only if map is setting up
		if (map.settingUp) {
			//Cycles through map's view for i and j
			for (var i = map.view.y; i < map.view.y + map.view.height; i++) {
				for (var j = map.view.x; j < map.view.x + map.view.width; j++) {
					//Clicker-sensitive - if mouse is within the parameters of square i and j
					//Mouse must be within column number of square widths - adjusted for map.view
					if (mx > (map.squares[i][j].column * Square.width) - (map.view.x * Square.width)
					&& mx < (map.squares[i][j].column * Square.width + Square.width) - (map.view.x * Square.width)) {
					
						if (my > (map.squares[i][j].row * Square.height) - (map.view.y * Square.height)
						&& my < (map.squares[i][j].row * Square.height + Square.height) - (map.view.y * Square.height)) {
							createTool.create(i, j);
						}
					}
				}
			}
		}
		
	      
	}, false);

	
	

	canvas.addEventListener ('mouseout', function(){pause = true;}, false);
	canvas.addEventListener ('mouseover', function(){pause = false;}, false);

      	canvas.addEventListener('mousemove', function(evt) {
        	var mousePos = getMousePos(canvas, evt);

		mx = mousePos.x;
		my = mousePos.y;

      	}, false);


	function getMousePos(canvas, evt) 
	{
	        var rect = canvas.getBoundingClientRect();
        	return {
          		x: evt.clientX - rect.left,
          		y: evt.clientY - rect.top
        		};
      	}
      

	///////////////////////////////////
	//////////////////////////////////
	////////	KEY BOARD INPUT
	////////////////////////////////


	

	window.addEventListener('keydown', function(evt){
		var key = evt.keyCode;
		
		//During setting up
		if (map.settingUp) {
			//On certain key press
			if (key === 32) {
				createTool.changeCreation();
			}
		}
			
			
		
		//Map-changing keys
		//Left
		if (key === 74 && map.view.x > 0) {
			map.view.moveLeft();
		}
		//Right
		else if (key === 76 && map.view.x + map.view.width <= map.width - 1) {
			map.view.moveRight();
		}
		//Up
		else if (key === 73 && map.view.y > 0) {
			map.view.moveUp();
		}
		//Down
		else if (key === 75 && map.view.y + map.view.height <= map.height - 1) {
			map.view.moveDown();
		}
		//Zoom in
		else if (key === 61) {
			map.view.zoomIn();
		}
		//Zoom out
		else if (key === 173) {
			map.view.zoomOut();
		}
		/*
		else if (key == 13) {
			map.view.width = 10;
			map.view.height = 10;
			
			Square.width = Square.width*2;
			Square.height = Square.height*2;
		}*/
		else if (key == 13) {
			map.saveMap();
			map.loadMap(1);
		}
		
		//alert(key);
		
	//j 74
	//l 76
	//i 73
	//k 75
	
	//w 87
	//a 65
	//s 83
	//d 68
	//Enter 13
	//+ 61
	//- 173
	
	//1 49
	//2 50
	
	//space 32
	
		
	}, false);




})
