;(function($, window) {

	var $window = window.app && window.app.$window || $(window),
		elRegistry = {},
		delayTimeout = 100,
		windowHeight,
		delayEngine = function(callback, timeout){

			var f = function(){
				clearTimeout(f.timeout);
				f.timeout = setTimeout(callback, timeout);
			};

			return f;
		};

	var events = {

		namespace: '.whenInViewport',
		setuped: false,

		setup: function(){

			if (this.setuped) { return; }
			$window.on('scroll' + this.namespace , delayEngine(processRegistry, delayTimeout));
			$window.on('resize' + this.namespace , delayEngine(adjustPositions, delayTimeout));
			this.setuped = true;
			windowHeight = $window.height();

		},

		destroy: function(){

			if (this.setuped) { $window.off(this.namespace); }
			this.setuped = false;

		},

		checkRegistry: function(){

			!$.isEmptyObject(elRegistry) ? this.setup() : this.destroy();

		}

	};

	function registerElement($el, options) {

		registerElement.counter = registerElement.counter || 0;

		elRegistry['whenInViewport' + (++registerElement.counter)] = $.extend({}, $.whenInViewport.defaults, options, {
			'$el':  $el,
			'topOffset': $el.offset().top
		});
		processRegistry();

	}

	function processRegistry(){

		var scrollOffset = $window.scrollTop();
		windowHeight = windowHeight || $window.height();

		$.each(elRegistry, function(key, options){

			if (scrollOffset + windowHeight > options.topOffset + options.threshold) {

				options.context ? options.callback.call(options.context, elRegistry[key].$el) : options.callback(elRegistry[key].$el);
				delete elRegistry[key];

				events.checkRegistry();

			}

		});

	}

	function adjustPositions(){

		windowHeight = $window.height();

		$.each(elRegistry, function(key, options){
			elRegistry[key].topOffset = options.$el.offset().top;
		});

	}

	function WhenInViewport(el, options) {

		registerElement($(el), options);
		events.checkRegistry();

	}

	$.extend(WhenInViewport, {
		setDelayEngine: function(engine){
			delayEngine = engine;
			return this;
		},
		setDelayTimeout: function(timeout){
			delayTimeout = timeout;
			return this;
		}
	});

	$.whenInViewport = WhenInViewport;

	$.whenInViewport.defaults = {
		'callback': function(){},
		'threshold': 0,
		'context': null
	};

	$.fn.whenInViewport = function(options) {

		if (typeof options === 'function'){
			options = {'callback': options};
		}

		return this.each(function() {
			if (!$.data(this, 'whenInViewport')) {
				$.data(this, 'whenInViewport', new WhenInViewport(this, options));
			}
		});

	};

})(window.jQuery || window.Zepto, window);