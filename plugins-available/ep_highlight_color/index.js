'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  args.content += eejs.require('ep_highlight_color/templates/editbarButtons.ejs');
  return cb();
};