/**
 * Base class for all card games
 * @type CardGame
 */
class CardGame extends EventEmittingClass{
	
	constructor(width, height){
		super();
		this.width = width;
		this.height = height;
		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext('2d');
		this.cardStacks = [];
		this.initEvents();
	}
	
	addStack(stack){
		this.cardStacks.push(stack);
	}
	
	render(){
		this.cardStacks.forEach(stack=>stack.render(this.ctx));
	}
	
	relativeMousePos(e){
		var rect = this.canvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;
		return {x, y};
	}
	
	initEvents(){
		var mouseState = {
			mouseOver: [],
			mouseDown: []
		};
		
		['click', 'mousedown', 'mouseup'].forEach(evtType=>{
			this.canvas.addEventListener(evtType, e=>{
				var pos = this.relativeMousePos(e);
				var objects = this.getObjectsAt(pos.x, pos.y);
				objects.forEach(obj=>obj.emit(evtType));
			});
		});
		
		var mo_failsafe_timer = false;
		var last_known_mouse_pos = {x:0, y:0};
		document.addEventListener('mousemove', e=>{
			
			last_known_mouse_pos = {x: e.clientX, y: e.clientY};
			if(false !== mo_failsafe_timer) clearTimeout(mo_failsafe_timer);
			
			const fireEventAtPos = pos => {
				var objects = this.getObjectsAt(pos.x, pos.y);
				var mouseoverobjs = objects.filter(obj=>!~mouseState.mouseOver.indexOf(obj));
				var mouseoutobjs = mouseState.mouseOver.filter(obj=>!~objects.indexOf(obj));
				mouseState.mouseOver = mouseState.mouseOver.filter(obj=>!~mouseoutobjs.indexOf(obj));
				mouseoverobjs.forEach(obj=>obj.emit('mouseover'));
				mouseoutobjs.forEach(obj=>obj.emit('mouseout'));
				mouseState.mouseOver.push(...mouseoverobjs);
			};
			
			mo_failsafe_timer = setTimeout(()=>fireEventAtPos(last_known_mouse_pos), 500);
			
			if(e.target === this.canvas){
				var pos = this.relativeMousePos(e);
				fireEventAtPos(pos);
			}
		});
	}
	
	getObjectsAt(x, y){
		var objects = [];
		this.cardStacks.forEach(stack=>{
			var stackpos = stack.getNextPos();
			var touching = CardGame.pointTouchesRect(x, y, stackpos.x, stackpos.y, Card.width, Card.height, stack.rotation);
			if(touching){
				objects.push(stack);
			}
			stack.cards.forEach(card=>{
				var touching = CardGame.pointTouchesRect(x, y, card.x, card.y, Card.width, Card.height, card.rotation);
				if(touching){
					objects.push(card);
				}
			});
		});
		return objects;
	}
}

CardGame.pointTouchesRect = (pointx, pointy, rectx, recty, rectw, recth, rectr) => {
	var dx = pointx - rectx, dy = pointy - recty;
	var h1 = Math.sqrt(dx*dx + dy*dy);
	var currA = Math.atan2(dy,dx);
	var newA = currA - (rectr*Math.PI/180);
	var x2 = Math.cos(newA) * h1;
	var y2 = Math.sin(newA) * h1;
	return x2 > -0.5 * rectw && x2 < 0.5 * rectw && y2 > -0.5 * recth && y2 < 0.5 * recth;
};
