
class CardStack{
	
	constructor(){
		this.cards = [];
	}
	
	addCard(card){
		var idx = this.cards.indexOf(card);
		if(idx === -1){
			this.cards.unshift(card);
			return true;
		}
		return false;
	}
	
	removeCard(card){
		var idx = this.cards.indexOf(card);
		if(idx !== -1){
			this.cards.splice(idx, 1);
			return true;
		}
		return false;
	}
	
	topCard(){
		return this.cards[0];
	}
	
	repositionCard(card, position){
		// https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
		var idx = this.cards.indexOf(card);
		if(idx === -1){
			return false;
		}
		if(position > this.cards.length){
			position = this.cards.length;
		}
		// to do
		return true;
	}
	
	shuffle(){
		// todo
	}
}

CardStack.makeSquare = (ctx, x, y, width, height)=>{
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
};