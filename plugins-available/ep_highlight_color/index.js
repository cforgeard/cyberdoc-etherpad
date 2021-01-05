'use strict';

const colors = [
  "black",
  "red",
  "aqua",
  "blue",
  "teal",
  "navy",
  "purple",
  "yellow",
  "lime",
  "fuchsia",
  "white",
  "silver",
  "gray",
  "maroon",
  "green",
  "orange",
  "olive",
];

exports.eejsBlock_styles = (hookName, args, cb) => {
  let css = `
  li[data-key='fontBackgroundColor'] {
    width: 36px;
    overflow: hidden;
  }

  li[data-key='fontBackgroundColor'] .nice-select {
    color: var(--bg-soft-color);
  }

  li[data-key='fontBackgroundColor'] .nice-select .buttonicon:before {
    color: var(--text-soft-color);
  }

  li[data-key='fontBackgroundColor'] .nice-select .option {
    color: var(--text-soft-color);
  }

  li[data-key='fontBackgroundColor'] .nice-select .option:before {
    content: "■";
    font-size: x-large;  
  }
`;

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    css += `
    li[data-key='fontBackgroundColor'] .nice-select .option[data-value='${i}']:before {
      color: ${color}
    }
    `
  }

  args.content += `<style>${css}</style>`
  return cb();
};

exports.padInitToolbar = (hookName, args, cb) => {
  const toolbar = args.toolbar;
  const fontBackgroundColor = toolbar.selectButton({
    command: 'fontBackgroundColor',
    class: 'font-background-selection',
    selectId: 'font-background-color',
  });
  fontBackgroundColor.addOption('dummy', 'Font Size', {});
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    fontBackgroundColor.addOption(`${i}`, `${color}`, { 'data-l10n-id': `ep_font_color.${color}` })
  }

  toolbar.registerButton('fontBackgroundColor', fontBackgroundColor);
  return cb();
};