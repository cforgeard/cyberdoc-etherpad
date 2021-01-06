var eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_timesliderScripts = function (hook_name, args, cb) {
  args.content += eejs.require("ep_tables4/templates/datatablesScriptsTimeslider.ejs");
  return cb();
}

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  args.content += eejs.require("ep_tables4/templates/datatablesScripts.ejs");
  return cb();
}

exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
  args.content += eejs.require("ep_tables4/templates/datatablesEditbarButtons.ejs");
  return cb();
}

exports.eejsBlock_dd_insert = function (hook_name, args, cb) {
  args.content += eejs.require('ep_tables4/templates/fileMenu.ejs');
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content += eejs.require("ep_tables4/templates/styles.ejs");
  return cb();
}

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;

  const insertTableButton = toolbar.button({
    command: 'insertTable',
    class: 'buttonicon buttonicon-table ep_tables4 ep_insert_table',
  });

  toolbar.registerButton('insertTable', insertTableButton);
  return cb();
}