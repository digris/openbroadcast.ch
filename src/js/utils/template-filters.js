const _ms_to_time = function (ms) {
  if (ms === undefined) {
    return '';
  }

  if (ms === 0) {
    return '00:00';
  }

  let time = Math.abs(ms);

  let millis = time % 1000;
  time = parseInt(time / 1000);
  let seconds = time % 60;
  time = parseInt(time / 60);
  let minutes = time % 60;
  time = parseInt(time / 60);
  let hours = time % 24;
  let out = "";

  if (hours && hours > 0) {
    if (hours < 10) {
      out += '0';
    }
    out += hours + ':';
  } else {
    // out += '0' + ':';
  }

  if (minutes && minutes > 0) {
    if (minutes < 10) {
      out += '0';
    }
    out += minutes + ':';
  } else {
    out += '00' + ':';
  }

  if (seconds && seconds > 0) {
    if (seconds < 10) {
      out += '0';
    }
    out += seconds + '';
  } else {
    out += '00' + '';
  }

  return out.trim();
};

export function capitalize(value) {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
}


export function s_to_time(s) {
  return _ms_to_time(s * 1000)
}

export function ms_to_time(ms) {
  return _ms_to_time(ms)
}

export function datetime2hhmm(datetime) {
  if (!datetime) {
    return null;
  }
  return datetime.substr(11, 5);
}

export function datetime2hhmmss(datetime) {
  if (!datetime) {
    return null;
  }
  return datetime.substr(11, 8);
}

export function linebreaksbr(value) {
  if (!value) return '';
  value = value.toString();
  const breakTag = '<br>';
  return (value + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

export function truncate(text, length, clamp) {
  return text.slice(0, length) + (length < text.length ? clamp || '...' : '')
}

export function strip_markdown(md, options) {

  options = options || {};
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;

  var output = md;
  try {
    if (options.stripListLeaders) {
      output = output.replace(/^([\s\t]*)([\*\-\+]|\d\.)\s+/gm, '$1');
    }
    if (options.gfm) {
      output = output
      // Header
        .replace(/\n={2,}/g, '\n')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    output = output
    // Remove HTML tags
      .replace(/<(.*?)>/g, '$1')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove Blockquotes
      .replace(/>/g, '')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
      .replace(/([\*_]{1,3})(\S.*?\S)\1/g, '$2')
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      .replace(/^-{3,}\s*$/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n{2,}/g, '\n\n')

      // discogs markup
      .replace(/\[(.*?)\]/g, function dediscogs(match) {
        // strips markup in form of:
        // [a=The Artist] and
        // [The Artist]

        var tr_start = 1;
        if (match.indexOf("=")) {
          tr_start = 3;
        }
        var stripped = match.slice(tr_start, -1);
        return stripped;
      });

  } catch (e) {
    console.error(e);
    return md;
  }
  return output;

}

export const template_filters = {
  ms_to_time: function (value) {
    return ms_to_time(value)
  },
  s_to_time: function (value) {
    return s_to_time(value)
  },
  datetime2hhmm: function (value) {
    return datetime2hhmm(value)
  },
  datetime2hhmmss: function (value) {
    return datetime2hhmmss(value)
  },
  capitalize: function (value) {
    return capitalize(value)
  },
  linebreaksbr: function (value) {
    return linebreaksbr(value)
  },
  strip_markdown: function (value) {
    return strip_markdown(value)
  },
  truncate: function (text, length, clamp) {
    return truncate(text, length, clamp)
  }
};
