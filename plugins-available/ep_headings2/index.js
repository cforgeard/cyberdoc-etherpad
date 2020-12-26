'use strict';
const Changeset = require('ep_etherpad-lite/static/js/Changeset');

// Include CSS for HTML export
exports.stylesForExport = () => (
  // These should be consistent with client CSS.
  'h1{font-size: 2.5em;}\n' +
  'h2{font-size: 1.8em;}\n' +
  'h3{font-size: 1.5em;}\n' +
  'h4{font-size: 1.2em;}\n' +
  'code{font-family: RobotoMono;}\n');

const _analyzeLine = (alineAttrs, apool) => {
  let header = null;
  if (alineAttrs) {
    const opIter = Changeset.opIterator(alineAttrs);
    if (opIter.hasNext()) {
      const op = opIter.next();
      header = Changeset.opAttributeValue(op, 'heading', apool);
    }
  }
  return header;
};

// line, apool,attribLine,text
exports.getLineHTMLForExport = async (hookName, context) => {
  const header = _analyzeLine(context.attribLine, context.apool);
  if (header) {
    if (context.text.indexOf('*') === 0) {
      context.lineContent = context.lineContent.replace('*', '');
    }
    const paragraph = context.lineContent.match(/<p([^>]+)?>/);
    if (paragraph) {
      context.lineContent = context.lineContent.replace('<p', `<${header} `);
      context.lineContent = context.lineContent.replace('</p>', `</${header}>`);
    } else {
      context.lineContent = `<${header}>${context.lineContent}</${header}>`;
    }
    return context.lineContent;
  }
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;
  const fontStyle = toolbar.selectButton({
    command: 'fontStyle',
    class: 'font-style-selection',
    selectId: 'font-style',
  });
  fontStyle.addOption('dummy', 'Style', {'data-l10n-id': 'ep_headings.style'});
  fontStyle.addOption('-1', 'Normal', {'data-l10n-id': 'ep_headings.normal'});
  fontStyle.addOption('0', 'Heading 1', {'data-l10n-id': 'ep_headings.h1'});
  fontStyle.addOption('1', 'Heading 2', {'data-l10n-id': 'ep_headings.h2'});
  fontStyle.addOption('2', 'Heading 3', {'data-l10n-id': 'ep_headings.h3'});
  fontStyle.addOption('3', 'Heading 4', {'data-l10n-id': 'ep_headings.h4'});
  fontStyle.addOption('4', 'Code', {'data-l10n-id': 'ep_headings.code'});

  toolbar.registerButton('fontStyle', fontStyle);
  return cb();
};