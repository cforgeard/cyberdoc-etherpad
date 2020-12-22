'use strict';

const utils = require('../utils.js');
const apiKey = utils.apiKey;
const api = utils.api;
const apiVersion = utils.apiVersion;
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

const buildHTML = (body) => `<html><body>${body}</body></html>`;
const getHTMLEndPointFor =
(padID, callback) => `/api/${apiVersion}/getHTML?apikey=${apiKey}&padID=${padID}`;

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

describe('export Subscript to HTML', function () {
  let padID;
  let html;

  // create a new pad before each test run
  beforeEach(function (done) {
    padID = randomString(5);

    createPad(padID, () => {
      setHTML(padID, html(), done);
    });
  });

  context('when pad text has one Subscript', function () {
    before(async function () {
      html = () => buildHTML('<sub>Hello world</sub>');
    });

    it('returns ok', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect('Content-Type', /json/)
          .expect(200, done);
    });

    it('returns HTML with Subscript HTML tags', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const html = res.body.data.html;
            if (html.indexOf('<sub>Hello world</sub>') === -1) {
              throw new Error('No sub tag detected');
            }
          })
          .end(done);
    });
  });

  context('when pad text has multiple Subscripts on multiple lines', function () {
    before(async function () {
      html = () => buildHTML('<sub>Hello world</sub><br/><sub>Foo</sub>');
    });


    it('returns ok', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect('Content-Type', /json/)
          .expect(200, done);
    });

    it('returns HTML with Multiple Subscripts HTML tags', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const html = res.body.data.html;
            if (html.indexOf('<sub>Hello world</sub>') === -1) {
              throw new Error('No sub tag detected');
            }
            if (html.indexOf('<sub>Foo</sub>') === -1) throw new Error('No sub tag detected');
          })
          .end(done);
    });
  });
});

describe('export Superscript to HTML', function () {
  let padID;
  let html;

  // create a new pad before each test run
  beforeEach(function (done) {
    padID = randomString(5);

    createPad(padID, () => {
      setHTML(padID, html(), done);
    });
  });

  context('when pad text has one Superscript', function () {
    before(async function () {
      html = () => buildHTML('<sup>Hello world</sup>');
    });


    it('returns ok', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect('Content-Type', /json/)
          .expect(200, done);
    });

    it('returns HTML with Suberscript HTML tags', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const html = res.body.data.html;
            if (html.indexOf('<sup>Hello world</sup>') === -1) {
              throw new Error('No sup tag detected');
            }
          })
          .end(done);
    });
  });

  context('when pad text has multiple Superscripts on multiple lines', function () {
    before(async function () {
      html = () => buildHTML('<sup>Hello world</sup><br/><sup>Foo</sup>');
    });

    it('returns ok', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect('Content-Type', /json/)
          .expect(200, done);
    });

    it('returns HTML with Multiple Superscripts HTML tags', function (done) {
      api.get(getHTMLEndPointFor(padID))
          .expect((res) => {
            const html = res.body.data.html;
            if (html.indexOf('<sup>Hello world</sup>') === -1) {
              throw new Error('No sup tag detected');
            }
            if (html.indexOf('<sup>Foo</sup>') === -1) {
              throw new Error('No sup tag detected');
            }
          })
          .end(done);
    });
  });
});
