'use strict';

exports.collectContentPre = (hookName, context, cb) => {
  const tname = context.tname;
  const state = context.state;

  // make it so formatting isn't lost on edit
  if (tname === 'sub') context.cc.doAttrib(state, tname);
  if (tname === 'sup') context.cc.doAttrib(state, tname);
  return cb();
};

// never seems to be run
exports.collectContentPost = (hookName, context, cb) => cb();
