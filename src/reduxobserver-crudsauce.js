import R from 'ramda';
import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import 'rxjs';

/**
 * Creates an observable epic ready to use with Redux
 * @param options Custom options for creating observable
 * @return {Object} On object with pure observables and epic
 */
export default options => {
  const backUpModifier = result => result;
  const { mainRedux, reduxPath, create = {}, update = {}, remove = {}, modifier = backUpModifier } = options;
  
  const getEpic = (action$, store, { Api }) => 
    action$
      .ofType(mainRedux.Types.getRequest)
      .mergeMap(({ force }) => {
        const items = store.getState()[reduxPath].get;
        // Verify if is not the same that is stored
        if (!force && !items.error && items.results.length) {
          return Promise.resolve(mainRedux.Creators.getSuccess(items.results))
        }
        return Api[reduxPath].get()
          .then(response => response.data.data)
          .then(results => mainRedux.Creators.getSuccess(results))
          .catch(error => mainRedux.Creators.getFailure(error))
      });

  const getOneEpic = (action$, store, { Api }) => 
    action$
      .ofType(mainRedux.Types.getOneRequest)
      .mergeMap(({ id, force }) => {
        const item = store.getState()[reduxPath].getOne;
        // Verify if is not the same that is stored
        if (!force && !item.error && item.id == id) {
          return Promise.resolve(mainRedux.Creators.getOneSuccess(id, item))
        }
        return Api[reduxPath].getOne(id)
          .then(response => response.data.data)
          .then(result => mainRedux.Creators.getOneSuccess(id, modifier(result)))
          .catch(error => mainRedux.Creators.getOneFailure(error))
      });
  
  const getOneFromStateEpic = (action$, store) =>
      action$
        .ofType(mainRedux.Types.getOneFromState)
        .mergeMap(({ id, path, noResolve }) => {
          let toSearch = store.getState();
          // Get the selected path from store
          toSearch = path.split('.').reduce((currVal, prop) => currVal[prop], toSearch);
          // Filter items by id
          const filtered = toSearch.filter(item => item.id === id);
          // Return get One action with found item
          if(filtered.length) {
            return Promise.resolve(mainRedux.Creators.getOneSuccess(id, modifier(filtered[0]), noResolve));
          } else {
            // Return error
            return Promise.resolve(mainRedux.Creators.getOneFailure({ message: "Not found"}));
          }
        })

  const createEpic = (action$, store, { Api }) =>
    action$.ofType(mainRedux.Types.createRequest)
      .mergeMap(({ data }) => (
        Api[reduxPath].create(data)
          .then(response => response.data.data)
          .then(result => mainRedux.Creators.createSuccess(modifier(result)))
          .catch(error => mainRedux.Creators.createFailure(error))
      ));

  const createSuccessEpic = (action$) =>
    action$.ofType(mainRedux.Types.createSuccess)
      .mergeMap(({ result }) => {
        const { onSuccessActions = [] } =  create;
        const backUpFilter = () => true;
        const actions = onSuccessActions.map(item => {
          const { redux, pathToUpdate = reduxPath, filter = backUpFilter } = item;
          return redux.Creators.getOneCreateFrom(result, pathToUpdate, filter);
        });
        return Observable.from(actions);
      });

  const updateEpic = (action$, store, { Api }) =>
    action$.ofType(mainRedux.Types.updateRequest)
      .mergeMap(({ id, data }) => (
        Api[reduxPath].update(id, data)
          .then(response => response.data.data)
          .then(result => mainRedux.Creators.updateSuccess(modifier(result)))
          .catch(error => mainRedux.Creators.updateFailure(error))
      ));

  const updateSuccessEpic = (action$) =>
    action$.ofType(mainRedux.Types.updateSuccess)
      .mergeMap(({ result }) => {
        const { onSuccessActions = [] } =  update;
        const actions = onSuccessActions.map(item => {
          const { redux, pathToUpdate = reduxPath } = item;
          return redux.Creators.getOneUpdateFrom(result, pathToUpdate);
        });
        return Observable.from(actions);
      });
      
  const removeEpic = (action$, store, { Api }) =>
    action$.ofType(mainRedux.Types.removeRequest)
      .mergeMap(({ id }) => (
        Api[reduxPath].remove(id)
          .then(response => response.data.data)
          .then(result => mainRedux.Creators.removeSuccess(id))
          .catch(error => mainRedux.Creators.removeFailure(error))
      ));

  const removeSuccessEpic = (action$, store) =>
    action$.ofType(mainRedux.Types.removeSuccess)
      .mergeMap(({ id }) => {
        const { onSuccessActions = [] } =  remove;
        const actions = onSuccessActions.map(item => {
          const { redux, pathToUpdate = reduxPath } = item;
          return redux.Creators.getOneRemoveFrom(id, pathToUpdate);
        });
        return Observable.from(actions);
      });

  // Merge for testing
  const observables = {
    getEpic,
    getOneEpic,
    getOneFromStateEpic,
    createEpic,
    createSuccessEpic,
    updateEpic,
    updateSuccessEpic,
    removeEpic,
    removeSuccessEpic,
  };

  const epic = combineEpics(
    getEpic,
    getOneEpic,
    getOneFromStateEpic,
    createEpic,
    createSuccessEpic,
    updateEpic,
    updateSuccessEpic,
    removeEpic,
    removeSuccessEpic,
  );

  return {
    observables,
    epic,
  };
}