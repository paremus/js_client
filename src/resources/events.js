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

import React from 'react';

import {
    Datagrid,
    Filter,
    List,
    Pagination,
    ReferenceInput,
    SelectInput,
    Show,
    SimpleShowLayout,
    TextField,
    TextInput,
} from 'react-admin';

import * as moment from 'moment';
import ShowActions from '../defaults/EditActions';

const JsonField = ({record = {}, source}) => {
    const data = record[source];
    const display = JSON.stringify(data, null, 4);
    return <pre>{display}</pre>
};
JsonField.defaultProps = {addLabel: true};

const TimestampField = ({record = {}, source, format, label}) => {
    let display = '';
    const instance = record[source];

    if (instance) {
        const millis = instance.epochSecond * 1000 + instance.nano / 1000000;
        const m = moment(millis);

        if (format === 'relative') {
            display = m.fromNow();
        } else if (format) {
            display = m.format(format);
        } else {
            display = m.format();
        }
    }

    return <span>{display}</span>
};
TimestampField.defaultProps = {addLabel: true};

const EventPagination = props => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />

const EventFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn resettable="true"/>
        <ReferenceInput label="Event Type" source="topic" reference="event_topics" alwaysOn allowEmpty>
            <SelectInput optionText="id" resettable="true"/>
        </ReferenceInput>
        <ReferenceInput label="Event Source" source="source" reference="event_sources" allowEmpty>
            <SelectInput optionText="id" resettable="true"/>
        </ReferenceInput>
        <TextInput label="After Time" source="timestamp_gt" defaultValue={(new Date()).toISOString()}/>
        <TextInput label="Before Time" source="timestamp_lt" defaultValue={(new Date()).toISOString()}/>
    </Filter>
);

export const EventList = props => (
    <List title="Events"
          bulkActionButtons={false}
          exporter={false}
          filters={<EventFilter/>}
          sort={{field: 'timestamp', order: 'DESC'}}
          pagination={<EventPagination/>}
          {...props}>
        <Datagrid rowClick="show">
            <TextField source="topic" label="Type"/>
            <TextField source="source" label="Source"/>
            <TimestampField source="timestamp" format="YYYY-MM-DDTHH:mm:ss.SSS" label="Timestamp"/>
        </Datagrid>
    </List>
);

export const EventShow = (props) => {
    return <Show
        actions={<ShowActions/>}
        {...props}>
        <SimpleShowLayout>
            <TextField source="topic" label="Name"/>
            <TextField source="source" label="Source"/>
            <TimestampField source="timestamp" format="YYYY-MM-DDTHH:mm:ss.SSS" label="Timestamp"/>
            <JsonField source="data" label="Event Data"/>
        </SimpleShowLayout>
    </Show>
};


