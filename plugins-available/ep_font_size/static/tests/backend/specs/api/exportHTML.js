'use strict';

const appUrl = 'http://localhost:9001';
const apiVersion = 1;

const supertest = require('ep_etherpad-lite/node_modules/supertest');
const fs = require('fs');
const path = require('path');
const api = supertest(appUrl);
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

// Loads the APIKEY.txt content into a string, and returns it.
const getApiKey = () => {
  const etherpadRoot = '/../../../../../../ep_etherpad-lite/../..';
  const filePath = path.join(__dirname, `${etherpadRoot}/APIKEY.txt`);
  const apiKey = fs.readFileSync(filePath, {encoding: 'utf-8'});
  return apiKey.replace(/\n$/, '');
};

const apiKey = getApiKey();

// Creates a pad and returns the pad id. Calls the callback when finished.
const createPad = (padID, callback) => {
  api.get(`/api/${apiVersion}/createPad?apikey=${apiKey}&padID=${padID}`)
      .end((err, res) => {
        if (err || (res.body.code !== 0)) callback(new Error('Unable to create new Pad'));
        callback(padID);
      });
};

const setHTML = (padID, html, callback) => {
  api.get(`/api/${apiVersion}/setHTML?apikey=${apiKey}&padID=${padID}&html=${html}`)
      .end((err, res) => {
        if (err || (res.body.code !== 0)) callback(new Error('Unable to set pad HTML'));
        callback(null, padID);
      });
};

const getHTMLEndPointFor =
    (padID, callback) => `/api/${apiVersion}/getHTML?apikey=${apiKey}&padID=${padID}`;

const codeToBe = (expectedCode, res) => {
  if (res.body.code !== expectedCode) {
    throw new Error(`Code should be ${expectedCode}, was ${res.body.code}`);
  }
};

const codeToBe0 = (res) => { codeToBe(0, res); };

const buildHTML = (body) => `<html><body>${body}</body></html>`;

const textWithSize = (size, text) => {
  if (!text) text = `this is ${size}`;
  return `<span class='font-size:${size}'>${text}</span>`;
};

const regexWithSize = (size, text) => {
  if (!text) text = `this is ${size}`;
  const regex = `<span .*class=['|"].*font-size:${size}.*['|"].*>${text}</span>`;
  // bug fix: if no other plugin on the Etherpad instance returns a value on getLineHTMLForExport()
  // hook, data-size=(...) won't be replaced by class=size:(...), so we need a fallback regex
  const fallbackRegex = `<span .*data-font-size=['|"]${size}['|"].*>${text}</span>`;
  return `${regex} || ${fallbackRegex}`;
};


describe('ep_font_size - export size styles to HTML', function () {
  let padID;
  let html;

  // create a new pad before each test run
  beforeEach(function (done) {
    padID = randomString(5);

    createPad(padID, () => {
      setHTML(padID, html(), done);
    });
  });

  context('when pad text has one size', function () {
    before(async function () {
      html = () => buildHTML(textWithSize('8'));
    });

    it('returns ok', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect(codeToBe0)
          .expect('Content-Type', /json/)
          .expect(200, done);
    });

    it('returns HTML with size class', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const expectedRegex = regexWithSize('8');
            const expectedsizes = new RegExp(expectedRegex);
            const html = res.body.data.html;
            const foundsize = html.match(expectedsizes);
            if (!foundsize) {
              throw new Error(
                  `size not exported. Regex used: ${expectedRegex}, html exported: ${html}`);
            }
          })
          .end(done);
    });
  });

  context('when pad text has two sizes in a single line', function () {
    before(async function () {
      html = () => buildHTML(textWithSize('8') + textWithSize('9'));
    });

    it('returns HTML with two size spans', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const firstsize = regexWithSize('8');
            const secondsize = regexWithSize('9');
            const expectedRegex = `${firstsize}.*${secondsize}`;
            const expectedsizes = new RegExp(expectedRegex);

            const html = res.body.data.html;
            const foundsize = html.match(expectedsizes);
            if (!foundsize) {
              throw new Error(
                  `size not exported. Regex used: ${expectedRegex}, html exported: ${html}`);
            }
          })
          .end(done);
    });
  });

  context('when pad text has no sizes', function () {
    before(async function () {
      html = () => buildHTML('empty pad');
    });

    it('returns HTML with no size', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const expectedRegex = '.*empty pad.*';
            const nosize = new RegExp(expectedRegex);

            const html = res.body.data.html;
            const foundsize = html.match(nosize);
            if (!foundsize) {
              throw new Error('size exported, should not have any. ' +
                              `Regex used: ${expectedRegex}, html exported: ${html}`);
            }
          })
          .end(done);
    });
  });

  context('when pad text has size inside strong', function () {
    before(async function () {
      html = () => buildHTML(`<strong>${textWithSize('8', 'this is size 8 and bold')}</strong>`);
    });

    // Etherpad exports tags using the order they are defined on the array (bold is always inside
    // size)
    it('returns HTML with strong and size, in any order', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const txt = 'this is size 8 and bold';
            const strongInside = new RegExp(regexWithSize('8', `<strong>${txt}</strong>`));
            const sizeInside = new RegExp(`<strong>${regexWithSize('8', txt)}</strong>`);
            const html = res.body.data.html;
            const foundsize = html.match(strongInside) || html.match(sizeInside);
            if (!foundsize) {
              throw new Error(`size not exported. Regex used: [${strongInside.source} || ` +
                              `${sizeInside.source}], html exported: ${html}`);
            }
          })
          .end(done);
    });
  });

  context('when pad text has strong inside size', function () {
    before(async function () {
      html = () => buildHTML(textWithSize('8', '<strong>this is size 8 and bold</strong>'));
    });

    // Etherpad exports tags using the order they are defined on the array (bold is always inside
    // size)
    it('returns HTML with strong and size, in any order', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const txt = 'this is size 8 and bold';
            const strongInside = new RegExp(regexWithSize('8', `<strong>${txt}</strong>`));
            const sizeInside = new RegExp(`<strong>${regexWithSize('8', txt)}</strong>`);
            const html = res.body.data.html;
            const foundsize = html.match(strongInside) || html.match(sizeInside);
            if (!foundsize) {
              throw new Error(`size not exported. Regex used: [${strongInside.source} || ` +
                              `${sizeInside.source}], html exported: ${html}`);
            }
          })
          .end(done);
    });
  });

  context('when pad text has part with size and part without it', function () {
    before(async function () {
      html = () => buildHTML(`no size here ${textWithSize('8')}`);
    });

    it('returns HTML with part with size and part without it', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const expectedRegex = `no size here ${regexWithSize('8')}`;
            const expectedsizes = new RegExp(expectedRegex);
            const html = res.body.data.html;
            const foundsize = html.match(expectedsizes);
            if (!foundsize) {
              throw new Error(
                  `size not exported. Regex used: ${expectedRegex}, html exported: ${html}`);
            }
          })
          .end(done);
    });
  });
});
