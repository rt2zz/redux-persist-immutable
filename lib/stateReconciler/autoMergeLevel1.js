'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fromJSGreedy = require('../fromJSGreedy');

var merge = function merge(state, payload) {
  return state.merge((0, _fromJSGreedy.fromJSGreedy)(payload));
};

exports.default = merge;