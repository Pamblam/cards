/**
 * Represents class emitted events
 * @type ClassEmittedEvent
 */
class ClassEmittedEvent{
	
	constructor(target, type, props={}){
		this.type = type;
		this.propagating = true;
		this.cancelled = false;
		this.target = target;
		
		var keys = Object.keys(props);
		for(let k=0; k<keys.length; k++){
			this[keys[k]] = props[keys[k]];
		}
	}
	
	/**
	 * Stop other events from being fired
	 * @returns {undefined}
	 */
	stopPropagation(){
		this.propagating = false;
	}
	
	/**
	 * Stop default action from being applied
	 * @returns {undefined}
	 */
	preventDefault(){
		this.cancelled = true;
	}
}