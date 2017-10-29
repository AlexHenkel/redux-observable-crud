'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _reduxObservable = require('redux-observable');

var _Observable = require('rxjs/Observable');

require('rxjs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates an observable epic ready to use with Redux
 * @param options Custom options for creating observable
 * @return {Object} On object with pure observables and epic
 */
exports.default = function (options) {
  var mainRedux = options.mainRedux,
      reduxPath = options.reduxPath,
      _options$create = options.create,
      create = _options$create === undefined ? {} : _options$create,
      _options$update = options.update,
      update = _options$update === undefined ? {} : _options$update,
      _options$remove = options.remove,
      remove = _options$remove === undefined ? {} : _options$remove,
      _options$modifier = options.modifier,
      modifier = _options$modifier === undefined ? function (result) {
    return result;
  } : _options$modifier,
      _options$generalDataH = options.generalDataHandler,
      generalDataHandler = _options$generalDataH === undefined ? function (response) {
    return response.data.data;
  } : _options$generalDataH,
      _options$dataHandlers = options.dataHandlers,
      dataHandlers = _options$dataHandlers === undefined ? {} : _options$dataHandlers;
  var _dataHandlers$get = dataHandlers.get,
      getHandler = _dataHandlers$get === undefined ? generalDataHandler : _dataHandlers$get,
      _dataHandlers$getOne = dataHandlers.getOne,
      getOneHandler = _dataHandlers$getOne === undefined ? generalDataHandler : _dataHandlers$getOne,
      _dataHandlers$create = dataHandlers.create,
      createHandler = _dataHandlers$create === undefined ? generalDataHandler : _dataHandlers$create,
      _dataHandlers$update = dataHandlers.update,
      updateHandler = _dataHandlers$update === undefined ? generalDataHandler : _dataHandlers$update,
      _dataHandlers$remove = dataHandlers.remove,
      removeHandler = _dataHandlers$remove === undefined ? generalDataHandler : _dataHandlers$remove;


  var getEpic = function getEpic(action$, store, _ref) {
    var Api = _ref.Api;
    return action$.ofType(mainRedux.Types.getRequest).mergeMap(function (_ref2) {
      var data = _ref2.data,
          force = _ref2.force;

      var items = store.getState()[reduxPath].get;
      // Verify if is not the same that is stored
      if (!force && !items.error && items.results.length) {
        return Promise.resolve(mainRedux.Creators.getSuccess(items.results));
      }
      return Api[reduxPath].get(data).then(getHandler).then(function (results) {
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
          force = _ref4.force,
          data = _ref4.data;

      var item = store.getState()[reduxPath].getOne;
      // Verify if is not the same that is stored
      if (!force && !item.error && item.id == id) {
        return Promise.resolve(mainRedux.Creators.getOneSuccess(id, item));
      }
      return Api[reduxPath].getOne(id, data).then(getOneHandler).then(function (result) {
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
      return Api[reduxPath].create(data).then(createHandler).then(function (result) {
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
      return Api[reduxPath].update(id, data).then(updateHandler).then(function (result) {
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
      var id = _ref13.id,
          data = _ref13.data;
      return Api[reduxPath].remove(id, data).then(removeHandler).then(function (result) {
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