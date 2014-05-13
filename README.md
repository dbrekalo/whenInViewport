#When in viewport
Do stuff when element enters viewport with this simple and lightweight jQuery plugin

##Basic usage
```javascript
$('.myModule').whenInViewport(function($el){
	$el.addClass('inViewport');
});

$('.myModule').whenInViewport({
	callback: function($el){
		$el.addClass(this.elementClass);
	},
	threshold: 200,
	context: this
});
```
##Api options
Plugin does simple debouncing of scroll and resize events. Should you choose to alter the delaying / rate-limiting engine (for example delegate to undescore's throttle or debounce functions) two methods are exposed:

```javascript
$.whenInViewport.setDelayEngine(_.throttle).setDelayTimeout(400);
```
