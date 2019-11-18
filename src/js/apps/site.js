import $ from "jquery";

const DEBUG = true;


class SiteUI {

  constructor(opts) {
    if (DEBUG) console.log('NavigationApp: - constructor');
    this.bindings();



  };

  bindings() {
    if (DEBUG) console.log('SiteUI: - bindings');

    $(document).on('click', '#top_bar [data-toggle-navigation]', (e) => {
      $('#top_bar').toggleClass('extended');
    });

    $(document).on('click', '#top_bar a', (e) => {
      $('#top_bar').removeClass('extended');
    });


  };

}

export default SiteUI;
// module.exports = SiteUI;
