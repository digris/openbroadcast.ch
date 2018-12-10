import $ from "jquery";

const DEBUG = true;


class SiteUI {

  constructor(opts) {
    if (DEBUG) console.log('NavigationApp: - constructor');
    this.bindings();
    this.layout();


    // $(document).foundation();

  };

  bindings() {
    if (DEBUG) console.log('SiteUI: - bindings');

      $(window).on('resize', (e) => {
        this.layout();
      });




      $(document).on('mouseenter', '.hoverable', function (e) {
          $(this).addClass("hover");
      });
      $(document).on('mouseleave', '.hoverable', function (e) {
          $(this).removeClass("hover");
      });
      $(document).on('click', '.clickable', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var url = $(this).data('permalink');
          document.location = url;
      });


  };

  layout() {

    // map width to height

    // timeout only needed for webpack hot-reload
    $('[data-width-to-height]').each( (i, el) => {
      $(el).height($(el).width());
    });
    setTimeout(() => {
      $('[data-width-to-height]').each( (i, el) => {
        $(el).height($(el).width());
      });
    }, 500)


    // hacks for touch devices
    // if ($('html').hasClass('touch')) {
    //   $('.hoverable').removeClass('hoverable').addClass('hoverable_disabled')
    // }

  };

}


module.exports = SiteUI;


var __legacy__SiteUI = function () {

  var self = this;
  this.navigation_active = false;
  this.colors = [
    '#21D9EA',
    '#6C74EE',
    '#75DB87',
    '#609E80'
  ];

  this.colors = [
    '#dddddd'
  ];
  this.current_color = 0;

  this.remote_window = false;

  this.hover_timeouts = [];

  this.bindings = function () {

    $(document).on('mouseenter', '.hoverable', function (e) {
      $(this).addClass("hover");
    });
    $(document).on('mouseleave', '.hoverable', function (e) {
      $(this).removeClass("hover");
    });
    $(document).on('click', '.clickable', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = $(this).data('permalink');
      document.location = url;
    });

    // item linking
    $(document).on('click', '.item[data-permalink], .clickable[data-permalink]', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = $(this).data('permalink');
      try {
        tl_visit(url);
      } catch (e) {
        document.location.href = url;
      }
    });

    $(document).ajaxStart(function () {
      //debug.debug('ajax start');
      //$('body').addClass('xhr-load');
    });
    $(document).ajaxStop(function () {
      //debug.debug('ajax stop');
      //$('body').removeClass('xhr-load');
    });

    $(window).on('resize', function (e) {
      self.layout();
    });

    $(document).on('alogin', function (e, t) {
      if (t == 'auth-state-change') {
        Turbolinks.visit($.address.path())
      }
    });


    ////////////////////////////////////////////////////////////
    // top-bar / menu
    ////////////////////////////////////////////////////////////

    // mobile navigation


    $(document).on('click tap', '.menu .has-children-toggle', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var container = $(this).parents('li');

      $('.children-expanded').not(container).removeClass('children-expanded');
      container.toggleClass('children-expanded');

    });

    $(window).on('changed.zf.mediaquery', function (event, newSize, oldSize) {
      //console.debug(newSize)
    });


  };


  /*
  layout method, called as well on window resize
   */
  this.layout = function () {

    // map width to height
    $('[data-width-to-height]').each(function () {
      $(this).height($(this).width());
    });


    // hacks for touch devices
    if ($('html').hasClass('touch')) {
      $('.hoverable').removeClass('hoverable').addClass('hoverable_disabled')
    }

  };


  this.init_fd5 = function () {
    $(document).foundation();
  };

  this.init = function () {
    self.layout();
    self.bindings();
    self.init_fd5();
  };

};
