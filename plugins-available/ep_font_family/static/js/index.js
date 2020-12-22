var $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
const _ = require('ep_etherpad-lite/static/js/underscore');

var fonts = ['fontarial', 'fontavant-garde', 'fontbookman', 'fontcalibri', 'fontcourier', 'fontgaramond', 'fonthelvetica', 'fontmonospace', 'fontpalatino', 'fonttimes-new-roman'];

/** ***
* Basic setup
******/

// Bind the event handler to the toolbar buttons
exports.postAceInit = function (hook, context) {
  const fontFamily = $('select.family-selection');
  $.each(fonts, (k, font) => {
    font = font.substring(4);
    let fontString = capitaliseFirstLetter(font);
    fontString = fontString.split('-').join(' ');
    fontFamily.append($('<option>').attr('value', `font${font}`).text(fontString));
  });
  fontFamily.niceSelect('update');
  fontFamily.on('change', function () {
    const value = $(this).val();
    context.ace.callWithAce((ace) => {
      // remove all other attrs
      $.each(fonts, (k, v) => {
        ace.ace_setAttributeOnSelection(v, false);
      });
      ace.ace_setAttributeOnSelection(value, true);
    }, 'insertfontFamily', true);
  });
};

// To do show what font family is active on current selection
exports.aceEditEvent = function (hook, call, cb) {
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

    let fontString = "Default";

    for (const attribute of activeAttributes) {
      if (fonts.indexOf(attribute[0]) !== -1) {
        const font = attribute[0].substring(4);
        fontString = capitaliseFirstLetter(font);
      }
    }

    document.querySelector(".family-selection .current").textContent = fontString;
    cb();
  }, 250);
};

/** ***
* Editor setup
******/

// Our fontFamily attribute will result in a class
// I'm not sure if this is actually required..
exports.aceAttribsToClasses = function (hook, context) {
  if (fonts.indexOf(context.key) !== -1) {
    return [context.key];
  }
};

// Block elements
// I'm not sure if this is actually required..
exports.aceRegisterBlockElements = function () {
  return fonts;
};

// Register attributes that are html markup / blocks not just classes
// This should make export export properly IE <sub>helllo</sub>world
// will be the output and not <span class=sub>helllo</span>
exports.aceAttribClasses = function (hook, attr) {
  $.each(fonts, (k, v) => {
    attr[v] = `tag:${v}`;
  });
  return attr;
};

exports.aceEditorCSS = function (hook_name, cb) {
  return ['/ep_font_family/static/css/fonts.css'];
};

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
