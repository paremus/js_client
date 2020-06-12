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
 * WrapDataProvider - so we can filter calls
 * - to watch for realtime updates
 * - ConfigEditField requires data keys don't contain non-navigation '.', so filter '.' to '~'
 */

import {refreshView} from 'react-admin';
import {adminStore} from './App';

const mapKeys = (obj, mapKey) => {
    const keyValues = Object.keys(obj).map(key => {
        const val = obj[key];
        delete obj[key];
        return {[mapKey(key)]: val};
    });
    return Object.assign(obj, ...keyValues);
};

const filterRequest = (resource, params) => {
    if (resource === 'config') {
        const {data, previousData} = params;
        mapKeys(data.values, k => k.replace(/~/g, '.'));
        mapKeys(previousData.values, k => k.replace(/~/g, '.'));
    }
};

const filterResponse = (resource, response) => {
    if (resource === 'config') {
        if (Array.isArray(response.data)) {
            response.data.forEach(data => {
                mapKeys(data.values, k => k.replace(/[.]/g, '~'));
            });
        } else {
            mapKeys(response.data.values, k => k.replace(/[.]/g, '~'));
        }
    }
    return response;
};

let watch_id = null;
let watch_filter;
let unwatch = false;
let count = 0;
const watchResource = (sseClient, resource, params) => {
    switch (resource) {
        case 'events':
            unwatch = false;
            count = 0;
            sseClient.unmonitor(resource);

            if (watch_id !== null &&
                Object.entries(watch_filter).toString() !== Object.entries(params.filter).toString()) {
                sseClient.unwatch(watch_id);
                watch_id = null;
            }
            if (watch_id === null) {
                watch_filter = params.filter;
                watch_id = sseClient.watch(resource, watch_filter, w => {
                    console.log("realtime watch received: ", w);
                    if (w.available) {
                        count += w.available;
                        w.count = count;
                        if (!unwatch) {
                            adminStore.dispatch(refreshView());
                        }
                    }
                    return !unwatch;
                });
                console.log(`created realtime watch id=${watch_id} filter:`, watch_filter);
            }
            break;

        case 'event_sources':
        case 'event_topics':
            break;

        default:
            if (watch_id !== null) {
                if (Object.keys(watch_filter).length > 0) {
                    console.log("continue realtime watch");
                    unwatch = true;
                }
                else {
                    console.log("destroy realtime watch id=" + watch_id);
                    sseClient.unwatch(watch_id);
                    watch_id = null;
                }
            }
            break;
    }
}

const getList = (provider, sseClient) => (resource, params) => {
    watchResource(sseClient, resource, params);
    return provider.getList(resource, params).then(response => filterResponse(resource, response));
}

const getOne = provider => (resource, params) =>
    provider.getOne(resource, params).then(response => filterResponse(resource, response));

const getMany = provider => (resource, params) =>
    provider.getMany(resource, params).then(response => filterResponse(resource, response));

const getManyReference = provider => (resource, params) =>
    provider.getManyReference(resource, params).then(response => filterResponse(resource, response));

const update = provider => (resource, params) => {
    filterRequest(resource, params);
    return provider.update(resource, params);
};

const updateMany = provider => (resource, params) => {
    filterRequest(resource, params);
    return provider.updateMany(resource, params);
};

const create = provider => (resource, params) => provider.create(resource, params);
const delete_ = provider => (resource, params) => provider.delete(resource, params);
const deleteMany = provider => (resource, params) => provider.deleteMany(resource, params);

const wrapProvider = (provider, sseClient) => ({
    getList: getList(provider, sseClient),
    getOne: getOne(provider),
    getMany: getMany(provider),
    getManyReference: getManyReference(provider),
    update: update(provider),
    updateMany: updateMany(provider),
    create: create(provider),
    delete: delete_(provider),
    deleteMany: deleteMany(provider)
});

export default wrapProvider;