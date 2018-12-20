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

document.addEventListener("DOMContentLoaded", (e) => {
    //document.dispatchEvent(content_changed);
});

document.addEventListener('turbolinks:load', (e) => {
    const content_changed = new Event('content:changed')
    if(Object.keys(e.data.timing).length > 0) {
        if (DEBUG) console.debug('turbolinks loaded sequential request');
        document.dispatchEvent(content_changed);

    } else  {
        if (DEBUG) console.debug('turbolinks loaded initial request');
        document.dispatchEvent(content_changed);
    }

});




$((e) => {
    // initializer has to wait for dom ready, as
    // vue apps need container to mount
    const initializer = new AppInitializer({});
});
