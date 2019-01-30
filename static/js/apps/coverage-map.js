import $ from "jquery";


const DEBUG = true;

class CoverageMap {

  constructor(opts) {
    if (DEBUG) console.log('CoverageMap: - constructor');
    this.is_fs = false;


    $(document).on('click', '[data-map-toggle-fs]', (e) => {

      e.preventDefault();

      const el = $(e.currentTarget);
      const container = el.parents('.coverage-map');

      this.is_fs = !this.is_fs;
      if (this.is_fs) {
        container.addClass('fullscreen');
        $('body').addClass('fullscreen-map');

        // recalculate heights
        const iframe_container = $('.iframe-row');
        const iframe_height = $(window).height() - iframe_container.position().top;
        iframe_container.height(iframe_height);

      } else {
        container.removeClass('fullscreen');
        $('body').removeClass('fullscreen-map');
      }
    });


  };

}

module.exports = CoverageMap;
