const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');

const goBackToCyberDocURL = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.goBackToCyberDocURL;
if (!goBackToCyberDocURL) {
  console.error("[ep_cyberdoc_integration] setting ep_cyberdoc_integration.goBackToCyberDocURL missing");
  console.error("[ep_cyberdoc_integration] goBackToCyberDoc options will not be shown");
}

exports.eejsBlock_dd_file = (hookName, args, cb) => {
  args.content += eejs.require('ep_cyberdoc_integration/templates/fileMenu.ejs', { goBackToCyberDocURL });
  return cb();
}

exports.eejsBlock_editbarMenuRight = function (hook_name, args, cb) {
  args.content = eejs.require('ep_cyberdoc_integration/templates/editbarButtons.ejs', { goBackToCyberDocURL }) + args.content;
  return cb();
}
