module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(1);

var _ramda2 = _interopRequireDefault(_ramda);

var _reduxObservable = __webpack_require__(2);

var _Observable = __webpack_require__(3);

__webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates an observable epic ready to use with Redux
 * @param options Custom options for creating observable
 * @return {Object} On object with pure observables and epic
 */
exports.default = function (options) {
  var backUpModifier = function backUpModifier(result) {
    return result;
  };
  var mainRedux = options.mainRedux,
      reduxPath = options.reduxPath,
      _options$create = options.create,
      create = _options$create === undefined ? {} : _options$create,
      _options$update = options.update,
      update = _options$update === undefined ? {} : _options$update,
      _options$remove = options.remove,
      remove = _options$remove === undefined ? {} : _options$remove,
      _options$modifier = options.modifier,
      modifier = _options$modifier === undefined ? backUpModifier : _options$modifier;


  var getEpic = function getEpic(action$, store, _ref) {
    var Api = _ref.Api;
    return action$.ofType(mainRedux.Types.getRequest).mergeMap(function (_ref2) {
      var force = _ref2.force;

      var items = store.getState()[reduxPath].get;
      // Verify if is not the same that is stored
      if (!force && !items.error && items.results.length) {
        return Promise.resolve(mainRedux.Creators.getSuccess(items.results));
      }
      return Api[reduxPath].get().then(function (response) {
        return response.data.data;
      }).then(function (results) {
        return mainRedux.Creators.getSuccess(results);
      }).catch(function (error) {
        return mainRedux.Creators.getFailure(error);
      });
    });
  };

  var getOneEpic = function getOneEpic(action$, store, _ref3) {
    var Api = _ref3.Api;
    return action$.ofType(mainRedux.Types.getOneRequest).mergeMap(function (_ref4) {
      var id = _ref4.id,
          force = _ref4.force;

      var item = store.getState()[reduxPath].getOne;
      // Verify if is not the same that is stored
      if (!force && !item.error && item.id == id) {
        return Promise.resolve(mainRedux.Creators.getOneSuccess(id, item));
      }
      return Api[reduxPath].getOne(id).then(function (response) {
        return response.data.data;
      }).then(function (result) {
        return mainRedux.Creators.getOneSuccess(id, modifier(result));
      }).catch(function (error) {
        return mainRedux.Creators.getOneFailure(error);
      });
    });
  };

  var getOneFromStateEpic = function getOneFromStateEpic(action$, store) {
    return action$.ofType(mainRedux.Types.getOneFromState).mergeMap(function (_ref5) {
      var id = _ref5.id,
          path = _ref5.path,
          noResolve = _ref5.noResolve;

      var toSearch = store.getState();
      // Get the selected path from store
      toSearch = path.split('.').reduce(function (currVal, prop) {
        return currVal[prop];
      }, toSearch);
      // Filter items by id
      var filtered = toSearch.filter(function (item) {
        return item.id === id;
      });
      // Return get One action with found item
      if (filtered.length) {
        return Promise.resolve(mainRedux.Creators.getOneSuccess(id, modifier(filtered[0]), noResolve));
      } else {
        // Return error
        return Promise.resolve(mainRedux.Creators.getOneFailure({ message: "Not found" }));
      }
    });
  };

  var createEpic = function createEpic(action$, store, _ref6) {
    var Api = _ref6.Api;
    return action$.ofType(mainRedux.Types.createRequest).mergeMap(function (_ref7) {
      var data = _ref7.data;
      return Api[reduxPath].create(data).then(function (response) {
        return response.data.data;
      }).then(function (result) {
        return mainRedux.Creators.createSuccess(modifier(result));
      }).catch(function (error) {
        return mainRedux.Creators.createFailure(error);
      });
    });
  };

  var createSuccessEpic = function createSuccessEpic(action$) {
    return action$.ofType(mainRedux.Types.createSuccess).mergeMap(function (_ref8) {
      var result = _ref8.result;
      var _create$onSuccessActi = create.onSuccessActions,
          onSuccessActions = _create$onSuccessActi === undefined ? [] : _create$onSuccessActi;

      var backUpFilter = function backUpFilter() {
        return true;
      };
      var actions = onSuccessActions.map(function (item) {
        var redux = item.redux,
            _item$pathToUpdate = item.pathToUpdate,
            pathToUpdate = _item$pathToUpdate === undefined ? reduxPath : _item$pathToUpdate,
            _item$filter = item.filter,
            filter = _item$filter === undefined ? backUpFilter : _item$filter;

        return redux.Creators.getOneCreateFrom(result, pathToUpdate, filter);
      });
      return _Observable.Observable.from(actions);
    });
  };

  var updateEpic = function updateEpic(action$, store, _ref9) {
    var Api = _ref9.Api;
    return action$.ofType(mainRedux.Types.updateRequest).mergeMap(function (_ref10) {
      var id = _ref10.id,
          data = _ref10.data;
      return Api[reduxPath].update(id, data).then(function (response) {
        return response.data.data;
      }).then(function (result) {
        return mainRedux.Creators.updateSuccess(modifier(result));
      }).catch(function (error) {
        return mainRedux.Creators.updateFailure(error);
      });
    });
  };

  var updateSuccessEpic = function updateSuccessEpic(action$) {
    return action$.ofType(mainRedux.Types.updateSuccess).mergeMap(function (_ref11) {
      var result = _ref11.result;
      var _update$onSuccessActi = update.onSuccessActions,
          onSuccessActions = _update$onSuccessActi === undefined ? [] : _update$onSuccessActi;

      var actions = onSuccessActions.map(function (item) {
        var redux = item.redux,
            _item$pathToUpdate2 = item.pathToUpdate,
            pathToUpdate = _item$pathToUpdate2 === undefined ? reduxPath : _item$pathToUpdate2;

        return redux.Creators.getOneUpdateFrom(result, pathToUpdate);
      });
      return _Observable.Observable.from(actions);
    });
  };

  var removeEpic = function removeEpic(action$, store, _ref12) {
    var Api = _ref12.Api;
    return action$.ofType(mainRedux.Types.removeRequest).mergeMap(function (_ref13) {
      var id = _ref13.id;
      return Api[reduxPath].remove(id).then(function (response) {
        return response.data.data;
      }).then(function (result) {
        return mainRedux.Creators.removeSuccess(id);
      }).catch(function (error) {
        return mainRedux.Creators.removeFailure(error);
      });
    });
  };

  var removeSuccessEpic = function removeSuccessEpic(action$, store) {
    return action$.ofType(mainRedux.Types.removeSuccess).mergeMap(function (_ref14) {
      var id = _ref14.id;
      var _remove$onSuccessActi = remove.onSuccessActions,
          onSuccessActions = _remove$onSuccessActi === undefined ? [] : _remove$onSuccessActi;

      var actions = onSuccessActions.map(function (item) {
        var redux = item.redux,
            _item$pathToUpdate3 = item.pathToUpdate,
            pathToUpdate = _item$pathToUpdate3 === undefined ? reduxPath : _item$pathToUpdate3;

        return redux.Creators.getOneRemoveFrom(id, pathToUpdate);
      });
      return _Observable.Observable.from(actions);
    });
  };

  // Merge for testing
  var observables = {
    getEpic: getEpic,
    getOneEpic: getOneEpic,
    getOneFromStateEpic: getOneFromStateEpic,
    createEpic: createEpic,
    createSuccessEpic: createSuccessEpic,
    updateEpic: updateEpic,
    updateSuccessEpic: updateSuccessEpic,
    removeEpic: removeEpic,
    removeSuccessEpic: removeSuccessEpic
  };

  var epic = (0, _reduxObservable.combineEpics)(getEpic, getOneEpic, getOneFromStateEpic, createEpic, createSuccessEpic, updateEpic, updateSuccessEpic, removeEpic, removeSuccessEpic);

  return {
    observables: observables,
    epic: epic
  };
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("ramda");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("redux-observable");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("rxjs");

/***/ })
/******/ ]);