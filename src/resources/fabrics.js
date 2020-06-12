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
    ArrayField,
    BooleanField,
    Datagrid,
    List,
    NumberField,
    Show,
    ShowButton,
    SimpleShowLayout,
    TextField,
} from 'react-admin';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ShowActions from '../defaults/EditActions';

const FibresField = ({record = {}}) => <span>{record.actualFibres} / {record.expectedFibres}</span>;
FibresField.defaultProps = {label: 'Fibres'};

const SystemsField = ({record = {}}) => {
    const systems = record.systems;
    const running = systems.filter(s => s.running);
    return <span>{running.length} / {systems.length}</span>;
};

const AdminUrlSelect = ({record = {}}) => {
    const uris = record.managementURIs;
    return <Select value={uris[0]}>
        {uris.map((url, index) => (
            <MenuItem key={index} value={url}><a href={url} target="_blank"
                                                 rel="noopener noreferrer"> {url} </a></MenuItem>
        ))}
    </Select>
};

const AdminUrlFields = ({record}) => (
    <ul>
        {record.managementURIs.map((url, index) => (
            <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
        ))}
    </ul>
);
AdminUrlFields.defaultProps = {addLabel: true};

export const FabricList = props => (
    <List title="Fabrics"
          bulkActionButtons={false}
          exporter={false}
          sort={{field: 'id', order: 'ASC'}}
          {...props}>
        {/*FIXME ShowButton added because <DataGrid rowClick="show"> conflicts with AdminUrlSelect*/}
        <Datagrid>
            <TextField source="id" label="Name"/>
            <TextField source="location" label="Location"/>
            <TextField source="owner" label="Owner"/>
            <FibresField label="Fibres"/>
            <SystemsField label="Systems"/>
            <AdminUrlSelect label="Admin URLs"/>
            <ShowButton label="Details"/>
        </Datagrid>
    </List>
);


export const FabricShow = (props) => (
    <Show
        actions={<ShowActions/>}
        {...props}>
        <SimpleShowLayout>
            <TextField source="id" label="Name"/>
            <TextField source="location" label="Location"/>
            <TextField source="owner" label="Owner"/>
            <NumberField source="actualFibres" label="Actual Fibres"/>
            <NumberField source="expectedFibres" label="Expected Fibres"/>
            <AdminUrlFields label="Admin URLs"/>

            <ArrayField source="systems">
                <Datagrid>
                    <TextField source="id" label="Name"/>
                    <TextField source="version" label="Version"/>
                    <BooleanField source="running" label="Running"/>
                </Datagrid>
            </ArrayField>

        </SimpleShowLayout>
    </Show>
);


