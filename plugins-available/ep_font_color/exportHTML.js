'use strict';
const eejs = require('ep_etherpad-lite/node/eejs/');

// Iterate over pad attributes to find only the color ones
const findAllColorUsedOn = (pad) => {
  const colorsUsed = [];
  pad.pool.eachAttrib((key, value) => { if (key === 'color') colorsUsed.push(value); });
  return colorsUsed;
};

// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hookName, pad) => findAllColorUsedOn(pad).
    map((name) => ['color', name]);

exports.getLineHTMLForExport = async (hookName, context) => {
  // Replace data-color="foo" with class="color:x".
  context.lineContent =
      context.lineContent.replace(/data-color=["|']([0-9a-zA-Z]+)["|']/gi, 'style="color:$1"');
};
