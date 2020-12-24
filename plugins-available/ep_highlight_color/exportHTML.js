'use strict';
const eejs = require('ep_etherpad-lite/node/eejs/');

// Iterate over pad attributes to find only the color ones
const findAllHighlightColorUsedOn = (pad) => {
  const highlighColorsUsed = [];
  pad.pool.eachAttrib((key, value) => { if (key === 'highlight-color') highlighColorsUsed.push(value); });
  return highlighColorsUsed;
};

// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hookName, pad) => findAllHighlightColorUsedOn(pad).
    map((name) => ['highlight-color', name]);

exports.getLineHTMLForExport = async (hookName, context) => {
  // Replace data-highlight-color="foo" with CSS.
  context.lineContent =
      context.lineContent.replace(/data-highlight-color=["|']([0-9a-zA-Z]+)["|']/gi, 'style="background-color:$1"');
};
