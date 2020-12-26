var eejs = require("ep_etherpad-lite/node/eejs");

exports.eejsBlock_body = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/modals.ejs", {}, module);
  return cb();
}

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/scripts.ejs", {}, module);
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_insert_media/templates/styles.ejs", {}, module);
  return cb();
}

exports.eejsBlock_dd_insert = (hookName, args, cb) => {
  args.content += eejs.require('ep_insert_media/templates/fileMenu.ejs');
  return cb();
}

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;

  const insertImageButton = toolbar.button({
    command: 'insertImage',
    /*localizationId: 'ep_embedded_hyperlinks.editbarButtons.hyperlink',*/
    class: 'buttonicon buttonicon-picture ep_insert_media ep_insert_image',
  });

  toolbar.registerButton('insertImage', insertImageButton);
  return cb();
}