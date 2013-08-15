/// <reference path="../core/Game.ts" />

/**
 *	Kiwi - Tween (note the global namespace for brevity during development)
 *
 *	@desc 		Based heavily on tween.js by sole (https://github.com/sole/tween.js) converted to TypeScript and integrated into Kiwi
 *
 *	@version 	1.0 - 11th January 2013
 *
 *	@author 	Richard Davey, TypeScript conversion and Kiwi integration. See Kiwi.Tweens.Manager for the full tween.js author list
 *
 *	@url 		http://www.kiwijs.org
 *
 *	@todo       Tests
 */

//  Note the core namespace
module Kiwi {

    export class Tween {

        /** 
        * 
        * @constructor
        * @param {Any} object
        * @param {Kiwi.Game} game
        * @return {Kiwi.Tween}
        **/
        constructor(object, game:Kiwi.Game = null) {

            this._object = object;

            if (game !== null)
            {
                this._game = game;
                this._manager = this._game.tweens;
            }

            this.isRunning = false;

        }

        public objType() {
            return "Tween";
        }

        /** 
        * 
        * @property _game
        * @type Kiwi.Game
        * @private
        **/
        private _game: Kiwi.Game = null;

        /** 
        * 
        * @property _manager
        * @type Kiwi.Tweens.Manager
        * @private
        **/
        private _manager: Kiwi.Tweens.Manager = null;

        /** 
        * 
        * @property _object
        * @type Any
        * @private
        **/
	    private _object = null;

        /** 
        * 
        * @property _valuesStart
        * @type 
        * @private
        **/
	    private _valuesStart = {};

        /** 
        * 
        * @property _valuesEnd
        * @type
        * @private
        **/
	    private _valuesEnd = {};

        /** 
        * 
        * @property _duration
        * @type Number
        * @private
        **/
	    private _duration = 1000;

        /** 
        * 
        * @property _delayTime
        * @type Number
        * @private
        **/
	    private _delayTime = 0;

        /** 
        * 
        * @property _startTime
        * @type
        * @private
        **/
	    private _startTime = null;

        /** 
        * 
        * @property _easingFunction
        * @type Kiwi.Tweens.Easing.Linear.None
        * @private
        **/
	    private _easingFunction = Kiwi.Tweens.Easing.Linear.None;

        /** 
        * 
        * @property _interpolationFunction
        * @type Kiwi.Utils.Interpolation.Linear
        * @private
        **/
	    private _interpolationFunction = Kiwi.Utils.GameMath.linearInterpolation;

        /** 
        * 
        * @property _chainedTweens
        * @type Array
        * @private
        **/
	    private _chainedTweens = [];

        /** 
        * 
        * @property _onStartCallback
        * @type
        * @private
        **/
	    private _onStartCallback = null;
        private _onStartContext = null;


        /** 
        * 
        * @property _onStartCallbackFired
        * @type
        * @private
        **/
	    private _onStartCallbackFired = false;

        /** 
        * 
        * @property _onUpdateCallback
        * @type
        * @private
        **/
	    private _onUpdateCallback = null;

        private _onUpdateContext = null;

        /** 
        * 
        * @property _onCompleteCallback
        * @type
        * @private
        **/
	    private _onCompleteCallback = null;

	    private _onCompleteCalled: bool = false;

        /** 
        * 
        * @property _onCompleteContext
        * @type
        * @private
        **/
	    private _onCompleteContext;

        public isRunning: bool = false;

        /** 
        * 
        * @method to
        * @param {Any} properties
        * @param {Number} duration
        * @param {Any} ease
        * @param {Boolean} autoStart
        **/
	    public to(properties, duration: number = 1000, ease: any = null, autoStart: bool = false) {

	        this._duration = duration;

	        //  If properties isn't an object this will fail, sanity check it here somehow?
	        this._valuesEnd = properties;

	        if (ease !== null)
	        {
	            this._easingFunction = ease;
	        }

	        if (autoStart === true)
	        {
	            return this.start();
	        }
	        else
	        {
	            return this;
	        }

	    }

