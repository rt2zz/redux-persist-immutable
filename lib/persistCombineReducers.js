'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = persistCombineReducers;

var _reduxImmutable = require('redux-immutable');

var _immutable = require('immutable');

var _persistReducers = require('./persistReducers');

var _persistReducers2 = _interopRequireDefault(_persistReducers);

var _autoMergeLevel = require('./stateReconciler/autoMergeLevel2');

var _autoMergeLevel2 = _interopRequireDefault(_autoMergeLevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function persistCombineReducers(config, reducers) {
  config.stateReconciler = config.stateReconciler || _autoMergeLevel2.default;
  if (!reducers._persist) {
    reducers = _extends({}, reducers, { _persist: function _persist() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _immutable.Map)({});
        return state;
      } });
  }
  return (0, _persistReducers2.default)(config, (0, _reduxImmutable.combineReducers)(reducers));
}