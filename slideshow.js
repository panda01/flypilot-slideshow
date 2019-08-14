(function($) {
	var arrowsMarkup = '<div class="arrows"><div class="left_arrow"></div><div class="right_arrow"></div></div>';
	var clickAreaMarkup = '<div class="left_arrow click_area"></div><div class="right_arrow click_area"></div>';
	var slideshowMarkup = '<div class="slideshows">' + clickAreaMarkup + '<div class="frame overlay"><img /></div><div class="buffer overlay"><img /></div><div class="frame_wrapper"><div class="prev"><img /></div><div class="frame"><img /></div><div class="buffer"><img /></div><div class="next"><img /></div><div class="fake_wrapper"><div class="fake left_arrow"></div><div class="fake right_arrow"></div></div></div>' + arrowsMarkup + '</div>';
	function setupSlideshows() {
		// Apply proper classes
		$('.fly_slideshow').each(function(idx, el) {
			var imgsArr = [];
			var $origSlideshow = $(el);
			var currSlideshowID = parseInt($origSlideshow.data('slideshow-id'), 10);
			var isNotAValidID = isNaN(currSlideshowID);
			if(isNotAValidID) {
				return;
			}

			$origSlideshow.children('img').each(function(idx, img) {
				imgsArr.push(img);
			});

			$origSlideshow.data('imgsArr', imgsArr);
			$origSlideshow.data('currIdx', 0);

			var isRightAligned = $origSlideshow.hasClass('js_slideshow_right');

			var $slideshowMarkup = $(slideshowMarkup);
			if(isRightAligned) {
				$slideshowMarkup.addClass('right_aligned');
			} else {
				$slideshowMarkup.addClass('left_aligned');
			}
			$slideshowMarkup.data('origEl', el);
			$slideshowMarkup.data('imgsArr', imgsArr);
			$slideshowMarkup.data('currIdx', 0);
			var isAnimating = false;
			$slideshowMarkup.on('click', '.left_arrow, .right_arrow', function(evt) {
				if(isAnimating) {
					return false;
				}
				isAnimating = true;
				var $arrow = $(evt.target);
				var leftWasClicked = $arrow.hasClass('left_arrow');
				var $slideshowWrapper = $arrow.parents('.slideshows');
				var arrLength = $slideshowWrapper.data('imgsArr').length;
				if(leftWasClicked) {
					$slideshowWrapper.addClass('forward');
					var nextIdx = $slideshowWrapper.data('currIdx') + 1;
					if(nextIdx >= arrLength) {
						nextIdx = 0;
					}
				} else {
					$slideshowWrapper.addClass('backward');
					var nextIdx = $slideshowWrapper.data('currIdx') - 1;
					if(nextIdx < 0) {
						nextIdx = arrLength - 1;
					}
				}
				setOverlayImage($slideshowWrapper[0], nextIdx);
				$slideshowWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
					$slideshowWrapper.data('currIdx', nextIdx);
					showProperImageForSlideshow($slideshowWrapper[0], nextIdx);
					isAnimating = false;
				});
			});
			var lastMouseXPos = false;
			var lastTimeStamp = false;
			var DRAG_TIME_THRESHOLD = 100;
			$slideshowMarkup.on('mousedown', function(evt) {
				var clickedLeftArrow = $(evt.target).hasClass('left_arrow');
				var clickedRightArrow = $(evt.target).hasClass('right_arrow');
				if(clickedRightArrow || clickedLeftArrow) {
					console.log('clicked inside arrows');
					return;
				}
				lastMouseXPos = evt.pageX;
				lastTimeStamp = evt.timeStamp;
				evt.preventDefault();
			});
			$slideshowMarkup.on('mousemove', function(evt) {
				var alreadyRan = lastMouseXPos === false;
				if(alreadyRan) {
					return;
				}
				var timeDiff = evt.timeStamp - lastTimeStamp;
				var timeInThreshold = timeDiff < DRAG_TIME_THRESHOLD;
				if(timeInThreshold) {
					return;
				}

				var currMousePos = evt.pageX;
				var isDragLeft = currMousePos < lastMouseXPos;
				lastMouseXPos = false;

				if(isDragLeft) {
					$slideshowMarkup.find('.arrows .left_arrow').click();
				} else {
					$slideshowMarkup.find('.arrows .right_arrow').click();
				}
			});
			setOverlayImage($slideshowMarkup[0], 0);
			showProperImageForSlideshow($slideshowMarkup[0]);
			$(el).append($slideshowMarkup);
		});

		$('body').on('keydown', function(evt) {
			var RIGHT_KEY = 39;
			var LEFT_KEY = 37;
			var isGoingRight = evt.which === RIGHT_KEY;
			var isGoingLeft = evt.which === LEFT_KEY;
			if(!isGoingRight && !isGoingLeft) {
				return;
			}
			$('.slideshows').each(function(idx, slideshowEl) {
				var THRESHOLD = 100;
				var clientRect = slideshowEl.getBoundingClientRect();
				var windowScroll = window.scrollY;
				var windowheight = window.innerHeight;
				var screenBottom = windowScroll + window.innerHeight;

				var topInThreshold = clientRect.top > 0 && clientRect.top < windowheight * 0.5;
				var bottInThreshold = clientRect.bottom > windowheight * 0.5 && clientRect.bottom < windowheight;

				if(bottInThreshold || topInThreshold) {
					if(isGoingLeft) {
						$(slideshowEl).find('.arrows .left_arrow').click();
					} else {
						$(slideshowEl).find('.arrows .right_arrow').click();
					}
					return false;
				}
			});
		});
	}
	function setOverlayImage(el, idx) {
		var $slideshow = $(el);
		var imgsArr = $slideshow.data('imgsArr');

		var $frame = $slideshow.find('.frame.overlay img')[0];
		var frameImgObj = imgsArr[idx];


		var bufferImgIdx = idx + 1;
		if(bufferImgIdx >= imgsArr.length) {
			bufferImgIdx = 0;
		}
		var $buffer = $slideshow.find('.buffer.overlay img')[0];
		var bufferImgObj = imgsArr[bufferImgIdx];

		copyImageAttrs($frame, frameImgObj);
		copyImageAttrs($buffer, bufferImgObj);
	}
	function showProperImageForSlideshow(el, currIdx) {
		var $slideshow = $(el);
		$slideshow.removeClass('forward backward');

		if(currIdx === undefined) {
			currIdx = $slideshow.data('currIdx');
		}
		var imgsArr = $slideshow.data('imgsArr');


		var $frame = $slideshow.find('.frame:not(.overlay) img')[0];
		var frameImgObj = imgsArr[currIdx];


		var bufferImgIdx = currIdx + 1;
		if(bufferImgIdx >= imgsArr.length) {
			bufferImgIdx = 0;
		}
		var $buffer = $slideshow.find('.buffer:not(.overlay) img')[0];
		var bufferImgObj = imgsArr[bufferImgIdx];


		var prevImgIdx = currIdx - 1;
		if(prevImgIdx < 0) {
			prevImgIdx = imgsArr.length - 1;
		}
		var $prev = $slideshow.find('.prev img')[0];
		var prevImgObj = imgsArr[prevImgIdx];


		var nextImgIdx = bufferImgIdx + 1;
		if(nextImgIdx >= imgsArr.length) {
			nextImgIdx = 0;
		}
		var $next = $slideshow.find('.next img')[0];
		var nextImgObj = imgsArr[nextImgIdx];

		// Assigning all of the images
		copyImageAttrs($frame, frameImgObj);
		copyImageAttrs($buffer, bufferImgObj);
		copyImageAttrs($prev, prevImgObj);
		copyImageAttrs($next, nextImgObj);

	}
	function copyImageAttrs(to, from) {
		var attrsToCopy = ['src', 'srcset', 'sizes', 'alt', 'style'];
		var $to = $(to);
		var $from = $(from);
		attrsToCopy.forEach(function(attr) {
			var isEmpty = from[attr].length === 0;
			if(!isEmpty) {
				$to.attr(attr, $from.attr(attr));
			}
		});
	}
	$(document).ready(function() {
		var isAdminMode =$('body.fl-builder-edit').length > 0;
		if(!isAdminMode) {
			setupSlideshows();
		}

	});
}(jQuery));

window.flypilot_slideshows = {};
