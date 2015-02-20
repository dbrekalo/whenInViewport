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
		},

		processRegistryWithDelay;

	var events = {

		setuped: false,

		setup: function(){

			if (this.setuped) { return; }

			this.scrollHandler = this.scrollHandler || delayEngine(processRegistry, delayTimeout);
			this.resizeHandler = this.resizeHandler || delayEngine(adjustPositions, delayTimeout);

			$window.on('scroll', this.scrollHandler).on('resize', this.resizeHandler);

			this.setuped = true;
			windowHeight = $window.height();

		},

		destroy: function(){

			this.setuped && $window.off('scroll', this.scrollHandler).off('resize', this.resizeHandler);
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

		processRegistryWithDelay || (processRegistryWithDelay = delayEngine(processRegistry, 0));
		processRegistryWithDelay();

	}

	function processRegistry(){

		var scrollOffset = $window.scrollTop();

		$.each(elRegistry, function(key, options){

			if (scrollOffset + windowHeight > options.topOffset - options.threshold) {

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

		typeof windowHeight === 'undefined' && (windowHeight = $window.height());
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
		},
		destroy: function(){
			elRegistry = {};
			events.destroy();
		}
	});

	$.whenInViewport = WhenInViewport;

	$.whenInViewport.defaults = {
		'callback': function(){},
		'threshold': 0,
		'context': null,
		'setupOnce': false
	};

	$.fn.whenInViewport = function(options, moreOptions) {

		if (typeof options === 'function'){
			options = $.extend({}, moreOptions, {'callback': options});
		}

		return this.each(function(){

			if (options.setupOnce && !$.data(this, 'whenInViewport')) {
				$.data(this, 'whenInViewport', new WhenInViewport(this, options));
			} else {
				new WhenInViewport(this, options);
			}

		});

	};

})(window.jQuery || window.Zepto, window);