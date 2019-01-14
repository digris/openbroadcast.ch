import $ from "jquery";

const DEBUG = false;


class SiteUI {

  constructor(opts) {
    if (DEBUG) console.log('NavigationApp: - constructor');
    this.bindings();
    this.layout();
  };

  bindings() {
    if (DEBUG) console.log('SiteUI: - bindings');

      // $(document).on('mouseenter', '.hoverable', function (e) {
      //     $(this).addClass("hover");
      // });
      // $(document).on('mouseleave', '.hoverable', function (e) {
      //     $(this).removeClass("hover");
      // });


  };

  layout() {

  };

}

module.exports = SiteUI;
