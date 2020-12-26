'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');

/** ******************
* UI
*/
exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  args.content += eejs.require('ep_subscript_and_superscript/templates/editbarButtons.ejs');
  return cb();
};

exports.eejsBlock_dd_format = (hookName, args, cb) => {
  args.content += eejs.require('ep_subscript_and_superscript/templates/fileMenu.ejs');
  return cb();
};


/** ******************
* Editor
*/

// Allow <whatever> to be an attribute
// Register attributes that are html markup / blocks not just classes
// This should make export export properly IE <sub>helllo</sub>world
// will be the output and not <span class=sub>helllo</span>
exports.aceAttribClasses = (hook, attr) => {
  attr.sub = 'tag:sub';
  attr.sup = 'tag:sup'; // wtf? cake
  return attr;
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;

  const superscriptButton = toolbar.button({
    command: 'superscript',
    /*localizationId: 'ep_align.toolbar.left.title',*/
    class: 'buttonicon buttonicon-superscript ep_subscript_and_superscript ep_superscript',
  });

  const subscriptButton = toolbar.button({
    command: 'subscript',
    /*localizationId: 'ep_align.toolbar.middle.title',*/
    class: 'buttonicon buttonicon-subscript ep_subscript_and_superscript ep_subscript',
  });

  toolbar.registerButton('superscript', superscriptButton);
  toolbar.registerButton('subscript', subscriptButton);

  return cb();
};

const rewriteLine = (context) => context.lineContent;

// Add the props to be supported in export
exports.exportHtmlAdditionalTags = (hook, pad, cb) => cb(['sub', 'sup']);
exports.asyncLineHTMLForExport = (hook, context, cb) => cb(rewriteLine);
