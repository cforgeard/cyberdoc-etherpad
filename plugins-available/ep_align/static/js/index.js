'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');

// All our tags are block elements, so we just return them.
const tags = ['left', 'center', 'justify', 'right'];

exports.aceRegisterBlockElements = () => tags;

// Bind the event handler to the toolbar buttons
exports.postAceInit = (hookName, context, cb) => {
  $('body').on('click', '.ep_align', function () {
    const value = $(this).data('align');
    const intValue = parseInt(value, 10);
    if (!_.isNaN(intValue)) {
      context.ace.callWithAce((ace) => {
        ace.ace_doInsertAlign(intValue);
      }, 'insertalign', true);
    }
  });

  return cb();
};

// On caret position change show the current align
exports.aceEditEvent = (hook, call, cb) => {
  // If it's not a click or a key event and the text hasn't changed then do nothing
  const cs = call.callstack;
  if (!(cs.type === 'handleClick') && !(cs.type === 'handleKeyEvent') && !(cs.docTextChanged)) {
    return false;
  }
  // If it's an initial setup event then do nothing..
  if (cs.type === 'setBaseText' || cs.type === 'setup') return false;

  // It looks like we should check to see if this section has this attribute
  setTimeout(() => { // avoid race condition..
    const attributeManager = call.documentAttributeManager;
    const rep = call.rep;
    const activeAttributes = {};

    const firstLine = rep.selStart[0];
    const lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));
    let totalNumberOfLines = 0;

    _(_.range(firstLine, lastLine + 1)).each((line) => {
      totalNumberOfLines++;
      const attr = attributeManager.getAttributeOnLine(line, 'align');
      if (!activeAttributes[attr]) {
        activeAttributes[attr] = {};
        activeAttributes[attr].count = 1;
      } else {
        activeAttributes[attr].count++;
      }
    });

    $.each(activeAttributes, (k, attr) => {
      if (attr.count === totalNumberOfLines) {
        const currentAlign = k || "left";
        const currentAlignIndex = tags.indexOf(currentAlign);
        for (let i = 0; i < tags.length; i++) {
          const menuItem = document.querySelector(`[data-align="${i}"]`);
          if (currentAlignIndex === i) {
            menuItem.classList.add("selected");
          } else {
            menuItem.classList.remove("selected");
          }
        }
      }
    });

    return cb();
  }, 250);
};

// Our align attribute will result in a heaading:left.... :left class
exports.aceAttribsToClasses = (hook, context) => {
  if (context.key === 'align') {
    return [`align:${context.value}`];
  }
  return []
};

// Here we convert the class align:left into a tag
exports.aceDomLineProcessLineAttributes = (name, context) => {
  const cls = context.cls;
  const alignType = /(?:^| )align:([A-Za-z0-9]*)/.exec(cls);
  let tagIndex;
  if (alignType) tagIndex = _.indexOf(tags, alignType[1]);
  if (tagIndex !== undefined && tagIndex >= 0) {
    const tag = tags[tagIndex];
    const styles =
      `width:100%;margin:0 auto;list-style-position:inside;display:block;text-align:${tag}`;
    const modifier = {
      preHtml: `<${tag} style="${styles}">`,
      postHtml: `</${tag}>`,
      processedMarker: true,
    };
    return [modifier];
  }
  return [];
};


// Once ace is initialized, we set ace_doInsertAlign and bind it to the context
exports.aceInitialized = (hook, context, cb) => {
  // Passing a level >= 0 will set a alignment on the selected lines, level < 0
  // will remove it
  function doInsertAlign(level) {
    const rep = this.rep;
    const documentAttributeManager = this.documentAttributeManager;
    if (!(rep.selStart && rep.selEnd) || (level >= 0 && tags[level] === undefined)) {
      return;
    }

    const firstLine = rep.selStart[0];
    const lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));
    _(_.range(firstLine, lastLine + 1)).each((i) => {
      if (level >= 0) {
        documentAttributeManager.setAttributeOnLine(i, 'align', tags[level]);
      } else {
        documentAttributeManager.removeAttributeOnLine(i, 'align');
      }
    });
  }

  const editorInfo = context.editorInfo;
  editorInfo.ace_doInsertAlign = _(doInsertAlign).bind(context);
  return cb();
};

const align = (context, alignment) => {
  context.ace.callWithAce((ace) => {
    ace.ace_doInsertAlign(alignment);
    ace.ace_focus();
  }, 'insertalign', true);
};

exports.postToolbarInit = (hookName, context) => {
  const editbar = context.toolbar; // toolbar is actually editbar - http://etherpad.org/doc/v1.5.7/#index_editbar
  editbar.registerCommand('alignLeft', () => {
    align(context, 0);
  });

  editbar.registerCommand('alignCenter', () => {
    align(context, 1);
  });

  editbar.registerCommand('alignJustify', () => {
    align(context, 2);
  });

  editbar.registerCommand('alignRight', () => {
    align(context, 3);
  });

  return true;
};
