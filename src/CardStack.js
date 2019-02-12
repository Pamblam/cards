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
		
		this.lineWidth = 1;
		this.lineColor = 'black';
		this.bgColor = null;
		
		this.dragState = {
			card: null,
			xOffset: 0,
			yOffset: 0,
			originalx: null,
			originaly: null
		};
		
		this.cardClickHandler = this.cardClickHandler.bind(this);
		this.cardMouseoverHandler = this.cardMouseoverHandler.bind(this);
		this.cardMouseoutHandler = this.cardMouseoutHandler.bind(this);
		this.cardMousedownHandler = this.cardMousedownHandler.bind(this);
		this.cardMouseupHandler = this.cardMouseupHandler.bind(this);
		this.cardMousemoveHandler = this.cardMousemoveHandler.bind(this);
	}
	
	topCardAt(x, y){
		var lowestIndex = false;
		this.cards.forEach((card, idx)=>{
			var touching = CardGame.pointTouchesRect(x, y, card.x, card.y, Card.width, Card.height, card.rotation);
			if(touching && (false === lowestIndex || idx < lowestIndex)){
				lowestIndex = idx
			}
		});
		return lowestIndex === false ? false : this.cards[lowestIndex];
	}
	
	cardClickHandler(e){
		if(e.target !== this.topCardAt(e.x, e.y)) return;
		this.emit('topcardclick', {card: e.target, x: e.x, y: e.y});
	}
	
	cardMouseoverHandler(e){
		if(e.target !== this.topCardAt(e.x, e.y)) return;
		this.emit('topcardmouseover', {card: e.target, x: e.x, y: e.y});
	}
	
	cardMouseoutHandler(e){
		if(e.target !== this.topCardAt(e.x, e.y)) return;
		this.emit('topcardmouseout', {card: e.target, x: e.x, y: e.y});
	}
	
	cardMousedownHandler(e){
		if(e.target !== this.topCardAt(e.x, e.y)) return;
		var evt = this.emit('topcardmousedown', {card: e.target, x: e.x, y: e.y});
		if(this.canDraw(e.target) && !evt.cancelled){
			this.dragState = {
				card: e.target,
				xOffset: e.x-e.target.x,
				yOffset: e.y-e.target.y,
				originalx: e.target.x,
				originaly: e.target.y
			};
		}
	}
	
	cardMouseupHandler(e){
		if(e.target === this.topCardAt(e.x, e.y)){
			this.emit('topcardmouseup', {card: e.target, x: e.x, y: e.y});
		}
		this.dragState.card.x = this.dragState.originalx;
		this.dragState.card.y = this.dragState.originaly;
		this.dragState = {
			card: null,
			xOffset: 0,
			yOffset: 0,
			originalx: null,
			originaly: null
		};
		e.render();
	}
	
	cardMousemoveHandler(e){
		if(e.target !== this.topCardAt(e.x, e.y)) return;
		this.emit('topcardmousemove', {card: e.target, x: e.x, y: e.y});
		if(this.dragState.card !== null){			
			this.dragState.card.x = e.x-this.dragState.xOffset;
			this.dragState.card.y = e.y-this.dragState.yOffset;
			e.render();
		}
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
			card.on('click', this.cardClickHandler);
			card.on('mouseover', this.cardMouseoverHandler);
			card.on('mouseout', this.cardMouseoutHandler);
			
			card.on('mousedown', this.cardMousedownHandler);
			card.on('mouseup', this.cardMouseupHandler);
			card.on('mousemove', this.cardMousemoveHandler);		
		
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
			card.off('click', this.cardClickHandler);
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
		CardStack.renderSquare(ctx, 0, 0, Card.width, Card.height, this.lineWidth, this.lineColor, this.bgColor);
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
CardStack.renderSquare = (ctx, x, y, width, height, lineWidth=1, lineColor='black', bgColor=null)=>{
	x -= (width/2);
	y -= (height/2);
	var radius = 5;
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
	
	if(lineWidth && lineColor){
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
	
	if(bgColor){
		ctx.fillStyle = bgColor;
		ctx.fill();
	}
	
	return true;
};