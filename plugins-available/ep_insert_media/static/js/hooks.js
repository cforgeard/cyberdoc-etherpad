var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;

exports.aceInitInnerdocbodyHead = function (hook_name, args, cb) {
  args.iframeHTML.push('<link rel="stylesheet" type="text/css" href="/static/plugins/ep_insert_media/static/css/ace.css"/>');
  return cb();
};

exports.aceAttribsToClasses = function (hook_name, args, cb) {
  if (args.key === 'insertEmbedPicture' && args.value !== '') {
    return cb(["insertEmbedPicture:" + args.value]);
  }
  return cb([]);
};

exports.aceCreateDomLine = function (hook_name, args, cb) {
  //--------------------- insertEmbedPicture
  if (args.cls.indexOf('insertEmbedPicture:') >= 0) {
    var clss = [];
    var argClss = args.cls.split(" ");
    var value;
    for (var i = 0; i < argClss.length; i++) {
      var cls = argClss[i];
      if (cls.indexOf("insertEmbedPicture:") != -1) {
        value = cls.substr(cls.indexOf(":") + 1);
      }
      else {
        clss.push(cls);
      }
    }
    console.log(value)
    try {
      var mediaData = JSON.parse(value)
    } catch (e) {
      console.log(e)
    }
    if (mediaData)
      return cb([{ cls: clss.join(" "), extraOpenTags: "<span data-size='" + mediaData.size + "' data-align='" + mediaData.align + "' data-url='" + unescape(mediaData.url) + "' id='emb_img-" + randomString(16) + "' class='embedRemoteImageSpan ep_insert_media_" + mediaData.size + " ep_insert_media_" + mediaData.align + "'><span class='image'>" + exports.cleanEmbedPictureCode(unescape(mediaData.url)) + "</span><span class='character'>", extraCloseTags: '</span>' }]);
  }
  return cb();
};

var filter = function (node) {
  node = $(node);
  if (node.children().length) {
    node.children().each(function () { filter(this); });
  }
  if (!node.is("iframe,object,embed,param,video")) {
    node.replaceWith(node.children().clone());
  }
}

exports.cleanEmbedPictureCode = function (orig) {
  var value = $.trim(orig);
  return "<img class='embedRemoteImage' src='" + value + "'>";
}

exports.aceInitialized = function (hook, context, cb) {
  var padOuter = $('iframe[name="ace_outer"]').contents();
  var padInner = padOuter.find('iframe[name="ace_inner"]');
  var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

  padInner.contents().on("click", ".embedRemoteImageSpan", function (e) {
    var url = $(this).data("url")
    var id = $(this).attr("id")
    var selector = "#" + id
    var ace = padeditor.ace;

    $.gritter.add({
      'title': 'selected image url',
      'text': url,
      'sticky': true,
      'class_name': 'info'
    });
  });
  return cb();
}