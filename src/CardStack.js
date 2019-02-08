/**
 * Represents a group or stack of cards and their order
 * @type CardStack
 */
class CardStack extends EventEmittingClass{
	
	constructor(draw_mode, drop_mode, card_pos_mode, offset_mode, x, y){
		super();
		this.cards = [];
		this.draw_mode = draw_mode || 0;
		this.drop_mode = drop_mode || 0;
		this.card_pos_mode = card_pos_mode || 0;
		this.offset_mode = offset_mode || 0;
		this.x = x;
		this.y = y;
		this.rotation = 0;
	}
	
	getNextPos(){
		var xoffset = 0, yoffset = 0;
		switch(this.offset_mode){
			case CardStack.OFFSET_MODE_NONE: break;
			case CardStack.OFFSET_MODE_VERT: yoffset += CardStack.OFFSET_PX; break;
			case CardStack.OFFSET_MODE_HORIZ: xoffset += CardStack.OFFSET_PX; break;
		}
		return {
			x: this.x + (xoffset * this.cards.length),
			y: this.y + (yoffset * this.cards.length)
		};
	}
	
	canDrop(card){
		switch(this.drop_mode){
			case CardStack.DROP_MODE_NONE: return false;
			case CardStack.DROP_MODE_ANY: return true;
			case CardStack.DROP_MODE_ALT:
				var topCard = this.topCard();
				if(!topCard && card.rank === 'K') return true;
				var nextRankIdx = Card.ranks_short.indexOf(card.rank)+1;
				if(topCard.rank !== Card.ranks_short[nextRankIdx]) return false;
				return topCard.color !== card.color;
			case CardStack.DROP_MODE_ASC:
				var topCard = this.topCard();
				if(!topCard && card.rank === 'A') return true;
				if(topCard.suit !== card.suit) return false;
				var prevRankIdx = Card.ranks_short.indexOf(card.rank)-1;
				return topCard.rank === Card.ranks_short[prevRankIdx];
		}
	}
	
	/**
	 * Can the given card be drawn/removed from this stack
	 * @param {type} card
	 * @returns {Boolean}
	 */
	canDraw(card){
		if(!card) card = this.topCard();
		switch(this.draw_mode){
			case CardStack.DRAW_MODE_ANY: return true;
			case CardStack.DRAW_MODE_NONE: return false;
			case CardStack.DRAM_MODE_TOP: return card === this.topCard();
		}
	}
	
	
	
	/**
	 * Add a card to the stack
	 * @param {Card} card
	 * @returns {true|false}
	 */
	dropCard(card){
		var idx = this.cards.indexOf(card);
		if(idx === -1){
			switch(this.card_pos_mode){
				case CardStack.CARD_POS_FACEUP: card.faceup = true; break;
				case CardStack.CARD_POS_FACEDOWN: card.faceup = false; break;
			}
			var pos = this.getNextPos();
			card.x = pos.x;
			card.y = pos.y;
			card.rotation = this.rotation;
			this.cards.unshift(card);
			return true;
		}
		return false;
	}
	
	/**
	 * Remove a card from the stack
	 * @param {Card} card
	 * @returns {true|false}
	 */
	removeCard(card){
		var idx = this.cards.indexOf(card);
		if(idx !== -1){
			this.cards.splice(idx, 1);
			return true;
		}
		return false;
	}
	
	/**
	 * Get the card on the top of the stack
	 * @returns {Card}
	 */
	topCard(){
		return this.cards[0];
	}
	
	/**
	 * 
	 * @param {Card} card
	 * @param {number} position
	 * @returns {true|false}
	 */
	repositionCard(card, position){
		var idx = this.cards.indexOf(card);
		if(idx === -1){
			return false;
		}
		this.cards.splice(position, 0, this.cards.splice(idx, 1)[0]);
		return true;
	}
	
	/**
	 * Shuffle cards in the stack
	 * @returns {true|false}
	 */
	shuffle(){
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
		return true;
	}
	
	/**
	 * Adds a full deck of cards to the stack
	 * @returns {true}
	 */
	addDeck(){
		var promises = [];
		Card.suits_short.forEach(suit=>{
			Card.ranks_short.forEach(rank=>{
				promises.push(new Promise(done=>{
					var card = new Card(rank, suit).load();
					card.on('load', ()=>{
						this.dropCard(card);
						done();
					});
				}));
			});
		});
		Promise.all(promises).then(()=>{
			this.emit('deck-added');
		});
		return true;
	}
	
	render(ctx){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation*Math.PI/180);
		CardStack.renderSquare(ctx, 0, 0, Card.width, Card.height);
		ctx.restore();
		for(let i=this.cards.length; i--;){
			this.cards[i].render(ctx);
		}
	}
}

CardStack.DRAW_MODE_NONE = 0;
CardStack.DRAW_MODE_ANY = 1;
CardStack.DRAM_MODE_TOP = 2;

CardStack.DROP_MODE_NONE = 0;
CardStack.DROP_MODE_ALT = 1; // drop on higher rank of alternating color
CardStack.DROP_MODE_ASC = 2; // drop on lower rank of 
CardStack.DROP_MODE_ANY = 3;

CardStack.CARD_POS_ANY = 0;
CardStack.CARD_POS_FACEUP = 1;
CardStack.CARD_POS_FACEDOWN = 2;

CardStack.OFFSET_MODE_NONE = 0;
CardStack.OFFSET_MODE_VERT = 1;
CardStack.OFFSET_MODE_HORIZ = 2;

CardStack.OFFSET_PX = 20;

/**
 * Draw a square with rounded corners
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {true}
 */
CardStack.renderSquare = (ctx, x, y, width, height)=>{
	x -= (width/2);
	y -= (height/2);
	var radius = 5;
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	ctx.stroke();
	return true;
};