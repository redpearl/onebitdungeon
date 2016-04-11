ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
    
		size: {x: 20, y:20},
		zIndex: 1,
		gravityFactor: 0,
	
		type: ig.Entity.TYPE.NONE, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet( 'media/yellowbox.png',20, 20),

		playerPlacement: 0,
		investigatedTile: 0,
		investigatedTilePlacement: 0,
		investigateTime: 0.8,
		hasKey: false,
		playerNumber: 0,

		pos: {x: 0, y: 0},
		playerImage: new ig.Image( 'media/yellowbox.png' ),

			
		init: function( x, y, settings ) {

			this.parent( x, y, settings );

			this.movingTimer = new ig.Timer(0);
			this.investigateTimer = new ig.Timer(0);
			this.initKeys();
			
		},

		initKeys: function(){

		var gamepad = 0;

		if(this.playerNumber === 0){
			gamepad = ig.GAMEPAD1;
		} else if(this.playerNumber === 1){
			gamepad = ig.GAMEPAD2;
		} else if(this.playerNumber === 2){
			gamepad = ig.GAMEPAD3;
		} else if(this.playerNumber === 3){
			gamepad = ig.GAMEPAD4;
		} else if(this.playerNumber === 4){
			gamepad = ig.GAMEPAD5;
		} else if(this.playerNumber === 5){
			gamepad = ig.GAMEPAD6;
		}
		this.moveID = 'move' + this.playerNumber;

		ig.input.bind( gamepad.FACE_1, this.moveID);
		ig.input.bind( gamepad.FACE_2, this.moveID);
		ig.input.bind( gamepad.FACE_4, this.moveID);

		this.upID = 'up' + this.playerNumber;
		ig.input.bind( gamepad.PAD_TOP, this.upID);
		this.downID = 'down' + this.playerNumber;
		ig.input.bind( gamepad.PAD_BOTTOM, this.downID);
		this.leftID = 'left' + this.playerNumber;
		ig.input.bind( gamepad.PAD_LEFT, this.leftID);
		this.rightID = 'right' + this.playerNumber;
		ig.input.bind( gamepad.PAD_RIGHT, this.rightID);
		this.inventoryID = 'inventory' + this.playerNumber;
		ig.input.bind( gamepad.SELECT, this.inventoryID);

	},
    
		update: function() {
			
			this.parent();

			if(this.movingTimer.delta()>0 && !this.won){
				if(ig.input.pressed(this.upID)){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.investigatedTile = ig.game.checkSpace(this.playerPlacement-8, 'up');
					this.investigatedTilePlacement = this.playerPlacement-8;
				} else if(ig.input.pressed(this.downID)){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.investigatedTile = ig.game.checkSpace(this.playerPlacement+8, 'down');
					this.investigatedTilePlacement = this.playerPlacement+8;
				} else if(ig.input.pressed(this.leftID)){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.investigatedTile = ig.game.checkSpace(this.playerPlacement-1, 'left');
					this.investigatedTilePlacement = this.playerPlacement-1;
				} else if(ig.input.pressed(this.rightID)){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.investigatedTile = ig.game.checkSpace(this.playerPlacement+1, 'right');
					this.investigatedTilePlacement = this.playerPlacement+1;
				} else if(ig.input.pressed(this.moveID) && this.investigatedTile === 1 && this.investigatedTilePlacement !== this.playerPlacement){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.movingTimer = new ig.Timer(0.3);
					ig.game.level[this.playerPlacement] = 1;
					this.playerPlacement = this.investigatedTilePlacement;
					ig.game.level[this.investigatedTilePlacement] = 2;
				} else if(ig.input.pressed(this.moveID) && this.investigatedTile === 8){
					this.investigateTimer = new ig.Timer(this.investigateTime);
					this.movingTimer = new ig.Timer(0.3);
					ig.game.level[this.playerPlacement] = 1;
					this.playerPlacement = this.investigatedTilePlacement;
					ig.game.level[this.investigatedTilePlacement] = 2;
					this.hasKey = true;
				} else if(ig.input.pressed('move' + this.playerNumber) && this.investigatedTile === 9 && this.hasKey){
					this.won = true;
					this.investigateTimer = new ig.Timer(0);
				} else if(ig.input.pressed('inventory' + this.playerNumber)){
					this.checkInventory = true;
					if(this.hasKey){
						this.keyTimer = new ig.Timer(this.investigateTime);
					} else {
						this.movingTimer = new ig.Timer(0.3);	
					}
				}
			}
			
		},

		drawMe: function () {
			this.playerImage.draw( this.pos.x, this.pos.y );
		},

		draw: function(){
			var that = this;
			if(!this.won){
				if(this.checkInventory){
					if(this.hasKey && this.keyTimer.delta()<0){
						if((this.keyTimer.delta()*10)%3 > -1.5 && this.keyTimer.delta() < -0.3){
							this.drawMe();
							this.playSound = true;
						} else {
							this.playSound = false;
						}
					} else {
						this.checkInventory = false;
						this.playSound = false;
					}
				} else if(this.investigateTimer.delta()<0){
					if(this.investigatedTile === 1){
						this.playSound = false;
					} else if(this.investigatedTile === 0){
						//console.log((this.investigateTimer.delta()*10)%3);
						this.drawMe();
						this.playSound = true;
					} else if(this.investigatedTile === 8){
						if((this.investigateTimer.delta()*10)%3 > -1.5 && this.investigateTimer.delta() < -0.3){
							this.drawMe();
							this.playSound = true;
						} else {
							this.playSound = false;
						}
					} else if(this.investigatedTile === 9){
						if((this.investigateTimer.delta()*10)%2 > -1){
							this.drawMe();
							this.playSound = true;
						} else {
							this.playSound = false;
						}
					}
				} else {
					this.playSound = false;
				}
				if(this.movingTimer.delta()<0){
					if(this.movingTimer.delta()<-0.05){
						this.drawMe();
						this.playSound = true;
					} else {
						this.playSound = false;
					}
				}
			} else {
				if((this.investigateTimer.delta()*10)%2 < 1){
					this.drawMe();
					this.playSound = true;
				} else {
					this.playSound = false;
				}
			}

			if(this.playSound && !this.soundPlaying){
				ig.game.beep.play();
				this.soundPlaying = true;
			} else if(!this.playSound) {
				ig.game.beep.stop();
				this.soundPlaying = false;
			}
			this.parent();
		}
	});
});
