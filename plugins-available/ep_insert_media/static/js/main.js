var $ = require('ep_etherpad-lite/static/js/rjquery').$;

$(document).ready(function () {

  $(document).on('click', '.btnMediaSize', function () {
    $('.btnMediaSize').removeClass('on');
    $(this).addClass('on');
    $("#selectedSize").val($(this).text())
  });

  $(document).on('click', '.btnAlignDirection', function () {
    $('.btnAlignDirection').removeClass('on');
    $(this).addClass('on');
    $("#selectedAlign").val($(this).data("value"))
  });

  $("#doEmbedMedia").click(function () {
    var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

    //$("#embedMediaModal").slideUp("fast");
    $("#embedMediaModal").removeClass("insertEmbedMedia-show");
    var url = $("#embedMediaSrc")[0].value
    var imageSize = $("#selectedSize").val()
    var imageAlign = $("#selectedAlign").val()
    var imageUrl = escape(url);
    var mediaData = {
      "url": imageUrl,
      "align": imageAlign,
      "size": imageSize
    }

    if (isValidImageURL(url)) {
      var img = new Image();

      img.onload = function () {
        return padeditor.ace.callWithAce(function (ace) {
          var rep = ace.ace_getRep();
          ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
          ace.ace_performSelectionChange([rep.selStart[0], rep.selStart[1] - 1], rep.selStart, false);
          ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["insertEmbedPicture", JSON.stringify(mediaData)]]);
        }, "insertEmbedPicture");
      }

      img.onerror = function () {
        if (!$("#editorcontainerbox").hasClass("flex-layout")) {
          $.gritter.add({
            'title': 'Error',
            'text': 'ep_insert_media: image is not supported.',
            'sticky': true,
            'class_name': 'error'
          });
        }
      }

      img.src = url;
      $("#embedMediaSrc").val("")
    } else {
      alert("Invalid URL");
    }
  });

  $("#cancelEmbedMedia").click(function () {
    //$("#embedMediaModal").slideUp("fast");
    $("#embedMediaModal").removeClass("insertEmbedMedia-show");
  });
})

function isValidImageURL(url) {
  if (!url) return false;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlParts = url.split(".");
    const fileExtension = urlParts[urlParts.length - 1];
    return ["jpg", 'jpeg', 'bmp', 'png', 'gif'].includes(fileExtension);
  } else {
    return false;
  }
}