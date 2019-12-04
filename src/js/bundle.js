// global stylesheet import
import '../sass/screen.sass';

import Turbolinks from "turbolinks";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;


const DEBUG = true;


// site apps
import AppInitializer from './initializer'






/*********************************************************
* turbolinks handling
**********************************************************/
const use_turbolinks = true;
if (use_turbolinks) {
    Turbolinks.start();
}

$((e) => {
    // initializer has to wait for dom ready, as
    // vue apps need container to mount
    const initializer = new AppInitializer({});

    const content_changed_event = new Event('content:changed');
    setImmediate(() => {
        window.dispatchEvent(content_changed_event);
    });

    document.addEventListener('turbolinks:load', (e) => {
        window.dispatchEvent(content_changed_event);
    });

});