        /** 
        * 
        * @method start
        **/
	    public start() {

	        if (this._game === null || this._object === null)
	        {
	            return;
	        }

	        this.isRunning = true;

	        this._manager.add(this);

	        this._onStartCallbackFired = false;

	        this._startTime = this._game.time.now() + this._delayTime;

	        for (var property in this._valuesEnd)
	        {
	            // This prevents the interpolation of null values or of non-existing properties
	            if (this._object[property] === null || !(property in this._object))
	            {
        	        //console.log('tween interpolation of null value of non-existing property');
	                continue;
	            }

	            // check if an Array was provided as property value
	            if (this._valuesEnd[property] instanceof Array)
	            {
	                if (this._valuesEnd[property].length === 0)
	                {
	                    continue;
	                }

        	        //console.log('tween array given as property value');

	                // create a local copy of the Array with the start value at the front
	                this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
	            }

                //  Check if property is a function
	            if (typeof this._object[property] === 'function')
	            {
                    //console.log('tween property function', this._object[property]());
	                this._valuesStart[property] = this._object[property]();
	            }
	            else
	            {
                    //console.log('tween property var');
	                this._valuesStart[property] = this._object[property];
	            }

	        }

	        return this;

	    }

        /** 
        * 
        * @method stop
        **/
	    public stop() {

	        if (this._manager !== null)
	        {
	            this._manager.remove(this);
	        }

	        this.isRunning = false;

	        return this;

	    }

        /** 
        * 
        * @method setParent
        * @param {Kiwi.Game} value
        **/
	    public setParent(value:Kiwi.Game) {

	        this._game = value;
            this._manager = this._game.tweens;

	    }

        /** 
        * 
        * @method delay
        * @param {Any} amount
        **/
	    public delay(amount) {

	        this._delayTime = amount;
	        return this;

	    }

        /** 
        * 
        * @method easing
        * @param {Any} easing
        **/
	    public easing(easing) {

	        this._easingFunction = easing;
	        return this;

	    }

        /** 
        * 
        * @method interpolation
        * @param {Any} interpolation
        **/
	    public interpolation(interpolation) {

	        this._interpolationFunction = interpolation;

	        return this;

	    }

        /** 
        * 
        * @method chain
        * @param {Kiwi.Tween} tween
        **/
	    public chain(tween:Kiwi.Tween) {

	        this._chainedTweens.push(tween);
	        return this;

	    }

        /** 
        * 
        * @method onStart
        * @param {Any} callback
        **/
	    public onStart(callback, context) {

	        this._onStartCallback = callback;
            this._onStartContext = context;
            return this;

	    }

        /** 
        * 
        * @method onUpdate
        * @param {Any} callback
        **/
	    public onUpdate(callback, context) {

            this._onUpdateCallback = callback;
            this._onUpdateContext = context;
	        return this;

	    }

        /** 
        * 
        * @method onComplete
        * @param {Any} callback
        **/
	    public onComplete(callback, context) {

	        this._onCompleteCallback = callback;
	        this._onCompleteContext = context;

	        return this;

	    }

        /** 
        * 
        * @property debugValue
        * @type Any
        **/
	    public debugValue;

        /** 
        * 
        * @method update
        * @param {Any} time
        **/
	    public update(time) {

	        if (time < this._startTime)
	        {
	            return true;
	        }

	        if (this._onStartCallbackFired === false)
	        {
	            if (this._onStartCallback !== null)
	            {
	                this._onStartCallback.call(this._onStartContext, this._object);
	            }

	            this._onStartCallbackFired = true;
	        }

	        var elapsed = (time - this._startTime) / this._duration;
	        elapsed = elapsed > 1 ? 1 : elapsed;

	        var value = this._easingFunction(elapsed);

	        for (var property in this._valuesStart)
	        {
	            var start = this._valuesStart[property];
	            var end = this._valuesEnd[property];

                //  Add checks for object, array, numeric up front
	            if (end instanceof Array)
	            {
	                this._object[property] = this._interpolationFunction(end, value);
	            }
                else
	            {
	                if (typeof this._object[property] === 'function')
	                {
    	                this._object[property](start + (end - start) * value);
	                    //console.log('tween update', value, elapsed);
	                }
	                else
	                {
    	                this._object[property] = start + (end - start) * value;
	                }
	            }
	        }

	        if (this._onUpdateCallback !== null)
	        {
	            this._onUpdateCallback.call(this._onUpdateContext, this._object, value);
	        }

	        if (elapsed == 1)
	        {
    	        this.isRunning = false;

	            if (this._onCompleteCallback !== null && this._onCompleteCalled == false)
	            {
	                this._onCompleteCalled = true;
	                this._onCompleteCallback.apply(this._onCompleteContext, this._object);
	            }

	            for (var i = 0; i < this._chainedTweens.length; i++)
	            {
	                this._chainedTweens[i].start();
	            }

	            return false;

	        }

	        return true;

	    }

    }
}
