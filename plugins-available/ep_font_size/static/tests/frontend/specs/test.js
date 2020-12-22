'use strict';

describe('ep_font_size - Set Font size and ensure its removed properly', function () {
  // Tests still to do
  // Ensure additional chars keep the same formatting
  // Ensure heading value is properly set when caret is placed on font size changed content

  // create a new pad before each test run
  beforeEach(function (cb) {
    helper.newPad(cb);
    this.timeout(60000);
  });

  // Create Pad
  // Select all text
  // Set it to size 9
  // Select all text
  // Set it to size 8

  it('Changes from size 8 to 9 and back to 8', function (done) {
    this.timeout(60000);
    const chrome$ = helper.padChrome$;
    const inner$ = helper.padInner$;

    let $firstTextElement = inner$('div').first();

    $firstTextElement.sendkeys('foo');
    $firstTextElement.sendkeys('{selectall}');

    // sets first line to Font size 9
    chrome$('#font-size').val('1');
    chrome$('#font-size').change();

    let fElement = inner$('div').first();
    helper.waitFor(() => {
      const elementHasClass = fElement.children().first().hasClass('font-size:9');
      return expect(elementHasClass).to.be(true);
    }).done(() => {
      $firstTextElement = inner$('div').first();
      $firstTextElement.sendkeys('{selectall}');
      // sets first line to Font size 8
      chrome$('#font-size').val('0');
      chrome$('#font-size').change();
      helper.waitFor(() => {
        fElement = inner$('div').first();
        const elementHasClass = fElement.children().first().hasClass('font-size:8');
        return expect(elementHasClass).to.be(true);
      }).done(() => {
        done();
      });
    });
  });
});
