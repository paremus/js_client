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
import React, {Component} from 'react';
import {Provider} from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

import {createMuiTheme} from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';

import UserIcon from '@material-ui/icons/Group';
import FabricIcon from '@material-ui/icons/CloudQueue';
import EventIcon from '@material-ui/icons/FlashOn';
import ConfigIcon from '@material-ui/icons/Settings';
import BehaviourIcon from '@material-ui/icons/DeviceHub';
import HostIcon from '@material-ui/icons/Devices';

import {Admin, Resource, fetchUtils} from 'react-admin';

import simpleRestProvider from 'ra-data-simple-rest';
import {createBrowserHistory} from 'history';

import createAdminStore from './createAdminStore';
import createAuthProvider from './authProvider';
import {SseClient} from './sseClient';

import MyLogin from './MyLogin';
import wrapDataProvider from './WrapDataProvider';

import {EnsembleEdit, EnsembleList, EnsembleCreate} from "../zk/ensembles";
import {FabricList, FabricShow} from "../resources/fabrics";
import {ConfigList, ConfigEdit} from "../resources/config";
import {EventList, EventShow} from "../resources/events";
import {BehaviourList, BehaviourEdit} from "../resources/behaviours";
import {HostList, HostEdit} from "../resources/hosts";

const prdcfg = window.prdcfg || {};
const apiBase = prdcfg.apiBase || '/api';

export const sseClient = new SseClient(apiBase);
const authProvider = createAuthProvider(apiBase, sseClient);

class EventBadge extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        const msg = sseClient.monitor("events", msg => {
            this.setState((state, props) => {
                return {count: msg ? msg.count : 0};
            });
        });

        this.state.count = msg ? msg.count : 0;
    }

    render() {
        return <Badge badgeContent={this.state.count} color="primary">
            <EventIcon />
        </Badge>;
    }
}

// define our own http client so we can specify credentials: 'include'
const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({Accept: 'application/json'});
    }
    const request = new Request(url, {credentials: 'include'});
    return fetchUtils.fetchJson(request, options);
};

const dataProvider = wrapDataProvider(simpleRestProvider(apiBase, httpClient), sseClient);

const history = createBrowserHistory();

const theme = createMuiTheme({
    palette: {
        type: 'light', // Switching the dark mode on is a single property value change.
    },
});

const myDashboard = () => {
    const dash = prdcfg.dashboard || {};
    return <Card>
        <CardHeader title={dash.head || "Welcome to the Product UI"}/>
        <CardContent>
            <div dangerouslySetInnerHTML={{__html: dash.content}}/>
        </CardContent>
    </Card>
};

const customSagas = [];

export const adminStore = createAdminStore({authProvider, customSagas, dataProvider, history});

const App = () => (
    <Provider store={adminStore}>
        <Admin title="Paremus Product"
               dashboard={myDashboard}
               loginPage={MyLogin}
               theme={theme}
               authProvider={authProvider}
               customSagas={customSagas}
               dataProvider={dataProvider}
               history={history}
        >
            <Resource name="fibres"/>
            <Resource name="zkservers"/>
            <Resource name="event_sources"/>
            <Resource name="event_topics"/>

            {prdcfg.hide.includes('behaviours') ? <span/> :
                <Resource name="behaviours" list={BehaviourList} edit={BehaviourEdit} icon={BehaviourIcon}/>
            }

            {prdcfg.hide.includes('config') ? <span/> :
                <Resource name="config" options={{label: 'Configuration'}} list={ConfigList} edit={ConfigEdit}
                          icon={ConfigIcon}/>
            }

            {prdcfg.hide.includes('events') ? <span/> :
                <Resource name="events" list={EventList} show={EventShow} icon={EventBadge}/>
            }

            {prdcfg.hide.includes('fabrics') ? <span/> :
                <Resource name="fabrics" list={FabricList} show={FabricShow} icon={FabricIcon}/>
            }

            {prdcfg.hide.includes('hosts') ? <span/> :
                <Resource name="hosts" list={HostList} edit={HostEdit} icon={HostIcon}/>
            }

            {prdcfg.hide.includes('ensembles') ? <span/> :
                <Resource name="ensembles" list={EnsembleList} edit={EnsembleEdit} create={EnsembleCreate}
                          icon={UserIcon}/>
            }

        </Admin>
    </Provider>
);


export default App;
