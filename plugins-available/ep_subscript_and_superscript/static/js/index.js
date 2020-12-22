'use strict';

// Bind the event handler to the toolbar buttons
exports.postAceInit = (hook, context) => {
  $('.subscript').click(() => {
    context.ace.callWithAce((ace) => {
      if (ace.ace_getAttributeOnSelection('sub')) {
        ace.ace_setAttributeOnSelection('sub', false);
      } else {
        ace.ace_setAttributeOnSelection('sub', true);
      }
    }, 'insertsubscript', true);
  });
  $('.superscript').click(() => {
    context.ace.callWithAce((ace) => {
      if (ace.ace_getAttributeOnSelection('sup')) {
        ace.ace_setAttributeOnSelection('sup', false);
      } else {
        ace.ace_setAttributeOnSelection('sup', true);
      }
    }, 'insertsuperscript', true);
  });
};

exports.aceEditEvent = (hook, call, info, rep, attr) => {
  // If it's not a click or a key event and the text hasn't changed then do nothing
  if (!(call.callstack.type === 'handleClick') &&
  !(call.callstack.type === 'handleKeyEvent') &&
  !(call.callstack.docTextChanged)) {
    return false;
  }
  setTimeout(() => { // avoid race condition..
    // the caret is in a new position..  Let's do some funky shit
    if (call.editorInfo.ace_getAttributeOnSelection('sub')) {
      // show the button as being depressed..  Not sad, but active.. You know the drill bitches.
      $('.subscript > a').addClass('activeButton');
    } else {
      $('.subscript > a').removeClass('activeButton');
    }
    if (call.editorInfo.ace_getAttributeOnSelection('sup')) {
      // show the button as being depressed..  Not sad, but active.. You know the drill bitches.
      $('.superscript > a').addClass('activeButton');
    } else {
      $('.superscript > a').removeClass('activeButton');
    }
  }, 250);
};


/** ***
* Editor setup
******/

exports.aceAttribsToClasses = (hook, context) => {
  if (context.key === 'sup' || context.key === 'sub') {
    return [context.key];
  }
};

exports.aceRegisterBlockElements = () => ['sub', 'sup'];

// Register attributes that are html markup / blocks not just classes
// This should make export export properly IE <sub>helllo</sub>world
// will be the output and not <span class=sub>helllo</span>
exports.aceAttribClasses = (hook, attr) => {
  attr.sub = 'tag:sub';
  attr.sup = 'tag:sup';
  return attr;
};
