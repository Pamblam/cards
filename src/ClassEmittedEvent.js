/**
 * Represents class emitted events
 * @type ClassEmittedEvent
 */
class ClassEmittedEvent{
	
	constructor(target, type){
		this.type = type;
		this.propagating = true;
		this.cancelled = false;
		this.target = target;
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