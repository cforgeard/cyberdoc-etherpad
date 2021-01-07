const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');

const goBackToCyberDocURL = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.goBackToCyberDocURL;
if (!goBackToCyberDocURL) {
  console.error("[ep_cyberdoc_integration] setting ep_cyberdoc_integration.goBackToCyberDocURL missing");
  console.error("[ep_cyberdoc_integration] goBackToCyberDoc options will not be shown");
}

const cyberDocIcon = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.cyberDocIcon;
if (!cyberDocIcon) {
  console.error("[ep_cyberdoc_integration] setting ep_cyberdoc_integration.cyberDocIcon missing");
  console.error("[ep_cyberdoc_integration] cyberDocAppIcon button will not be shown");
}

exports.eejsBlock_dd_file = (hookName, args, cb) => {
  args.content += eejs.require('ep_cyberdoc_integration/templates/fileMenu.ejs', { goBackToCyberDocURL });
  return cb();
}

exports.eejsBlock_dd_before = (hookName, args, cb) => {
  args.content += '<div style="display: flex; padding: 8px;">';
  if (goBackToCyberDocURL && cyberDocIcon) {
    args.content += '<style>#cyberDocAppIcon{cursor: pointer;} #cyberDocAppIcon:hover{background-color: var(--bg-soft-color);}</style>'
    args.content += `<a title="Go back to CyberDoc" href="${goBackToCyberDocURL}" id="cyberDocAppIcon"><img src="${cyberDocIcon}" width="48" height="48" style="padding: 4px;"></a>`;
  }
  args.content += '<div>';
  args.content += '<p style="font-size: large; margin-left: 4px;">My document</p>';
  return cb();
}

exports.eejsBlock_dd_after = (hookName, args, cb) => {
  args.content += '</div></div>';
  return cb();
}

exports.eejsBlock_editbarMenuRight = function (hook_name, args, cb) {
  args.content = eejs.require('ep_cyberdoc_integration/templates/editbarButtons.ejs', { goBackToCyberDocURL }) + args.content;
  return cb();
}
