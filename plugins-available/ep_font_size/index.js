'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const shared = require('./static/js/shared');

exports.eejsBlock_timesliderStyles = (hookName, args, cb) => {
  args.content += `<style>${eejs.require('ep_font_size/static/css/size.css')}</style>`;
  return cb();
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;
  const fontSize = toolbar.selectButton({
    command: 'fontSize',
    class: 'size-selection',
    selectId: 'font-size',
  });
  fontSize.addOption('dummy', 'Font Size', {'data-l10n-id': 'ep_font_size.size'});
  shared.sizes.forEach((size, value) => {
    fontSize.addOption(value, size.toString());
  });

  toolbar.registerButton('fontSize', fontSize);
  return cb();
};
