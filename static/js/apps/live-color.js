import $ from "jquery";
import _c from 'jquery-color';

const DEBUG = false;

class LiveColor {

  constructor(opts) {
    if (DEBUG) console.log('LiveColor: - constructor');

    this.bg_color = '#efefef';
    this.fg_color = '#000000';

    // this.bg_color = '#000000';
    // this.fg_color = '#ff00ff';


    $("head").append("<style id='livecolor_stylesheet_bg'></style>");
    $("head").append("<style id='livecolor_stylesheet_fg'></style>");

    this.stylesheet_bg = $('#livecolor_stylesheet_bg');
    this.stylesheet_fg = $('#livecolor_stylesheet_fg');

    if (this.bg_color !== undefined) {
      setTimeout(() => {
        this.set_color(this.bg_color, this.fg_color, 1);
      }, 1)
    }

    this.bindings();

  };

  bindings() {
    if (DEBUG) console.log('LiveColor: - bindings');

    window.addEventListener('livecolor:changed', (e) => {
      if (DEBUG) console.info('livecolor:changed', e);
      this.set_color(e.detail.bg, e.detail.fg, e.detail.duration);
    }, false);


  };


  set_color(bg_color, fg_color, duration) {

    if (DEBUG) console.group('LiveColor: - set_color', bg_color, fg_color, duration);

    duration = duration || 100;
    fg_color = fg_color || get_contrast_color(bg_color);


    /////////////////////////////////////////////////////////////////
    // backgrounds
    /////////////////////////////////////////////////////////////////
    $('html *[data-livebg]').animate({
      backgroundColor: bg_color
    }, duration);

    $('html *[data-livefill]').animate({
      svgFill: bg_color
    }, duration);

    // we need to remove the stylesheet from the dom as it would override the animations
    this.stylesheet_bg.text('');

    // add colors and re-add styles after animation
    let style_bg = '';
    style_bg += '[data-livebg] { background-color: ' + bg_color + '; }';
    style_bg += '[data-livefill] { fill: ' + bg_color + '; }';

    // TODO: not so nice. these styles have to be added immediately, as no animations possible
    let style_bg_immediate = '';
    style_bg_immediate += '[data-livehover]:hover { background-color: ' + fg_color + ' !important; color: ' + bg_color + ';}';
    style_bg_immediate += '[data-livehover]:hover polyline { stroke: ' + bg_color + ' !important;}';

    this.stylesheet_bg.text(style_bg_immediate);
    if (DEBUG) console.debug('set immediate bg stylesheet');

    setTimeout(() => {
      this.stylesheet_bg.text(style_bg_immediate + style_bg);
      if (DEBUG) console.debug('set delayed bg stylesheet');
      // console.debug('sheet', style_bg_immediate + style_bg)
    }, duration);


    /////////////////////////////////////////////////////////////////
    // foreground
    /////////////////////////////////////////////////////////////////

    let duration_fg = 1000;
    let delay = Number((duration - duration_fg) / 2);

    if (duration < duration_fg) {
      duration_fg = duration;
      delay = 0;
    }


    setTimeout(() => {

      /**/
      $('html *[data-livefg]').animate({
        color: fg_color,
        borderColor: fg_color
      }, duration_fg);

      $('html *[data-livefg] a').animate({
        color: fg_color,
        borderColor: fg_color
      }, duration_fg);

      $('html *[data-livefg-inverse]').animate({
        color: bg_color,
        borderColor: bg_color
      }, duration_fg);

      // $('html *[data-livestroke]').animate({
      //   svgStroke: fg_color
      // }, duration_fg);

      $('html *[data-livestroke]').css('stroke', fg_color);

      $('html *[data-livefill-inverse]').animate({
        svgFill: fg_color
      }, duration);

      //$('html *[data-livefill-inverse]').css('fill', fg_color);


      $('html *[data-livebg-inverse]').animate({
        backgroundColor: fg_color
      }, duration);

      if (DEBUG) console.debug('initialized fg animations');
      setTimeout(() => {
        if (DEBUG) console.debug('finished fg animations');
      }, duration)



      // we need to remove the stylesheet from the dom as it would override the animations
      this.stylesheet_fg.text('');
      if (DEBUG) console.debug('emptied fg stylesheet');

      const fg_sheet = get_fg_stylesheet(fg_color, bg_color);
      // if (DEBUG) console.debug('fg - sheet', fg_sheet);

      // styles replacement
      setTimeout(() => {
        //this.stylesheet_fg.text(style_fg);
        this.stylesheet_fg.text(fg_sheet);
        if (DEBUG) console.debug('set delayed fg stylesheet');
      }, duration_fg);

    }, delay);



    setTimeout(() => {
      console.groupEnd();
    }, delay * 2 + duration_fg + 2000)

  };

}

module.exports = LiveColor;


const get_bg_stylesheet = (fg_color, bg_color) => {
  const style = `
    [data-livebg] {
      background-color: ${bg_color} !important;
    }
    [data-livefill] {
      fill: ${bg_color};
    }
  `;
  return style;
};


const get_fg_stylesheet = (fg_color, bg_color) => {
  const style = `
    [data-livefg] {
      color: ${fg_color} !important;
      border-color: ${fg_color};
    }
    [data-livefg] a {
      color: ${fg_color};
      border-color: ${fg_color};
    }
    [data-livefg-inverse] {
      color: ${bg_color} !important;
      border-color: ${bg_color} !important;
    }
    [data-livefill-inverse] {
      fill: ${fg_color};
    }
    [data-livebg-inverse] {
      background-color: ${fg_color} !important;
    }
    html.turbolinks-progress-bar::before {
      background-color: ${fg_color} !important;
    }
    .menu .hover {
      background-color: ${fg_color} !important;
    }
    .menu .hover a,
    .menu > li > ul a{
      color: ${bg_color} !important;
    }
  `;
  return style;
};


const get_contrast_color = (color) => {

  var n_threshold = 105;

  var r = parseInt(color.substring(1, 3), 16);
  var g = parseInt(color.substring(3, 5), 16);
  var b = parseInt(color.substring(5, 7), 16);

  var bg_delta = (r * 0.299) + (g * 0.587) + (b * 0.114);

  return ((255 - bg_delta) < n_threshold) ? "#000000" : "#ffffff";
};
