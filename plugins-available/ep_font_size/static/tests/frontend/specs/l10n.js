'use strict';

describe('ep_font_size - Select font-size dropdown localization', function () {
  const changeEtherpadLanguageTo = (lang, callback) => {
    const boldTitles = {
      en: 'Bold (Ctrl+B)',
      fr: 'Gras (Ctrl+B)',
    };
    const chrome$ = helper.padChrome$;

    // click on the settings button to make settings visible
    const $settingsButton = chrome$('.buttonicon-settings');
    $settingsButton.click();

    // select the language
    const $language = chrome$('#languagemenu');
    $language.val(lang);
    $language.change();

    // hide settings again
    $settingsButton.click();

    helper.waitFor(() => chrome$('.buttonicon-bold').parent()[0].title === boldTitles[lang])
        .done(callback);
  };

  // create a new pad with comment before each test run
  beforeEach(function (cb) {
    helper.newPad(() => {
      changeEtherpadLanguageTo('fr', cb);
    });
    this.timeout(60000);
  });

  // ensure we go back to English to avoid breaking other tests:
  after(function (cb) {
    changeEtherpadLanguageTo('en', cb);
  });

  it('Localizes dropdown when Etherpad language is changed', function (done) {
    const optionTranslations = {
      'ep_font_size.size': 'Taille',
    };
    const chrome$ = helper.padChrome$;
    const $option = chrome$('#editbar').find('#font-size').find('option').first();

    expect($option.text()).to.be(optionTranslations[$option.attr('data-l10n-id')]);

    return done();
  });
});
