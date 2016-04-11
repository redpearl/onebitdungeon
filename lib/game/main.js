ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.entities.player',
	'plugins.gamepads'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	level: [],
	img: new ig.Image( 'media/finalgraphics.png' ),
	imgPlayer: new ig.Image( 'media/yellowbox.png' ),
	imgExit: new ig.Image( 'media/redbox.png' ),
	imgKey: new ig.Image( 'media/bluebox.png' ),
	imgWall: new ig.Image( 'media/whitebox.png' ),
	
	beep: new ig.Sound('media/beep.*', false),
	playSound: false,
	soundPlaying: false,
	players: [],
	
	init: function() {
		ig.Sound.enabled = true;
		this.beep.loop = true;
		

		while(!this.mazeSolvable){
			this.generateMaze();
		}
	},

	generateMaze: function () {
		this.level = [];
		for (var i = 0; i < 64; i++) {
			if(Math.random() > 0.3){
				this.level.push(1);
			} else {
				this.level.push(0);
			}
		};
		this.placePlayer();
		this.placeExit();
		this.placeKey();
		this.mazeSolvable = 0;
		var that = this;
		this.players.forEach( function(player){
			if(that.checkForSolvability(player) && that.mazeSolvable === 0){
				that.mazeSolvable = true;
			} else if(!that.checkForSolvability(player)){
				that.mazeSolvable = false;
			}
		})
		
	},

	checkForSolvability: function (player) {
		// make exit unwalkable
		this.level[this.exitPlacement] = 0;
		var graph = new Graph([
			[this.level[0],this.level[1],this.level[2],this.level[3], this.level[4], this.level[5], this.level[6], this.level[7]],
			[this.level[8],this.level[9],this.level[10],this.level[11], this.level[12], this.level[13], this.level[14], this.level[15]],
			[this.level[16],this.level[17],this.level[18],this.level[19], this.level[20], this.level[21], this.level[22], this.level[23]],
			[this.level[24],this.level[25],this.level[26],this.level[27], this.level[28], this.level[29], this.level[30], this.level[31]],
			[this.level[32],this.level[33],this.level[34],this.level[35], this.level[36], this.level[37], this.level[38], this.level[39]],
			[this.level[40],this.level[41],this.level[42],this.level[43], this.level[44], this.level[45], this.level[46], this.level[47]],
			[this.level[48],this.level[49],this.level[50],this.level[51], this.level[52], this.level[53], this.level[54], this.level[55]],
			[this.level[56],this.level[57],this.level[58],this.level[59], this.level[60], this.level[61], this.level[62], this.level[63]]
		]);
		var start = graph.grid[Math.floor(player.playerPlacement/8)][player.playerPlacement%8];
		var end = graph.grid[Math.floor(this.keyPlacement/8)][this.keyPlacement%8];
		var keyResult = astar.search(graph, start, end);

		// make exit walkable
		this.level[this.exitPlacement] = 9;
		graph = new Graph([
			[this.level[0],this.level[1],this.level[2],this.level[3], this.level[4], this.level[5], this.level[6], this.level[7]],
			[this.level[8],this.level[9],this.level[10],this.level[11], this.level[12], this.level[13], this.level[14], this.level[15]],
			[this.level[16],this.level[17],this.level[18],this.level[19], this.level[20], this.level[21], this.level[22], this.level[23]],
			[this.level[24],this.level[25],this.level[26],this.level[27], this.level[28], this.level[29], this.level[30], this.level[31]],
			[this.level[32],this.level[33],this.level[34],this.level[35], this.level[36], this.level[37], this.level[38], this.level[39]],
			[this.level[40],this.level[41],this.level[42],this.level[43], this.level[44], this.level[45], this.level[46], this.level[47]],
			[this.level[48],this.level[49],this.level[50],this.level[51], this.level[52], this.level[53], this.level[54], this.level[55]],
			[this.level[56],this.level[57],this.level[58],this.level[59], this.level[60], this.level[61], this.level[62], this.level[63]]
		]);
		var start = graph.grid[Math.floor(player.playerPlacement/8)][player.playerPlacement%8];
		end = graph.grid[Math.floor(this.exitPlacement/8)][this.exitPlacement%8];
		var exitResult = astar.search(graph, start, end);
		// result is an array containing the shortest path
		if(keyResult.length > 0 && exitResult.length > 0){
			return true;
		} else {
			console.log("Bad maze. Generating over...")
			return false;
		}
	},

	initKeys: function(){

		
		ig.input.bind( ig.KEY.P, 'pause' );
		ig.input.bind( ig.KEY.F, 'teleport' );
		ig.input.bind( ig.KEY.M, 'mute' );
		ig.input.bind( ig.KEY.Z, 'zoom' );
		
		ig.input.bind( ig.KEY.MOUSE1, 'touch' );
		ig.input.bind( ig.KEY._1, '1' );
		ig.input.bind( ig.KEY._2, '2' );
		ig.input.bind( ig.KEY._3, '3' );
		ig.input.bind( ig.KEY._4, '4' );
		ig.input.bind( ig.KEY._5, '5' );
		ig.input.bind( ig.KEY._6, '6' );
		ig.input.bind( ig.KEY._7, '7' );
		ig.input.bind( ig.KEY._8, '8' );
		ig.input.bind( ig.KEY._9, '9' );
		ig.input.bind( ig.KEY._0, '0' );
		
	},

	placePlayer: function(){

		var player = ig.game.spawnEntity(EntityPlayer, 5, 5);
		this.players.push(player);
		var playerPlaced = false;
		var that = this;
		var count = 0;
		while(!playerPlaced){
			var placement = Math.round(Math.random()*63);
			if(that.level[placement] === 1){
				that.level[placement] = 2;
				playerPlaced = true;
				player.playerPlacement = placement;
			}
		}
	},

	placeExit: function(){
		var exitPlaced = false;
		var that = this;
		var count = 0;
		while(!exitPlaced){
			var placement = Math.round(Math.random()*63);
			if(that.level[placement] === 1){
				that.level[placement] = 9;
				exitPlaced = true;
				that.exitPlacement = placement;
			}
		}
	},

	placeKey: function(){
		var keyPlaced = false;
		var that = this;
		
		while(!keyPlaced){
			var placement = Math.round(Math.random()*63);
			if(that.level[placement] === 1){
				that.level[placement] = 8;
				keyPlaced = true;
				that.keyPlacement = placement;
			}
		}
	},
	
	update: function() {

		// gamepad stuff
		gpads = navigator.getGamepads();
		if(gpads.length > 0){
			this.gamepadSupport = true;
		}
		
		// Update all entities and backgroundMaps
		this.parent();
		
	},

	checkSpace: function(tile, dir){
		if(tile < 0 || tile > 63){
			return 0;
		} else if(dir === 'left' && tile%8 === 7) {
			return 0;
		} else if(dir === 'right' && tile%8 === 0) {
			return 0;
		} else {
			return this.level[tile];
		}
	},

	drawMaze: function () {
		var count = 0;
		var that = this;
		this.level.forEach(function(entry){
			if(entry === 0){
				that.imgWall.draw( (count%8)*8+2, Math.floor(count/8)*8+2 );
			} else if(entry === 2){
				that.imgPlayer.draw( (count%8)*8+2, Math.floor(count/8)*8+2 );
			} else if(entry === 8){
				that.imgKey.draw( (count%8)*8+2, Math.floor(count/8)*8+2 );
			} else if(entry === 9){
				that.imgExit.draw( (count%8)*8+2, Math.floor(count/8)*8+2 );
			}
			count++;
		});
	},
	
	draw: function() {
		this.parent();
		
		this.drawMaze();
		
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 64, 64, 1 );

});
