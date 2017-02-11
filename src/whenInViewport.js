(function(factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {

    var $window = $(window),
        elRegistry = {},
        delayTimeout = 100,
        windowHeight,
        delayEngine = function(callback, timeout) {
            return callback;
        },
        processRegistryWithDelay;

    var events = {

        setuped: false,

        setup: function() {

            if (this.setuped) { return; }

            this.scrollHandler = this.scrollHandler || delayEngine(processRegistry, delayTimeout);
            this.resizeHandler = this.resizeHandler || delayEngine(adjustPositions, delayTimeout);

            $window.on('scroll', this.scrollHandler).on('resize', this.resizeHandler);

            this.setuped = true;
            windowHeight = $window.height();

        },

        destroy: function() {

            this.setuped && $window.off('scroll', this.scrollHandler).off('resize', this.resizeHandler);
            this.setuped = false;

        },

        checkRegistry: function() {

            !$.isEmptyObject(elRegistry) ? this.setup() : this.destroy();

        }

    };

    function registerElement($el, options) {

        registerElement.counter = registerElement.counter || 0;

        var registryKey =  'whenInViewport' + (++registerElement.counter);

        elRegistry[registryKey] = $.extend({}, $.whenInViewport.defaults, options, {
            '$el':  $el,
            'topOffset': $el.offset().top
        });

        processRegistryWithDelay || (processRegistryWithDelay = delayEngine(processRegistry, 0));
        processRegistryWithDelay();

        return registryKey;

    }

    function processRegistry() {

        var scrollOffset = $window.scrollTop();

        for (var key in elRegistry) {

            var item = elRegistry[key];

            if (scrollOffset + windowHeight > item.topOffset - item.threshold) {

                delete elRegistry[key];
                item.callback.call(item.context || window, item.$el);

                events.checkRegistry();

            }
        }

    }

    function adjustPositions() {

        windowHeight = $window.height();

        for (var key in elRegistry) {

            elRegistry[key].topOffset = elRegistry[key].$el.offset().top;

        }

    }

    function WhenInViewport(el, options) {

        typeof windowHeight === 'undefined' && (windowHeight = $window.height());
        this.key = registerElement($(el), options);
        events.checkRegistry();

    }

    WhenInViewport.prototype.stopListening = function() {

        delete elRegistry[this.key];
        events.checkRegistry();

    };

    $.extend(WhenInViewport, {
        setDelayEngine: function(engine) {
            delayEngine = engine;
            return this;
        },
        setDelayTimeout: function(timeout) {
            delayTimeout = timeout;
            return this;
        },
        checkAll: function() {
            adjustPositions();
            processRegistry();
            return this;
        },
        destroy: function() {
            elRegistry = {};
            events.destroy();
        }
    });

    WhenInViewport.defaults = {
        callback: function() {},
        threshold: 0,
        context: null,
        setupOnce: false
    };

    $.WhenInViewport = $.whenInViewport = WhenInViewport;

    $.fn.whenInViewport = function(options, moreOptions) {

        if (typeof options === 'function') {
            options = $.extend({}, moreOptions, {'callback': options});
        }

        return this.each(function() {

            if (options.setupOnce) {
                !$.data(this, 'whenInViewport') && $.data(this, 'whenInViewport', new WhenInViewport(this, options));
            } else {
                $.data(this, 'whenInViewport', new WhenInViewport(this, options));
            }

        });

    };

    return $;

}));
