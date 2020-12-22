'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');

// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hookName, pad) => {
  const ret = [];
  pad.pool.eachAttrib((k, v) => { if (k === 'font-size') ret.push([k, v]); });
  return ret;
};

exports.getLineHTMLForExport = async (hookName, context) => {
  // Replace data-size="foo" with class="font-size:x".
  context.lineContent = context.lineContent.replace(
      /data-font-size=["|']([0-9a-zA-Z]+)["|']/gi, 'style="font-size:$1px"');
};
