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

const login = (authUri, evtClient, {username, password, rememberMe}) => {
    const request = new Request(authUri, {
        credentials: 'include',
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({username, password, rememberMe})
    });

    return fetch(request).then(response => {
        console.log("auth response:", response);
        // for (let pair of response.headers.entries()) {
        //   console.log("auth header: " + pair[0] + ': ' + pair[1]);
        // }

        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
        }

        localStorage.setItem('username', username);
        evtClient.connect();
    });
};

const logout = (authUri, evtClient) => {
    const loginName = localStorage.getItem('username');
    localStorage.removeItem('username');

    if (!loginName) {
        return Promise.resolve();
    }

    const request = new Request(authUri, {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: "{}"
    });

    evtClient.disconnect();

    return fetch(request).then(x => ({redirectTo: '/'}));
};

// called when the user navigates to a new location
const checkAuth = (evtClient) => {
    const loggedIn = !!localStorage.getItem('username');
    if (loggedIn)
        evtClient.connect();
    return loggedIn ? Promise.resolve() : Promise.reject();
};

const checkError = ({status}) => {
    if (status === 401 || status === 403) {
        localStorage.removeItem('username');
        return Promise.reject();
    }
    return Promise.resolve();
};

const createAuthProvider = (apiBase, evtClient) => (
    {
        login: params => login(apiBase + '/login', evtClient, params),
        logout: params => logout(apiBase + '/login', evtClient, params),
        checkAuth: params => checkAuth(evtClient, params),
        checkError: params => checkError(params),
        getPermissions: params => Promise.resolve()
    }
);

export default createAuthProvider;
