'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.persistCombineReducers = exports.persistReducer = undefined;

var _persistReducers = require('./persistReducers');

var _persistReducers2 = _interopRequireDefault(_persistReducers);

var _persistCombineReducers = require('./persistCombineReducers');

var _persistCombineReducers2 = _interopRequireDefault(_persistCombineReducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.persistReducer = _persistReducers2.default;
exports.persistCombineReducers = _persistCombineReducers2.default;