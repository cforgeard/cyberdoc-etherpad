const fonts = ['fontarial', 'fontavant-garde', 'fontbookman', 'fontcalibri', 'fontcourier', 'fontgaramond', 'fonthelvetica', 'fontmonospace', 'fontpalatino', 'fonttimes-new-roman'];


/** ******************
* Editor
*/

// Allow <whatever> to be an attribute
exports.aceAttribClasses = function (hook_name, attr, cb) {
  for (const i in fonts) {
    const font = fonts[i];
    attr[font] = `tag:font${font}`;
  }
  cb(attr);
};

/** ******************
* Export
*/

// Add the props to be supported in export
exports.exportHtmlAdditionalTags = function (hook, pad, cb) {
  cb(fonts);
};

exports.getLineHTMLForExport = function (hook, context, cb) {
  let lineContent = context.lineContent;
  fonts.forEach((font) => {
    if (lineContent) {
      const fontName = font.substring(4);
      // cforgeard 06/01/2021 "".replaceAll not available in nodeJS
      // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string
      lineContent = lineContent.split(`<${font}`).join(`<span style='font-family:${fontName}'`);
      lineContent = lineContent.split(`</${font}`).join(`</span`);
    }
  });
  context.lineContent = lineContent;
  cb();
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;
  const fontFamily = toolbar.selectButton({
    command: 'fontFamily',
    class: 'family-selection',
    selectId: 'font-family',
  });
  fontFamily.addOption('dummy', 'Font Family', {/*'data-l10n-id': 'ep_font_size.size'*/});
  fonts.forEach(value => {
    fontFamily.addOption(value, capitaliseFirstLetter(value.substr(4)));
  });

  toolbar.registerButton('fontFamily', fontFamily);
  return cb();
};

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}