"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fromJSGreedy = require("../fromJSGreedy");

var merge = function merge(state, payload) {
  var incomeState = (0, _fromJSGreedy.fromJSGreedy)(payload);
  return state.mergeDeepWith(function (oldVal, newVal) {
    return newVal || oldVal;
  }, incomeState);
};

exports.default = merge;