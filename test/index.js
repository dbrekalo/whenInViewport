var assert = require("chai").assert;
var _ = require('underscore');
require('jsdom-global')();

var $ = require('jquery');
window.$ = $;
var WhenInViewport = require("../");

var testElement;
var anotherTestElement;

var scrollTo = function(num, callback) {
    window.pageYOffset = num;
    window.dispatchEvent(new Event('scroll'));
    callback && callback();
};

var resizeHeight = function(num, callback) {
    window.innerHeight = num;
    window.dispatchEvent(new Event('resize'));
    callback && callback();
};

var setElementPosition = function(element, num) {
    element.getBoundingClientRect = function() {
        return {top: num, left: 0};
    }
}

beforeEach(function() {

    $('body').append('<div id="test"></div><div id="anotherTest"></div>');

    window.innerHeight = 500;
    testElement = document.getElementById('test');
    anotherTestElement = document.getElementById('anotherTest')

    scrollTo(0);
    setElementPosition(testElement, 1000);
    setElementPosition(anotherTestElement, 2000);

    WhenInViewport.destroy();

});

describe("WhenInViewport", function() {

    it('fires callback with element as parameter', function(done) {

        new WhenInViewport(testElement, function(elementInViewport) {
            assert.strictEqual(elementInViewport, testElement);
            done();
        });

        scrollTo(1500);

    });

    it('does not fire callback until element is in viewport', function(done) {

        var inViewport = false;

        new WhenInViewport(testElement, function() {
            inViewport = true;
        });

        assert.isFalse(inViewport);
        done();

    });

    it('properly handles given options', function(done) {

        var testContext = {};

        new WhenInViewport(testElement, {
            callback: function(elementInViewport) {
                assert.strictEqual(elementInViewport, testElement);
                assert.strictEqual(this, testContext);
                done();
            },
            context: testContext,
            threshold: 100
        });

        scrollTo(400);

    });

    it('stops listening when required', function(done) {

        var inViewport = false;

        new WhenInViewport(testElement, function(elementInViewport) {
            inViewport = true;
        }).stopListening();

        scrollTo(1500, function() {
            assert.isFalse(inViewport);
            done();
        });

    });

    it('properly sets rate limiter', function(done) {

        var inViewport = false;

        WhenInViewport.setRateLimiter(_.debounce, 500);

        new WhenInViewport(testElement, function() {
            inViewport = true;
        });

        scrollTo(1500, function() {
            assert.isFalse(inViewport);
            setTimeout(function() {
                assert.isTrue(inViewport);
                WhenInViewport.setRateLimiter(function(callback) { return callback; }, 100);
                done();
            }, 550);
        });

    });

    it('processes elements on resize event', function(done) {

        var elementInViewport = false;
        var anotherElementViewport = false;

        new WhenInViewport(testElement, function() {
            elementInViewport = true;
        });

        new WhenInViewport(anotherTestElement, function() {
            anotherElementViewport = true;
        });

        resizeHeight(3000, function() {
            assert.isTrue(elementInViewport);
            assert.isTrue(anotherElementViewport);
            done();
        });

    });

    it('processes elements on user request', function() {

        var elementInViewport = false;
        var anotherElementViewport = false;

        new WhenInViewport(testElement, function() {
            elementInViewport = true;
        });

        new WhenInViewport(anotherTestElement, function() {
            anotherElementViewport = true;
        });

        window.innerHeight = 3000;

        WhenInViewport.checkAll();

        assert.isTrue(elementInViewport);
        assert.isTrue(anotherElementViewport);

    });

    it('works correctly when called through jquery plugin facade', function(done) {

        var $testElement = $(testElement);
        var $anotherTestElement = $(anotherTestElement);
        var testContext = {};

        $testElement.whenInViewport(function($el) {
            $el.addClass('inViewport');
        }, {
            setupOnce: true
        });

        $testElement.whenInViewport(function($el) {
            $el.addClass('againInViewport');
        }, {
            setupOnce: true
        });

        $anotherTestElement.whenInViewport({
            callback: function($el) {
                $el.addClass('inViewport');
                assert.strictEqual(this, testContext);
            },
            threshold: 100,
            context: testContext
        });

        scrollTo(1500, function() {
            assert.isTrue($testElement.hasClass('inViewport'));
            assert.isFalse($testElement.hasClass('againInViewport'));
            assert.isTrue($anotherTestElement.hasClass('inViewport'));
            done();
        });

    });

});