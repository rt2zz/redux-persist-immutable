'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromJSGreedy = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromJSGreedy = function fromJSGreedy(js) {
  return (typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null ? js : Array.isArray(js) ? _immutable2.default.Seq(js).map(fromJSGreedy).toList() : _immutable2.default.Seq(js).map(fromJSGreedy).toMap();
};

exports.fromJSGreedy = fromJSGreedy;