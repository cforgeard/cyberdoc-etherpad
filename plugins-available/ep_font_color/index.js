'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  args.content += eejs.require('ep_font_color/templates/editbarButtons.ejs');
  return cb();
};

exports.eejsBlock_dd_format = (hookName, args, cb) => {
  args.content += eejs.require('ep_font_color/templates/fileMenu.ejs');
  return cb();
};
