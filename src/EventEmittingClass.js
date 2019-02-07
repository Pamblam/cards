/**
 * Class that handles events
 * @type EventEmittingClass
 */
class EventEmittingClass{
	
	constructor(){
		this.single_fire_events = {};
		this.event_queue = {};
	}
	
	/**
	 * To be called in the constructor of child 
	 * classes to create single-fire events
	 * @param {string} eventType
	 * @returns {true|false}
	 */
	createSingleFireEvent(eventType){
		if('string' !== typeof eventType){
			return false;
		}
		this.single_fire_events[eventType] = false;
	}
	
	/**
	 * Add an event listener to the class
	 * @param {string} eventType
	 * @param {function} callback
	 * @returns {true|false}
	 */
	on(eventType, callback){
		if('string' !== typeof eventType || 'function' !== typeof callback){
			return false;
		}
		if(!this.event_queue.hasOwnProperty(eventType)){
			this.event_queue[eventType] = [];
		}
		if(this.single_fire_events.hasOwnProperty(eventType)){
			if(this.single_fire_events[eventType]===true){
				callback.call(this);
				return true;
			}
		}
		this.event_queue[eventType].push(callback);
		return true;
	}
	
	/**
	 * Remove an event listener from the class
	 * @param {string} eventType
	 * @param {function} callback
	 * @returns {true|false}
	 */
	off(eventType, callback){
		if('string' !== typeof eventType || 'function' !== typeof callback){
			return false;
		}
		if(!this.event_queue.hasOwnProperty(eventType)){
			return false;
		}
		var idx = this.event_queue[eventType].indexOf(callback);
		if(idx === -1){
			return false;
		}
		this.event_queue[eventType].splice(idx, 1);
		return true;
	}
	
	/**
	 * Emit event to be handled
	 * @param {string} eventType
	 * @returns {true|false}
	 */
	emit(eventType){
		if('string' !== typeof eventType){
			return false;
		}
		if(!this.event_queue.hasOwnProperty(eventType)){
			this.event_queue[eventType] = [];
		}
		var isSingleFire = this.single_fire_events.hasOwnProperty(eventType);
		if(isSingleFire){
			this.single_fire_events[eventType] = true;
		}
		for(let i=this.event_queue[eventType].length; i--;){
			let res = this.event_queue[eventType][i].call(this);
			if(res === false && !isSingleFire){
				break;
			}
		}
		if(isSingleFire) this.event_queue[eventType] = [];
		return true;
	}
	
}