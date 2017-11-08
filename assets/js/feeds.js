(function($) {
  'use strict';
  $.fn.yrss = function(url, options, fn) {
    var defaults = {
      ssl: false,
      limit: 10,
      reverse: false,
      cache: true,
      maxage: 3600,
      showerror: true,
      errormsg: '',
      tags: false,
      date: true,
      dateformat: 'default',
      titletag: 'h3',
      content: true,
      image: false,
      snippet: true,
      snippetlimit: 120,
      linktarget: '_self'
    };
    options = $.extend(defaults, options);
    return this.each(function(i, e) {
      var s = '';
      if (options.ssl) {
        s = 's';
      }
      if (!$(e).hasClass('rss-feed')) {
        $(e).addClass('rss-feed');
      }
      if (url === null) {
        return false;
      }
      var query = 'http' + s + '://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from feed where url="' + url + '"');
      if (options.limit !== null) {
        query += ' limit ' + options.limit;
      }
      if (options.reverse) {
        query += ' | reverse()';
      }
      if (options.cache) {
        query += '&_maxage=' + options.maxage;
      }
      query += '&format=json';
      $.getJSON(query, function(data, status, errorThrown) {
        if (status === 'success') {
          process(e, data, options);
          if ($.isFunction(fn)) {
            fn.call(this, $(e));
          }
        } else if (status === 'error' || status === 'parsererror') {
          if (options.showerror) {
            var msg;
            if (options.errormsg !== '') {
              msg = options.errormsg;
            } else {
              msg = errorThrown;
            }
            $(e).html('<div class="rss-error"><p>' + msg + '</p></div>');
          } else {
            return false;
          }
        }
      });
    });
  };
  var process = function(e, data, options) {
    var entries = data.query.results.item;
    if (!$.isArray(entries)) {
      entries = [entries];
    }
    if (!entries) {
      return false;
    }
    var html = '';
    var htmlObject;
    $.each(entries, function(i) {
      var entry = entries[i];
      var tags;
      if (entry.category !== undefined) {
        tags = entry.category.toString().toLowerCase().replace(/ /g, '-').replace(/,/g, ' ');
      }
      var pubDate;
      if (entry.pubDate) {
        var entryDate = new Date(entry.pubDate);
        if (options.dateformat === 'default') {
          pubDate = (entryDate.getMonth() + 1).toString() + '/' + entryDate.getDate().toString() + '/' + entryDate.getFullYear();
        } else if (options.dateformat === 'spellmonth') {
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          pubDate = months[entryDate.getMonth()] + ' ' + entryDate.getDate().toString() + ', ' + entryDate.getFullYear();
        } else if (options.dateformat === 'localedate') {
          pubDate = entryDate.toLocaleDateString();
        } else if (options.dateformat === 'localedatetime') {
          pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
        }
      }
      html += '<div class="col-sm-4" data-aos="fade" data-aos-delay="200"><div class="Blog__post"';
      if (options.tags && entry.category !== undefined) {
        html += 'data-tag="' + tags + '"';
      }
      var image = $(entry.encoded).find('img:first').attr("src");
      html += '><div class="Blog__post-image"><a href="' + entry.link + '"><img src="' + image + '"</a></div>';
      html += '<div class="Blog__post-caption"><h4><a href="' +entry.link + '"></a>' + entry.title + '</a></h4></div>'
      if (options.date && pubDate) {
        html += '<div class="entry-date">' + pubDate + '</div>';
      }
      if (options.tags && entry.category !== undefined) {
        html += '<div class="Blog__post-categories">' + tags + '</div>';
      }
      if (options.content) {
        var content;
        if (entry.description !== undefined) {
          content = $.trim(entry.description);
        } else {
          content = $.trim(entry.encoded);
        }
        html += '<div class="entry-content">' + content + '</div>';
      }

      // if (image) {
      //   html += '<a href="' + entry.link + '"><img src="' + image + '"/></a>';
      // }
      html += '</div></div>';
    });
    htmlObject = $(html);
    if (options.content) {
      $.each(htmlObject, function() {
        if (options.snippet) {
          var content = $(this).find('.entry-content');
          var contentLength = $(content).text().length;
          content.text(function(i, v) {
            if (contentLength === 0) {
              return '';
            } else if (contentLength !== 0 && contentLength <= options.snippetlimit) {
              return v;
            } else {
              return v.substring(0, options.snippetlimit) + ' ...';
            }
          });
        }
      });
    }
    $(e).append(htmlObject);
    $('a', e).attr('target', options.linktarget);
  };
  var feed = 'http://www.mikeschen.com/blog/feed';
  $('#feed').yrss(feed, {
    ssl: false,
    limit: 3,
    errormsg: '',
    tags: false,
    date: true,
    dateformat: 'spellmonth',
    content: false,
    image: true,
    linktarget: '_blank'
  }, function() {});
})(jQuery);