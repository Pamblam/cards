
class Deck{
	
	constructor(jokers=false){
		this.cards = [];
		this.ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
		this.suits = ['C','D','H','S'];
		this.hasJokers = jokers;
		this.spriteSheet = new Image;
		this.loaded = false;
		this.loadqueue = [];
		this.spriteSheet.onload = ()=>{
			this.loaded = true;
			while(this.loadqueue.length) this.loadqueue.shift().call(this);
		};
		this.spriteSheet.src = "cards.svg";
		
		var bck = this.getSpriteCoords(null, null);
		for(let s=0; s<this.suits.length; s++){
			for(let r=0; r<this.ranks.length; r++){
				let {x, y, h, w} = this.getSpriteCoords(this.ranks[r], this.suits[s]);
				this.cards.push(new Card(this.ranks[r], this.suits[s], x, y, w, h, this.spriteSheet, bck.x, bck.y, bck.h, bck.w));
			}
		}
		if(this.hasJokers){
			let {xr, yr, hr, wr} = this.getSpriteCoords('JOK', 'R');
			let {xb, yb, hb, wb} = this.getSpriteCoords('JOK', 'R');
			this.cards.push(new Card('JOK', 'R', xr, yr, wr, hr, this.spriteSheet, bck.x, bck.y, bck.h, bck.w));
			this.cards.push(new Card('JOK', 'B', xb, yb, wb, hb, this.spriteSheet, bck.x, bck.y, bck.h, bck.w));
		}
	}
	
	onload(fn){
		if(this.loaded) return fn.call(this);
		this.loadqueue.push(fn);
	}
	
	shuffle(){
		var currentIndex = this.cards.length, tempval, rndmidx;
		while (0 !== currentIndex) {
			rndmidx = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			tempval = this.cards[currentIndex];
			this.cards[currentIndex] = this.cards[rndmidx];
			this.cards[rndmidx] = tempval;
		}
	}
	
	getSpriteCoords(rank, suite){
		var x =0, y=0, w=79, h=123;
		if(rank === 'JOK'){
			y = 4;
			if(suite === 'R') x = 1;
			else x = 0;
		}else if(!rank){
			y = 4;
			x = 2;
		}else{
			x = this.ranks.indexOf(rank);
			y = this.suits.indexOf(suite);
		}
		if(-1 === x || -1 === y) return false;
		return {x:x*w, y:y*h, h, w};
	}
	
}

class Card{
	constructor(rank, suite, x, y, w, h, spriteSheet, bx, by, bh, bw){
		this.sprite = {x, y, w, h};
		this.width = w;
		this.height = h;
		this.faceUp = false;
		this.rank = rank;
		this.suite = suite;
		this.rotation = 0;
		this.pos = {x:w/2, y:h/2};
		this.spriteSheet = spriteSheet;
		this.backSprite = {x:bx, y:by, h:bh, w:bw};
	}
	draw(ctx){
		var sprite = this.faceUp ? this.sprite : this.backSprite;
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.rotation*Math.PI/180);
		ctx.drawImage(this.spriteSheet, sprite.x, sprite.y, sprite.w, sprite.h, -this.width/2, -this.height/2, sprite.w, sprite.h);
		ctx.restore();
	}
	isPointTouching(x, y){
		// x and y are relative to the canvas
		// https://stackoverflow.com/questions/9202006/mouse-position-within-rotated-rectangle-in-html5-canvas
		var dx = x - this.pos.x, dy = y - this.pos.y;
		var h1 = Math.sqrt(dx*dx + dy*dy);
		var currA = Math.atan2(dy,dx);
		var newA = currA - (this.rotation*Math.PI/180);
		var x2 = Math.cos(newA) * h1;
		var y2 = Math.sin(newA) * h1;
		return x2 > -0.5 * this.width && x2 < 0.5 * this.width && y2 > -0.5 * this.height && y2 < 0.5 * this.height;
	}
}

class PlayArea{
	constructor(canvas, deck){
		this.canvas = canvas;
		this.deck = deck;
		this.ctx = canvas.getContext('2d');
		this.rendered = [];
		this.eventQueues = {
			cardclick: []
		};
		canvas.addEventListener('click', e=>{
			var rect = canvas.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			var touching = false;
			deck.cards.forEach(card=>{
				if(!card.isPointTouching(x, y)) return;
				var idx = this.rendered.indexOf(card);
				if(false === touching || idx < touching) touching = idx;
			});
			if(touching === false) return;
			this.eventQueues.cardclick.forEach(fn=>fn.call(this, this.rendered[touching]));
		});
	}
	on(evt, fn){
		this.eventQueues[evt].push(fn);
	}
	heck(){
		this.deck.onload(()=>{
			this.deck.cards.forEach(card=>{
				card.faceUp = this.getRandomInt(0, 1) === 1;
				card.rotation = this.getRandomInt(0, 359);
				card.pos.y = this.getRandomInt(100, this.canvas.height-100);
				card.pos.x = this.getRandomInt(100, this.canvas.width-100);
				this.renderCard(card);
			});
		});
	}
	unheck(frames=100){
		return new Promise(done=>{
			var dest = {
				x:(this.rendered[0].height/2), 
				y:(this.rendered[0].width/2)
			};
			var offsets = [];
			this.rendered.reverse().forEach(card=>{
				card.faceUp = true;
				card.draw(this.ctx);
				offsets.push({
					rotation: card.rotation/frames,
					x: (card.pos.x - dest.x)/frames,
					y: (card.pos.y - dest.y)/frames
				});
			});
			console.log(offsets);
			var render = ()=>{
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				frames--;
				this.rendered.forEach((card, idx)=>{
					var ofst = offsets[idx];
					card.pos.x -= ofst.x;
					card.pos.y -= ofst.y;
					card.rotation -= ofst.rotation;
					card.draw(this.ctx);
				});
				if(frames) setTimeout(()=>render(), 10);
				else{
					this.rendered.forEach(card=>{
						card.pos.x = dest.x;
						card.pos.y = dest.y;
						card.rotation = 0;
						card.draw(this.ctx);
					});
					this.rendered.reverse();
					return done();
				}
			};
			render();
		});
	}
	renderCard(card){
		var idx = this.rendered.indexOf(card);
		if(idx !== -1) this.rendered.splice(idx, 1);
		this.rendered.unshift(card);
		card.draw(this.ctx);
	}
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}