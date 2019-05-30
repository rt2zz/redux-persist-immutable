"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var merge = function merge(state, payload) {
  return state.mergeDeepWith(function (oldVal, newVal) {
    return newVal || oldVal;
  }, payload);
};

exports.default = merge;