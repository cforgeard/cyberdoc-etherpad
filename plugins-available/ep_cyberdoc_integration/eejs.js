const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings').ep_cyberdoc_integration;

function getValueFromSettings(key) {
  if (!settings || !settings[key]) {
    throw new Error(`[ep_cyberdoc_integration] Missing ep_cyberdoc_integration.${key} setting !`);
  }
  return settings[key];
}

exports.eejsBlock_dd_before = (hookName, args, cb) => {
  args.content = eejs.require('ep_cyberdoc_integration/templates/ddBefore.ejs', {
    iconURL: getValueFromSettings("iconURL"),
    frontendBaseURL: getValueFromSettings("frontendBaseURL"),
    backendBaseURL: getValueFromSettings("backendBaseURL"),
  });
  return cb();
}

exports.eejsBlock_dd_after = (hookName, args, cb) => {
  args.content = eejs.require('ep_cyberdoc_integration/templates/ddAfter.ejs');
  return cb();
}