var $ = require('ep_etherpad-lite/static/js/rjquery').$;

$(document).ready(function () {
  var first =true;
 
  $(document).on('click', '.btnMediaSize', function() {
      $('.btnMediaSize').removeClass('on');
      $(this).addClass('on');
      $("#selectedSize").val($(this).text())
  });

  $(document).on('click', '.btnAlignDirection', function() {
    $('.btnAlignDirection').removeClass('on');
    $(this).addClass('on');
    $("#selectedAlign").val($(this).data("value"))
  });
  

  $("#file").change(function(){
    $("#embedMediaSrc").val("")
  })

  $("#insertEmbedMedia").click(function () {
    // Can not use this yet, fix in main etherpad
    // padeditbar.toogleDropDown("embedMediaModal");
    var module = $("#embedMediaModal");
    console.log(module)
    if (!module.hasClass('insertEmbedMedia-show')) {
      module.addClass("insertEmbedMedia-show");
    } else {
      module.removeClass("insertEmbedMedia-show");
    }
  });

  $("#doEmbedMedia").click(function () {
    var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
    //console.log($("#mediaSizeSelect btnMediaSize on").text(),"wwwwwwwwwwwww")
    
    //$("#embedMediaModal").slideUp("fast");
    $("#embedMediaModal").removeClass("insertEmbedMedia-show");
    var url =$("#embedMediaSrc")[0].value
    var imageSize =$("#selectedSize").val()
    var imageAlign =$("#selectedAlign").val()
    var imageUrl = escape(url) ;
    var mediaData = {
      "url" : imageUrl,
      "align" : imageAlign,
      "size" : imageSize
    }
     if(url!=""){
      if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
        if (url.indexOf("www.youtube.com") != -1 || url.indexOf("youtu.be") != -1 || url.indexOf("vimeo.com") != -1) {
          return padeditor.ace.callWithAce(function (ace) {
            var rep = ace.ace_getRep();
            ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
            ace.ace_performSelectionChange([rep.selStart[0],rep.selStart[1]-1], rep.selStart, false);
            ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["embedMedia", JSON.stringify(mediaData)]]);
          }, "embedMedia");
        }else{
          var img = new Image();
        
          img.onload = function(){
            return padeditor.ace.callWithAce(function (ace) {
              var rep = ace.ace_getRep();
              ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
              ace.ace_performSelectionChange([rep.selStart[0],rep.selStart[1]-1], rep.selStart, false);
              ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["insertEmbedPicture", JSON.stringify(mediaData)]]);
            }, "insertEmbedPicture");
          }  
          };
          img.onerror = function(){
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
       
      }

      $("#embedMediaSrc").val("")

    }else{
      uploadAction(mediaData)
    }
    
  });

  $("#cancelEmbedMedia").click(function () {
    //$("#embedMediaModal").slideUp("fast");
    $("#embedMediaModal").removeClass("insertEmbedMedia-show");
  });


})

  function uploadAction(mediaData){
    var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

    var fd = new FormData();
    var files = $('#file')[0].files[0];
    fd.append('file',files);
    $.ajax({
        url: '/p/' + clientVars.padId + '/pluginfw/ep_insert_media/upload',
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(response){
            if(response&&response.error==false ){

                if (isImage(response.fileType)){
                  if (response.type =="s3")
                    var image_url ='/p/getImage/'+response.fileName
                  else
                    var image_url =response.fileName
                  mediaData.url =  escape(image_url) ;
                  padeditor.ace.callWithAce(function (ace) {
                    var rep = ace.ace_getRep();
                    ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
                    ace.ace_performSelectionChange([rep.selStart[0],rep.selStart[1]-1], rep.selStart, false);
                    ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["insertEmbedPicture", JSON.stringify(mediaData)]]);
                  }, "insertEmbedPicture");
                }if (isVideo(response.fileType)){
                  if (response.type =="s3")
                    var video_url ='/p/getVideo/'+response.fileName
                  else
                    var video_url =response.fileName
                    mediaData.url =  escape(video_url) ;

                  padeditor.ace.callWithAce(function (ace) {
                    var rep = ace.ace_getRep();
                    ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
                    ace.ace_performSelectionChange([rep.selStart[0],rep.selStart[1]-1], rep.selStart, false);
                    ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["insertEmbedVideo", JSON.stringify(mediaData)]]);
                  }, "insertEmbedVideo");
                }if (isAudio(response.fileType)){
                  if (response.type =="s3")
                    var audio_url ='/p/getMedia/'+response.fileName
                  else
                    var audio_url =response.fileName
                    mediaData.url =  escape(audio_url) ;

                  padeditor.ace.callWithAce(function (ace) {
                    var rep = ace.ace_getRep();
                    ace.ace_replaceRange(rep.selStart, rep.selEnd, "E");
                    ace.ace_performSelectionChange([rep.selStart[0],rep.selStart[1]-1], rep.selStart, false);
                    ace.ace_performDocumentApplyAttributesToRange(rep.selStart, rep.selEnd, [["insertEmbedAudio", JSON.stringify(mediaData)]]);
                  }, "insertEmbedAudio");
                }
              
               
                
                $("#embedMediaModal").removeClass("insertEmbedMedia-show");
                $("#file").val("")
            }else{
                $.gritter.add({
                  'title': 'Error',
                  'text': 'ep_insert_media: '+response.error,
                  'sticky': true,
                  'class_name': 'error'
                });
            }
        },
    });
  } 




 

function isImage (filename) {
  switch (filename.toLowerCase()) {
    case '.jpg':
    case '.gif':
    case '.bmp':
    case '.png':
    case '.jpeg':

      //etc
      return true;
  }
  return false;
}

function isVideo (filename) {
  switch (filename.toLowerCase()) {
    case '.m4v':
    case '.avi':
    case '.mpg':
    case '.mp4':
    case '.webm':

      // etc
      return true;
  }
  return false;
}

function isAudio (filename) {
  switch (filename.toLowerCase()) {
    case '.mp3':
    case '.ogg':
    case '.m4a':
    case '.flac':
    case '.wav':
    case '.wma':
    case '.aac':

      // etc
      return true;
  }
  return false;
}
