(function($){
	var $main_menu = $('ul.nav'),
		$featured = $('#featured'),
		$comment_form = jQuery('form#commentform'),
		et_slider,
		$spotlight = $('#spotlight');

	$(document).ready(function(){
		
		//login
		$('#login-trigger').click(function(){
			$(this).next('#login-content').slideToggle();
			$(this).toggleClass('active');					

			if ($(this).hasClass('active')) $(this).find('span').html('&#x25B2;');
			else $(this).find('span').html('&#x25BC;');
		});
		
		
		
		
		$main_menu.superfish({ 
			delay:       300,                            // one second delay on mouseout 
			animation:   {opacity:'show',height:'show'},  // fade-in and slide-down animation 
			speed:       'fast',                          // faster animation speed 
			autoArrows:  true,                           // disable generation of arrow mark-up 
			dropShadows: false                            // disable drop shadows 
		});
		
		$('#main-area').fitVids();
		
		if ($spotlight.length){
			var settings = {
				randomize: true,
				slideshow: false,
				controlNav: false,
				directionNav: false,
				itemMargin: 0
			};
			
			if ($spotlight.hasClass('et_slider_auto')){
				settings.slideshow = true;
				settings.slideshowSpeed = 7000;
				settings.animation = 'fade';
				settings.pauseOnHover = true;
				$spotlight.flexslider(settings);
			}
			
			
		}
		
		if ( $featured.length ){
			var et_slider_settings = {
				slideshow: false,
				before: function( slider ){
					et_slider_animate_items( et_slider.find( '.slide' ).eq( slider.animatingTo ) );
				},
				start: function( slider ) {
					et_slider = slider;
					
					et_slider_animate_items( et_slider.find( '.slide' ).eq( slider.animatingTo ) );
				}
			};

			if ( $featured.hasClass('et_slider_auto') ) {
				var et_slider_autospeed_class_value = /et_slider_speed_(\d+)/g;
				
				et_slider_settings.slideshow = true;
				
				et_slider_autospeed = et_slider_autospeed_class_value.exec( $featured.attr('class') );
				
				et_slider_settings.slideshowSpeed = et_slider_autospeed[1];
			}
			
			if ( $featured.hasClass('et_slider_effect_slide') ){
				et_slider_settings.animation = 'slide';
			}
			
			et_slider_settings.pauseOnHover = true;
			
			$featured.flexslider( et_slider_settings );
			
			$featured.hover( function(){
				$(this).find('.flex-direction-nav .prev').css( { 'display' : 'block', 'opacity' : '0' } ).stop(true,true).animate( { 'opacity' : '1', 'left' : '100px' }, 500 )
				.end().find('.flex-direction-nav .next').css( { 'display' : 'block', 'opacity' : '0' } ).stop(true,true).animate( { 'opacity' : '1', 'right' : '100px' }, 500 );
			}, function(){
				$(this).find('.flex-direction-nav .prev').stop(true,true).animate( { 'opacity' : '0', 'left' : '80px' }, function(){ $(this).css( 'display', 'none' ) } )
				.end().find('.flex-direction-nav .next').stop(true,true).animate( { 'opacity' : '0', 'right' : '80px' }, function(){ $(this).css( 'display', 'none' ) } );
			} );
		}
		
		$comment_form.find('input:text, textarea').each(function(index,domEle){
			var $et_current_input = jQuery(domEle),
				$et_comment_label = $et_current_input.siblings('label'),
				et_comment_label_value = $et_current_input.siblings('label').text();
			if ( $et_comment_label.length ) {
				$et_comment_label.hide();
				if ( $et_current_input.siblings('span.required') ) { 
					et_comment_label_value += $et_current_input.siblings('span.required').text();
					$et_current_input.siblings('span.required').hide();
				}
				$et_current_input.val(et_comment_label_value);
			}
		}).bind('focus',function(){
			var et_label_text = jQuery(this).siblings('label').text();
			if ( jQuery(this).siblings('span.required').length ) et_label_text += jQuery(this).siblings('span.required').text();
			if (jQuery(this).val() === et_label_text) jQuery(this).val("");
		}).bind('blur',function(){
			var et_label_text = jQuery(this).siblings('label').text();
			if ( jQuery(this).siblings('span.required').length ) et_label_text += jQuery(this).siblings('span.required').text();
			if (jQuery(this).val() === "") jQuery(this).val( et_label_text );
		});

		$comment_form.find('input#submit').click(function(){
			if (jQuery("input#url").val() === jQuery("input#url").siblings('label').text()) jQuery("input#url").val("");
		});
		
		if ( $('ul.et_disable_top_tier').length ) $("ul.et_disable_top_tier > li > ul").prev('a').attr('href','#');
		
		et_duplicate_menu( $('ul.nav'), $('#main-header .mobile_nav'), 'mobile_menu', 'et_mobile_menu' );
		
		et_search_bar();
		
		function et_search_bar(){
			var $searchform = $('.widget_etsearchwidget #search-form'),
				$searchinput = $searchform.find("#searchinput"),
				searchvalue = $searchinput.val();
				
			$searchinput.focus(function(){
				if (jQuery(this).val() === searchvalue) jQuery(this).val("");
			}).blur(function(){
				if (jQuery(this).val() === "") jQuery(this).val(searchvalue);
			});
		}
		
		function et_duplicate_menu( menu, append_to, menu_id, menu_class ){
			var $cloned_nav;
			
			menu.clone().attr('id',menu_id).removeClass().attr('class',menu_class).appendTo( append_to );
			$cloned_nav = append_to.find('> ul');
			$cloned_nav.find('.menu_slide').remove();
			$cloned_nav.find('li:first').addClass('et_first_mobile_item');
			
			append_to.click( function(){
				if ( $(this).hasClass('closed') ){
					$(this).removeClass( 'closed' ).addClass( 'opened' );
					$cloned_nav.slideDown( 500 );
				} else {
					$(this).removeClass( 'opened' ).addClass( 'closed' );
					$cloned_nav.slideUp( 500 );
				}
				return false;
			} );
			
			append_to.find('a').click( function(event){
				event.stopPropagation();
			} );
		}
		
		/*
		 * Animates slider items one by one using css3
		 */
		function et_slider_animate_items( active_slide ){
			var animation_speed = 400;
			
			active_slide.find( 'h2, .description' ).css( 'opacity', '0' ).end().find( '.et_animated_item' ).removeClass( 'et_animated_item' );
			
			setTimeout( function() {
				active_slide.find( 'img' ).addClass( 'et_animated_item' );
				
				setTimeout( function() {
					active_slide.find( '.description' ).addClass( 'et_animated_item' ).css( 'opacity', '1' );
					
					setTimeout( function() {
						active_slide.find( 'h2' ).addClass( 'et_animated_item' ).css( 'opacity', '1' );
					}, animation_speed );
				}, animation_speed );
			}, animation_speed );
		}
	});
})(jQuery)