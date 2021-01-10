const _ = require('ep_etherpad-lite/static/js/underscore');
var currentTableForPadID = {};

exports.stylesForExport = function (hook, context, cb) {
  let styles = "";
  styles += "table, th, td{border: 1px solid grey; border-collapse: collapse;}";
  styles += "table{width: 100%;}";
  return cb(styles);
}

exports.getLineHTMLForExport = function (hook, context, cb) {
  console.warn(context);
  if (context.lineContent.startsWith("{&quot;payload&quot;:")) {
    context.lineContent = context.lineContent.split('="').join("='");
    context.lineContent = context.lineContent.split(`">`).join("'>");
    const payloadObj = JSON.parse(_.unescape(context.lineContent));

    let html = "<tr>";
    for (const item of payloadObj.payload[0]) {
      html += `<td>${item}</td>`;
    }
    html += "</tr>";

    if (currentTableForPadID[context.padId]) {
      currentTableForPadID[context.padId].push(html);
    } else {
      currentTableForPadID[context.padId] = [html];
    }
    context.lineContent = "";
  } else {
    if (currentTableForPadID[context.padId]) {
      context.lineContent = `<table>${currentTableForPadID[context.padId].join('')}</table>${context.lineContent}`;
      currentTableForPadID[context.padId] = undefined;
    }
  }

  return cb([true]);
};