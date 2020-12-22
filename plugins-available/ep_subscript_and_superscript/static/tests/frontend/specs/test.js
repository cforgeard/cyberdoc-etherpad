'use strict';

describe('Set Superscript and subscript and ensure its removed properly', function () {
  // create a new pad before each test run
  beforeEach(function (cb) {
    helper.newPad(cb);
    this.timeout(60000);
  });

  it('When Superscript is changed', function (done) {
    this.timeout(60000);
    const chrome$ = helper.padChrome$;
    const inner$ = helper.padInner$;

    const $firstTextElement = inner$('div').first();
    $firstTextElement.sendkeys('First Line!');
    $firstTextElement.sendkeys('{selectall}');

    // sets first line to h1
    chrome$('.buttonicon-superscript').click();
    helper.waitFor(() => {
      const $firstSpan = inner$('div').first().find('span');
      return $firstSpan.hasClass('sup');
    }).done(() => {
      done();
    });
  });

  it('When Subscript is changed', function (done) {
    this.timeout(60000);
    const chrome$ = helper.padChrome$;
    const inner$ = helper.padInner$;

    const $firstTextElement = inner$('div').first();
    $firstTextElement.sendkeys('First Line!');
    $firstTextElement.sendkeys('{selectall}');

    // sets first line to h1
    chrome$('.buttonicon-subscript').click();
    helper.waitFor(() => {
      const $firstSpan = inner$('div').first().find('span');
      return $firstSpan.hasClass('sub');
    }).done(() => {
      done();
    });
  });
});
