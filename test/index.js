var assert = require('chai').assert;
var _ = require('underscore');
var $ = window.$ = require('jquery');
var WhenInViewport = require('../');

var testElement;
var anotherTestElement;
var spacer1;
var spacer2;

var windowHeight;

beforeEach(function() {

    windowHeight = window.innerHeight;

    window.scrollTo(0, 0);

    $('body').css({
        height: '10000px',
        margin: 0,
        padding: 0
    }).html('').append(
        '<div id="spacer1" style="height: ' + 2 * windowHeight + 'px"></div>' +
        '<div id="test"></div>' +
        '<div id="spacer2" style="height: ' + windowHeight + 'px"></div>' +
        '<div id="anotherTest"></div>'
    );

    testElement = document.getElementById('test');
    anotherTestElement = document.getElementById('anotherTest');
    spacer1 = document.getElementById('spacer1');
    spacer2 = document.getElementById('spacer2');

    WhenInViewport.destroy();

});

describe('WhenInViewport', function() {

    it('fires callback with element as parameter', function(done) {

        new WhenInViewport(testElement, function(elementInViewport) {
            assert.strictEqual(elementInViewport, testElement);
            done();
        });

        window.scrollTo(0, 2 * windowHeight);

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

        window.scrollTo(0, windowHeight - 100);

    });

    it('stops listening when required', function(done) {

        var elementInViewport = false;
        var anotherElementViewport = false;

        new WhenInViewport(testElement, function() {
            elementInViewport = true;
        }).stopListening();

        new WhenInViewport(anotherTestElement, function() {
            anotherElementViewport = true;
        });

        window.scrollTo(0, 2 * windowHeight - 100);

        setTimeout(function() {
            assert.isFalse(elementInViewport);
            assert.isFalse(anotherElementViewport);
            done();
        }, 10);

    });

    it('properly sets rate limiter', function(done) {

        var inViewport = false;

        WhenInViewport.setRateLimiter(_.debounce, 500);

        new WhenInViewport(testElement, function() {
            inViewport = true;
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {

            assert.isFalse(inViewport);

            setTimeout(function() {

                assert.isTrue(inViewport);
                WhenInViewport.setRateLimiter(function(callback) { return callback; }, 100);
                done();

            }, 550);

        }, 10);

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

        spacer1.style.height = '50px';
        spacer2.style.height = '50px';

        window.dispatchEvent(new Event('resize'));

        setTimeout(function() {
            assert.isTrue(elementInViewport);
            assert.isTrue(anotherElementViewport);
            done();
        }, 10);

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

        spacer1.style.height = '50px';
        spacer2.style.height = '50px';

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

        assert.instanceOf($testElement.data('whenInViewport'), WhenInViewport);

        $anotherTestElement.whenInViewport({
            callback: function($el) {
                $el.addClass('inViewport');
                assert.strictEqual(this, testContext);
            },
            threshold: 100,
            context: testContext
        });

        window.scrollTo(0, 3 * windowHeight);

        setTimeout(function() {
            assert.isTrue($testElement.hasClass('inViewport'));
            assert.isFalse($testElement.hasClass('againInViewport'));
            assert.isTrue($anotherTestElement.hasClass('inViewport'));
            done();
        }, 10);

    });

});
