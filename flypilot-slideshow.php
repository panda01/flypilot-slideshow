<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Plugin Name: FlyPilot Slideshow
 * Description: A simple slideshow plugin for use in and out of beaver builder
 * Version: 1.0
 * Author: Khalah Jones-Golden, The FlyPilot Team
 *
 */

function add_slideshow_posttype() {
	register_post_type('slideshows', array(
		'label' => 'slideshows',
		'labels' => array(
			'name' => 'Slideshows',
			'singular_name' => 'Slideshow',
		),
		'description' => 'Slideshows Post type to add a slideshow anywhere',
		'supports' => false,
		'public' => true
	));
}

add_filter('the_posts', 'conditionally_add_scripts_and_styles'); // the_posts gets triggered before wp_head
function conditionally_add_scripts_and_styles($posts){
	if (empty($posts)) return $posts;

	$shortcode_found = false; // use this flag to see if styles and scripts need to be enqueued
	foreach ($posts as $post) {
		if (stripos($post->post_content, 'flyslideshow') !== false) {
			$shortcode_found = true; // bingo!
			break;
		}
	}

	if ($shortcode_found) {
		// enqueue here
		wp_enqueue_style('flyslideshow-css', '/wp-content/plugins/flypilot-slideshow/slideshow.css');
		wp_enqueue_script('flyslideshow-js', '/wp-content/plugins/flypilot-slideshow/slideshow.js', array('jquery'));
	}

	return $posts;
}

function add_slideshow_shortcode($attributes) {
	$settings = shortcode_atts( array(
		'id' => false,
		'align' => 'left'
	), $attributes);

	$post_id = $settings['id'];
	$no_id_selected = $post_id === false;
	if ($no_id_selected) {
		return '';
	}
	$ret_array = array();
	$img_markup = '';
	if(have_rows('slides', $post_id)) {
		while(have_rows('slides', $post_id)) {
			the_row();
			$slide_array = array(
				'image' => get_sub_field('image'),
				'position' => get_sub_field('image_position'),
				'caption' => get_sub_field('caption')
			);
			$img_classes = ' class="placeholder_image"';
			$img_attrs = $img_classes . ' style="object-position: ' . str_replace('_', ' ', $slide_array['position']) . '"';
			if( function_exists('flypilot_print_image_markup') ) {
				$has_specific_position = !empty($slide_array['position']);
				if($has_specific_position) {
					$img_style = ' style="object-position: ' . str_replace('_', ' ', $slide_array['position']) . '"';
				} else {
					$img_style = ' style="object-position: ' . str_replace('_', ' ', get_sub_field('image_position')) . '"';
				}

				$img_markup .= '<img src="' . $slide_array['image']['url'] . '"' . $img_classes . $img_style . ' />';
			} else {
				$img_markup .= '<img src="' . $slide_array['image']['url'] . '"' . $img_attrs . ' />';
			}
			array_push($ret_array, $slide_array);
		}
	}
	$align = $settings['align'] === 'left' ? 'js_slideshow_left' : 'js_slideshow_right';
	return '<div class="fly_slideshow ' . $align . '" data-slideshow-id="' . $post_id . '">
				' . $img_markup . '
				<script type="text/javascript">
					window.flypilot_slideshows[' . $post_id . '] = ' . json_encode($ret_array) . ';
				</script>
			</div>';
}

function add_slideshow_custom_fields() {
	if( function_exists('acf_add_local_field_group') ):

		acf_add_local_field_group(array(
			'key' => 'group_5d4b34ef12496',
			'title' => 'Slideshow Images',
			'fields' => array(
				array(
					'key' => 'field_5d4b34fe51947',
					'label' => 'Slides',
					'name' => 'slides',
					'type' => 'repeater',
					'instructions' => '',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => array(
						'width' => '',
						'class' => '',
						'id' => '',
					),
					'collapsed' => 'field_5d4b350b51948',
					'min' => 0,
					'max' => 0,
					'layout' => 'block',
					'button_label' => '',
					'sub_fields' => array(
						array(
							'key' => 'field_5d4b350b51948',
							'label' => 'Image',
							'name' => 'image',
							'type' => 'image',
							'instructions' => '',
							'required' => 1,
							'conditional_logic' => 0,
							'wrapper' => array(
								'width' => '',
								'class' => '',
								'id' => '',
							),
							'return_format' => 'array',
							'preview_size' => 'medium',
							'library' => 'all',
							'min_width' => '',
							'min_height' => '',
							'min_size' => '',
							'max_width' => '',
							'max_height' => '',
							'max_size' => '',
							'mime_types' => '',
						),
						array(
							'key' => 'field_5d4b351f51949',
							'label' => 'Image Position',
							'name' => 'image_position',
							'type' => 'select',
							'instructions' => '',
							'required' => 0,
							'conditional_logic' => 0,
							'wrapper' => array(
								'width' => '',
								'class' => '',
								'id' => '',
							),
							'choices' => array(
								'left_top' => 'Left Top',
								'center_top' => 'Center Top',
								'right_top' => 'Right Top',
								'left_center' => 'Left Center',
								'center' => 'Center',
								'right_center' => 'Right Center',
								'left_bottom' => 'Left Bottom',
								'center_bottom' => 'Center Bottom',
								'right_bottom' => 'Right Bottom',
							),
							'default_value' => array(
							),
							'allow_null' => 0,
							'multiple' => 0,
							'ui' => 0,
							'return_format' => 'value',
							'ajax' => 0,
							'placeholder' => '',
						),
						array(
							'key' => 'field_5d4b377ac8abe',
							'label' => 'Caption',
							'name' => 'caption',
							'type' => 'text',
							'instructions' => '',
							'required' => 0,
							'conditional_logic' => 0,
							'wrapper' => array(
								'width' => '',
								'class' => '',
								'id' => '',
							),
							'default_value' => '',
							'placeholder' => '',
							'prepend' => '',
							'append' => '',
							'maxlength' => '',
						),
					),
				),
			),
			'location' => array(
				array(
					array(
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'slideshows',
					),
				),
			),
			'menu_order' => 0,
			'position' => 'acf_after_title',
			'style' => 'default',
			'label_placement' => 'top',
			'instruction_placement' => 'label',
			'hide_on_screen' => '',
			'active' => true,
			'description' => '',
		));

endif;
}

function uninstall_flypilot_slideshow() {
	unregister_post_type('slideshows');
}

function activate_flypilot_slideshow_plugin() {
	add_slideshow_posttype();
	add_slideshow_custom_fields();
	add_shortcode('flyslideshow', 'add_slideshow_shortcode');
}

add_action( 'init' ,'activate_flypilot_slideshow_plugin' );
