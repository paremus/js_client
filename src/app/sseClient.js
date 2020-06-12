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
 * create EventSource and ensure its connected.
 * Don't attempt to connect until we're authenticated.
 * Disconnect on logout.
 */
export class SseClient {
    eventApi;
    connected = false;
    subId = 0;
    windowId = Math.random().toString(16).substr(2);
    pending = {};
    watches = {};
    monitors = {};
    lastMsg = {};

    constructor(apiBase) {
        this.eventApi = apiBase + "/watch/";
    }

    connect() {
        if (!this.connected) {
            Object.keys(this.pending).forEach(id => this.doWatch(id, this.pending[id]));
            this.pending = {};
        }
        this.connected = true;
    }

    disconnect() {
        console.log("SSE disconnect");
        Object.keys(this.watches).forEach(id => {
            const sub = this.watches[id];
            if (sub) {
                sub.eventSource.close();
            }
        });

        this.watches = {};
        this.monitors = {};
        this.connected = false;
    }

    monitor(resource, handler) {
        this.monitors[resource] = handler;
        return this.lastMsg[resource];
    }

    unmonitor(resource) {
        const monitor = this.monitors[resource];
        if (monitor) {
            monitor(null);
        }
    }

    doWatch(id, watch) {
        const {resource, filter, handler} = watch;
        console.log("SSE watch", {resource, filter});

        const qFilter = encodeURIComponent(JSON.stringify(filter));
        const url = this.eventApi + resource + '?filter=' + qFilter + '&window=' + this.windowId;
        const eventSource = new EventSource(url, {withCredentials: true});

        watch.eventSource = eventSource;
        this.watches[id] = watch;

        eventSource.addEventListener("watch", evt => {
            // only receives messages with specified type
            const msg = JSON.parse(evt.data);
            const handled = handler(msg);
            this.lastMsg[resource] = msg;

            const monitor = this.monitors[resource];
            if (!handled && monitor) {
                monitor(msg);
            }
        });

        // evtSource.onopen = e => {
        //   console.log("XXX open event", e);
        // };
        //
        // evtSource.onerror = e => {
        //   console.log("XXX error event", e);
        // };
        //
        // evtSource.onmessage = e => {
        //   // only receives messages with no type
        //   console.log("XXX message event", e);
        // };
    }

    watch = (resource, filter, handler) => {
        const id = this.subId++;
        const watch = {resource, filter, handler};
        if (this.connected) {
            this.doWatch(id, watch);
        } else {
            this.pending[id] = watch;
        }
        return id;
    }

    unwatch = (id) => {
        const watch = this.watches[id];
        if (watch) {
            console.log("SSE unwatch", {id, ...watch});
            watch.eventSource.close();
            delete this.watches[id];
            return true;
        }
        return false;
    }

}
