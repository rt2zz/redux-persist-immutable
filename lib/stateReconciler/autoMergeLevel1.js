"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var merge = function merge(state, payload) {
  return state.merge(payload);
};

exports.default = merge;