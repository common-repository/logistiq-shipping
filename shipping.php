<?php 

/**
 * Plugin Name : Logistiq Shipping
 * PHP version 7.4
 * 
 * @category  Shipping_App
 * @package   Shipping
 * @author    Logistiq <tech@logistiq.io>
 * @copyright 2022 Logistiq
 * @license   GPL http://www.gnu.org/licenses/gpl-2.0.txt
 * @link      https://logistiq.io
 * 
 
 * Plugin Name:       Logistiq Shipping
 * Description:       Logistiq WooCommerce App is your one-stop logistics platform for end-to-end shipping
 * Version:           1.4.4
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Logistiq
 * Author URI:        https://logistiq.io
 * Text Domain:       logistiq.io
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */


add_action('admin_menu', 'logistiqIOShippingInitMenu');

/**
 * Init Admin Menu
 *
 * @return void
 */
function logistiqIOShippingInitMenu() 
{
    //The icon in Base64 format
    $icon_base64 = 'PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMTI4LjAwMDAwMHB0IiBoZWlnaHQ9IjEyOC4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDEyOC4wMDAwMDAgMTI4LjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsMTI4LjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTIzMiA4OTcgYy00OCAtMTUgLTEyNyAtODkgLTE1MyAtMTQ1IC0zMyAtNjggLTMyIC0xNjggNCAtMjM4IDI3Ci01NCA3NiAtMTAzIDEzMCAtMTMwIDUwIC0yNiAxNTcgLTMwIDIxNCAtOSA1MyAyMCAxNDMgOTkgMTQzIDEyNCAwIDE4IC02MAoxMjIgLTYwIDEwNSAwIC02IC0xOCAtMzIgLTQwIC01NiAtNDggLTU1IC0xMDkgLTgyIC0xNjAgLTczIC0xNTcgMjkgLTE5MSAyMzMKLTUwIDMwNSA1MCAyNiA5MyAyNSAxNDggLTEgNDcgLTIzIDkxIC04MyAxNjIgLTIxNyAzOCAtNzMgMTEyIC0xNTEgMTY2IC0xNzcKNTUgLTI2IDE1MCAtMzEgMjEyIC0xMSAxODYgNjIgMjQ2IDMxMCAxMDkgNDU1IC0xMDggMTE0IC0zMDkgMTA4IC00MTIgLTExCmwtMzUgLTQxIDMyIC01NyAzMSAtNTcgMzEgNDYgYzM0IDUxIDEwMSA5MSAxNTEgOTEgNzcgLTEgMTQ3IC02MSAxNjEgLTEzOCAxNQotNzYgLTQyIC0xNjIgLTEyMCAtMTgzIC05NSAtMjYgLTE3MCAzMiAtMjYwIDIwMCAtNTcgMTA1IC0xMjYgMTgzIC0xODggMjExCi00OCAyMiAtMTU5IDI2IC0yMTYgN3oiLz4KPC9nPgo8L3N2Zz4K';

    //The icon in the data URI scheme
    $icon_data_uri = 'data:image/svg+xml;base64,' . $icon_base64;
    add_menu_page(__('Logistiq', 'logistiq'), __('Logistiq', 'logistiq'), 'manage_options', 'logistiq', 'logistiqIOShippingAdminPage',  $icon_data_uri, '50');
}

/**
 * Init Admin Page
 * 
 * @return void
 */
function logistiqIOShippingAdminPage()
{
    include_once plugin_dir_path(__FILE__).'templates/app.php';
}

add_action('admin_enqueue_scripts', 'logistiqIOShippingAdminEnqueueScripts');

/**
 * Enqueue Scripts and Styles
 * 
 * @return void
 */
function logistiqIOShippingAdminEnqueueScripts()
{
    wp_enqueue_style('logistiq_style', plugin_dir_url(__FILE__). 'build/index.css');
    wp_enqueue_script('logistiq-script', plugin_dir_url(__FILE__) . 'build/index.js', array( 'wp-element' ), '1.0.0', true);
}


// add_action( 'woocommerce_api_callback', 'callback_handler' );


// function callback_handler()
// {
//     echo "Call back function";
// }


register_activation_hook( __FILE__, 'logistiqio_activation' );

/**
 * Check the version to activate the logistiq function
 *
 * @return void
 */
function logistiqio_activation() {
    global $wp_version;
    $php = '7.2';
    $wp  = '5.2';

    if (version_compare (PHP_VERSION, $php, '<')) {
        deactivate_plugins( basename(__FILE__));
        wp_die(
			'<p>' .
			sprintf(
				__( 'Logistiq Shipping plugin can not be activated because it requires a PHP version greater than %1$s. Your PHP version can be updated by your hosting company.', 'Logistiq Shipping' ),
				$php
			)
			. '</p> <a href="' . admin_url( 'plugins.php' ) . '">' . __( 'go back', 'Logistiq Shipping' ) . '</a>'
		);
    }

    if ( version_compare( $wp_version, $wp, '<' ) ) {
        deactivate_plugins( basename(__FILE__));
		wp_die(
			'<p>' .
			sprintf(
				__( 'Logistiq Shipping plugin can not be activated because it requires a WordPress version greater than %1$s. Please go to Dashboard &#9656; Updates to gran the latest version of WordPress .', 'Logistiq Shipping' ),
				$wp
			)
			. '</p> <a href="' . admin_url( 'plugins.php' ) . '">' . __( 'go back', 'Logistiq Shipping' ) . '</a>'
		);
	}
}

