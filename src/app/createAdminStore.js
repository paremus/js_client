/*
 *  #%L
 *  com.paremus.ui-client
 *  %%
 *  Copyright (C) 2018 - 2020 Paremus Ltd
 *  %%
 *  Licensed under the Fair Source License, Version 0.9 (the "License");
 *
 *  See the NOTICE.txt file distributed with this work for additional
 *  information regarding copyright ownership. You may not use this file
 *  except in compliance with the License. For usage restrictions see the
 *  LICENSE.txt file distributed with this work
 *  #L%
 */

/**
 * https://marmelab.com/react-admin/CustomApp.html#including-react-admin-in-another-redux-application
 */

import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {routerMiddleware, connectRouter} from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import {all, fork} from 'redux-saga/effects';
import {
    adminReducer,
    adminSaga,
    USER_LOGOUT,
} from 'react-admin';

export default ({
                    authProvider,
                    customSagas = [],
                    dataProvider,
                    history,
                }) => {
    const reducer = combineReducers({
        admin: adminReducer,
        router: connectRouter(history),
    });
    const resettableAppReducer = (state, action) =>
        reducer(action.type !== USER_LOGOUT ? state : undefined, action);

    const saga = function* rootSaga() {
        yield all(
            [
                adminSaga(dataProvider, authProvider),
                ...customSagas
            ].map(fork)
        );
    };
    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancers =
        (process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined' &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                trace: true,
                traceLimit: 25,
            })) ||
        compose;

    const store = createStore(
        resettableAppReducer,
        { /* set your initial state here */},
        composeEnhancers(
            applyMiddleware(
                sagaMiddleware,
                routerMiddleware(history),
                // add your own middlewares here
            ),
            // add your own enhancers here
        ),
    );
    sagaMiddleware.run(saga);
    return store;
};
