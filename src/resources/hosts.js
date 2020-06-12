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
    Edit,
    List,
    SaveButton,
    SelectInput,
    SimpleForm,
    TextField,
    Toolbar,
} from 'react-admin';

import UninstallIcon from '@material-ui/icons/CheckCircle';

import EditActions from '../defaults/EditActions';

// remove delete button
const EditToolbar = props => (
    <Toolbar {...props}>
        <SaveButton label="UNINSTALL" icon={<UninstallIcon/>}/>
    </Toolbar>
);

const BehaviourCount = props => {
    const behaviours = props.record.behaviours;
    const count = Object.keys(behaviours).length;
    return <span>{count}</span>;
};

export const HostList = props => (
    <List title="Hosts"
          bulkActionButtons={false}
          exporter={false}
          sort={{field: 'id', order: 'ASC'}}
          {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" label={"Host"}/>
            <BehaviourCount label={"Behaviours"}/>
            <TextField source="info.model" label={"Model"}/>
            <TextField source="info.cpu_id" label={"Processor"}/>
            <TextField source="info.memory" label={"Memory"}/>
            <TextField source="info.disk" label={"Disk"}/>
        </Datagrid>
    </List>
);

const MapField = ({source, record = {}}) => {
    const map = record[source];
    const keys = Object.keys(map);
    const data = {};
    keys.sort().forEach(key => {
        const value = map[key];
        data[key] = {key, value};
    });
    return <Datagrid
        data={data}
        ids={keys}
        currentSort={{field: 'no-sort-needed-to-avoid-datagrid-exception'}}>
        <TextField source={"key"}/>
        <TextField source={"value"}/>
    </Datagrid>;
};
MapField.defaultProps = {addLabel: true};

const BehaviourField = props => {
    const behaviours = props.record.behaviours;
    const list = Object.keys(behaviours).map(id => {
        const version = id.replace(/.*:/, '');
        const name = behaviours[id] + ' (' + version + ')';
        return name + "\n";
    });
    return <pre>{list}</pre>;
};
BehaviourField.defaultProps = {addLabel: true};

const BehaviourInput = props => {
    const behaviours = props.record.behaviours;
    const choices = Object.keys(behaviours).map(id => {
        const version = id.replace(/.*:/, '');
        const name = behaviours[id] + ' (' + version + ')';
        return {id, name};
    });
    choices.push({id: 'ALL', name: 'ALL (RESET)'});
    return <SelectInput choices={choices} {...props}/>
};

const validateRequired = () => value => {
    return value ? undefined : "Required";
};

export const HostEdit = (props) => {
    return <Edit
        undoable={false}
        actions={<EditActions/>}
        {...props}>
        <SimpleForm submitOnEnter={false} toolbar={<EditToolbar/>}>
            <TextField source="id" label={"Host"}/>
            <TextField source="fwId" label={"Framework"}/>
            <MapField source="info" label={"Host Info"}/>
            <BehaviourField label="Behaviours"/>
            <BehaviourInput source="uninstall" validate={[validateRequired()]}/>
        </SimpleForm>
    </Edit>
};


