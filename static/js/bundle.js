// global stylesheet import
import '../sass/screen.sass';

import $ from "jquery";


// site apps
import AppInitializer from './initializer'

$((e) => {
    // initializer has to wait for dom ready, as
    // vue apps need container to mount
    const initializer = new AppInitializer({});
});
