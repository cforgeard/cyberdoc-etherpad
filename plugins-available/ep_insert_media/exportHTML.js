'use strict';
const eejs = require('ep_etherpad-lite/node/eejs/');

// copy/paste + adapted from ep_font_color
const findAllPicturesUsedOn = (pad) => {
  const picturesUsed = [];
  pad.pool.eachAttrib((key, value) => { if (key === 'insertEmbedPicture') picturesUsed.push(value); });
  return picturesUsed;
};

// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hookName, pad) => findAllPicturesUsedOn(pad).
    map((name) => ['insertEmbedPicture', name]);

exports.getLineHTMLForExport = async (hookName, context) => {
  if (context.lineContent.includes("data-insertEmbedPicture")) {
    var tmp = context.lineContent.replace(/data-insertEmbedPicture="(.*)"/gi, '$1');
    var startIndex = tmp.indexOf("{");
    var endIndex = tmp.lastIndexOf("}");
    var jsonObj = JSON.parse(tmp.substring(startIndex, endIndex+1));

    var widthCss = 'width: 50% !important;';
    switch(jsonObj.size) {
      case "Small": {
        widthCss = 'width: 25% !important;';
        break;
      }
      case "Medium": {
        widthCss = 'width: 50% !important;';
        break;
      }
      case "Large": {
        widthCss = 'width: 100% !important;';
        break;
      }
    }
    
    var imgHtml = `<div style="text-align:${jsonObj.align.toLowerCase()};"><img style="${widthCss}" src="${decodeURIComponent(jsonObj.url)}"/></div>`;
    context.lineContent = imgHtml;  
  }
};