import $ from "jquery";

import debounce from 'debounce';
import ColorThief from '@mariotacke/color-thief';
import _c from 'jquery-color';

const DEBUG = false;

class LiveColor {

  constructor(opts) {
    if (DEBUG) console.log('LiveColor: - constructor');

    const initial_color = '#fff';

    $('head').append('<style id="livecolor_stylesheet"></style>');
    this.stylesheet = $('#livecolor_stylesheet');

    setTimeout(() => {
      this.set_color(initial_color, 1);
    }, 1);


    this.bindings();

    // TODO: more elegant way to handle debounce?
    this.set_color_from_src = debounce(this._set_color_from_src, 200);

  };

  bindings() {

    window.addEventListener('livecolor:from_src', (e) => {
      if (DEBUG) console.info('livecolor:from_src', e);
      this.set_color_from_src(e.detail.src, e.detail.duration || 1000)
    }, false);

  };

  _set_color_from_src(src, duration) {

    if (DEBUG) console.debug('set_color_from_src', src, duration);

    const src_img = new Image();
    src_img.src = src;
    src_img.onload = () => {

      const ct = new ColorThief();
      const color_rgb = ct.getColor(src_img);
      const color_hex = rgb_to_hex(color_rgb);

      this.set_color(color_hex, duration);

    }
  };


  set_color(color, duration) {

    if (DEBUG) console.group('LiveColor: - set_color', bg_color, fg_color, duration);

    duration = duration || 1000;

    /////////////////////////////////////////////////////////////////
    // animate colored backgrounds
    /////////////////////////////////////////////////////////////////

    $('html *[data-livebg]').animate({
      backgroundColor: color
    }, duration);

    // $('html *[data-livefill]').animate({
    //   svgFill: color
    // }, duration);

    // in the middle of the animation (50% of duration) we have to set the foreground colors
    setTimeout(() => {
      const style = get_stylesheet(color);
      this.stylesheet.text(style);
    }, (Math.round(duration / 2) - 0));

    // at the end of the animation the new bg-color has to be added to the stylesheet
    setTimeout(() => {
      const style = `[data-livebg] {
          background-color: ${color};
        }`;
      this.stylesheet.text(this.stylesheet.text() + style);
    }, duration);

  };

}

module.exports = LiveColor;


function rgb_to_hex(rgb) {
  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// https://stackoverflow.com/a/5624139/469111
function hex_to_rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


const get_contrast_color = (color) => {

  if(color === '#000') {
    return '#fff';
  }

  if(color === '#fff') {
    return '#000';
  }

  var n_threshold = 105;

  var r = parseInt(color.substring(1, 3), 16);
  var g = parseInt(color.substring(3, 5), 16);
  var b = parseInt(color.substring(5, 7), 16);

  var bg_delta = (r * 0.299) + (g * 0.587) + (b * 0.114);

  return ((255 - bg_delta) < n_threshold) ? "#000" : "#fff";
};


const get_stylesheet = (color) => {

  color = get_contrast_color(color);
  const color_rgb = hex_to_rgb(color);
  const contrast = get_contrast_color(color);



  const style = `
  [data-livefg] {
    color: ${color};
    border-color: ${color} !important;
  }
  [data-livefg] a {
    color: inherit;
    border-color: inherit;
  }
  [data-livebg-inverse] {
    background-color: ${color} !important;
    color: ${contrast};
  }
  [data-livefill-inverse] {
    fill: ${color};
  }
  [data-livestroke] {
    stroke: ${color};
  }
  [data-livehover] polyline {
    stroke: ${color} !important;
  }
  [data-livehover]:hover {
    background-color: ${color};
  }
  [data-livehover]:hover polyline {
    stroke: ${contrast} !important;
  }
  .topbar .menu .menu-item:hover {
    background-color: rgba(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b}, .9);
    color: ${contrast};
  }
  .topbar .menu .menu-item.selected {
    background-color: ${color};
    color: ${contrast};
  }
  .topbar .menu .menu-item .submenu {
    background-color: rgba(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b}, .9);
  }
  .topbar .menu .menu-item .submenu .menu-item {
    color: ${contrast};
  }
  .turbolinks-progress-bar {
    background-color: ${color};
  }
  `;

  return style


};
