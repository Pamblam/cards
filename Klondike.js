
class FoundationPile extends CardPile{
	constructor(playArea, x, y, w, h){
		super(playArea, x, y, w, h);
	}
}

class DiscardPile extends CardPile{
	constructor(playArea, x, y, w, h){
		super(playArea, x, y, w, h);
	}
}

class DrawPile extends CardPile{
	constructor(playArea, x, y, w, h){
		super(playArea, x, y, w, h);
	}
}

class TableauPile extends CardPile{
	constructor(playArea, x, y, w, h){
		super(playArea, x, y, w, h, 0, 20);
	}
}

class Klondike{
	
	constructor(canvas, deck){
		this.canvas = canvas;
		this.deck = deck;
		this.playArea = new PlayArea(canvas, deck);
		
		var spaces = canvas.width/7;
		var margin = spaces/2;
		var cardHeight = deck.cards[0].height;
		var cardWidth = deck.cards[0].width;
		var row1 = (margin/2)+(cardHeight/2);
		var col1 = (margin/2)+(cardWidth/2);
		
		this.foundationPiles = [];
		this.tableauPiles = [];
		this.discardPile = new DiscardPile(this.playArea, margin+spaces, row1, cardWidth, cardHeight);
		this.drawPile = new DrawPile(this.playArea, col1, row1);
		this.deck.cards.forEach(card=>this.drawPile.addCard(card));
		
		deck.cards.forEach(card=>card.pos = {x:col1, y:row1});
		this.playArea.boardItems.push(this.discardPile);
		
		for(var i=margin, n =0; i<canvas.width; i+=spaces, n++){
			
			if(n>2){
				let foundation = new FoundationPile(this.playArea, i, row1, cardWidth, cardHeight);
				this.playArea.boardItems.push(foundation);
				this.foundationPiles.push(foundation);
			}
			
			let tableau = new TableauPile(this.playArea, i, cardHeight*2, cardWidth, cardHeight);
			this.playArea.boardItems.push(tableau);
			this.tableauPiles.push(tableau);
		}
		
		this.playArea.render();
		this.deal();
	}
	
	deal(){
		for(var starting_col=0; starting_col<this.tableauPiles.length; starting_col++){
			for(var col=starting_col; col<this.tableauPiles.length; col++){
				let card = this.drawPile.topCard(true);
				if(col===starting_col) card.faceUp = true;
				this.playArea.moveCardToPile(card, this.tableauPiles[col], 20);
			}
		}
	}
	
}