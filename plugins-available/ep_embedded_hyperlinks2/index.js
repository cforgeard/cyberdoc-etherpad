var eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_editorContainerBox = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_embedded_hyperlinks2/templates/popup.ejs", {}, module);
  return cb();
}

exports.eejsBlock_dd_insert = (hookName, args, cb) => {
  args.content += eejs.require('ep_embedded_hyperlinks2/templates/fileMenu.ejs');
  return cb();
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;

  const insertHyperlinkButton = toolbar.button({
    command: 'insertHyperlink',
    class: 'buttonicon buttonicon-link ep_embedded_hyperlinks2 ep_insert_hyperlink hyperlink-icon',
  });

  toolbar.registerButton('insertHyperlink', insertHyperlinkButton);
  return cb();
};