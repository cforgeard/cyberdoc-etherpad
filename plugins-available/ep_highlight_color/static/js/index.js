'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');
const cssFiles = ['ep_highlight_color/static/css/color.css'];

// All our colors are block elements, so we just return them.
const colors = [
  'black',
  'red',
  'aqua',
  'blue',
  'teal',
  'navy',
  'purple',
  'yellow',
  'lime',
  'fuchsia',
  'white',
  'silver',
  'gray',
  'maroon',
  'green',
  'orange',
  'olive'
];

// Bind the event handler to the toolbar buttons
const postAceInit = function (hook, context) {
  const hs = $('#font-background-color, select.font-background-selection');
  hs.on('change', function () {
    const value = $(this).val();
    const intValue = parseInt(value, 10);
    if (!_.isNaN(intValue)) {
      context.ace.callWithAce((ace) => {
        ace.ace_doInsertHighlightColors(intValue);
      }, 'insertHighlightColor', true);
      hs.val('dummy');
    }
  });
  $('.font_highlight_color').hover(() => {
    $('.submenu > .highlight-color-selection').attr('size', 6);
  });
  $('.font-highlight-color-icon').click(() => {
    $('#font-highlight-color').toggle();
  });
};

// Our colors attribute will result in a highlight-color:red... _yellow class
const aceAttribsToClasses = (hook, context) => {
  if (context.key.indexOf('highlight-color:') !== -1) {
    const color = /(?:^| )highlight-color:([A-Za-z0-9]*)/.exec(context.key);
    return [`highlight-color:${color[1]}`];
  }
  if (context.key === 'highlight-color') {
    return [`highlight-color:${context.value}`];
  }
};


// Here we convert the class highlight-color:red into a tag
exports.aceCreateDomLine = (name, context) => {
  const cls = context.cls;
  const colorsType = /(?:^| )highlight-color:([A-Za-z0-9]*)/.exec(cls);

  let tagIndex;
  if (colorsType) tagIndex = _.indexOf(colors, colorsType[1]);


  if (tagIndex !== undefined && tagIndex >= 0) {
    const modifier = {
      extraOpenTags: '',
      extraCloseTags: '',
      cls,
    };
    return [modifier];
  }
  return [];
};


// Find out which lines are selected and assign them the highlight-color attribute.
// Passing a level >= 0 will set a colors on the selected lines, level < 0
// will remove it
const doInsertHighlightColors = function (level) {
  const rep = this.rep;
  const documentAttributeManager = this.documentAttributeManager;
  if (!(rep.selStart && rep.selEnd) || (level >= 0 && colors[level] === undefined)) {
    return;
  }

  let newColor = ['highlight-color', ''];
  if (level >= 0) {
    newColor = ['highlight-color', colors[level]];
  }

  documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [newColor]);
};


// Once ace is initialized, we set ace_doInsertHighlightColors and bind it to the context
const aceInitialized = (hook, context) => {
  const editorInfo = context.editorInfo;
  editorInfo.ace_doInsertHighlightColors = _(doInsertHighlightColors).bind(context);
};

// To do show what font color is active on current selection
const aceEditEvent = function (hook, call, cb) {
  const cs = call.callstack;

  if (!(cs.type == 'handleClick') && !(cs.type == 'handleKeyEvent') && !(cs.docTextChanged)) {
    return false;
  }

  // If it's an initial setup event then do nothing..
  if (cs.type == 'setBaseText' || cs.type == 'setup') return false;
  // It looks like we should check to see if this section has this attribute
  setTimeout(() => { // avoid race condition..
    const attributeManager = call.documentAttributeManager;
    const rep = call.rep;
    const activeAttributes = attributeManager.getAttributesOnPosition(rep.selStart[0], rep.selStart[1]);

    let rawColor = "white";

    for (const attribute of activeAttributes) {
      if (attribute[0] === "highlight-color") {
        rawColor = attribute[1];
      }
    }

    //value
    const currentSpan = document.querySelector("li[data-key='fontBackgroundColor'] .nice-select .current");
    document.querySelector("li[data-key='fontBackgroundColor'] .nice-select").style.borderBottom = `${rawColor} solid 2px`;
    currentSpan.classList.add("buttonicon");
    currentSpan.classList.add("buttonicon-pencil");
    return cb();
  }, 250);
};

const aceEditorCSS = () => cssFiles;

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Export all hooks
exports.aceInitialized = aceInitialized;
exports.postAceInit = postAceInit;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceEditorCSS = aceEditorCSS;
exports.aceEditEvent = aceEditEvent;