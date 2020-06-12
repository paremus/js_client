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
    AutocompleteInput,
    Datagrid,
    Edit,
    Filter,
    List,
    ReferenceInput,
    SaveButton,
    SimpleForm,
    TextField,
    TextInput,
    Toolbar,
} from 'react-admin';

import InstalledIcon from '@material-ui/icons/CheckCircle';
import UninstalledIcon from '@material-ui/icons/RadioButtonUnchecked';
import Tooltip from '@material-ui/core/Tooltip';

import EditActions from '../defaults/EditActions';

const validateRequired = () => value => {
    return value ? undefined : "Required";
};

const ListIconField = ({record = {}, ...props}) => {
    if (record.hosts && record.hosts.length > 0) {
        const hosts = record.hosts.join(',');
        return <Tooltip title={hosts}>
            <InstalledIcon/>
        </Tooltip>;
    } else {
        return <Tooltip title="Not installed">
            <UninstalledIcon/>
        </Tooltip>;
    }
};

const ListFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn resettable="true"/>
    </Filter>
);

export const BehaviourList = props => (
    <List title="Smart Behaviours"
          bulkActionButtons={false}
          exporter={false}
          filters={<ListFilter/>}
          {...props}>
        <Datagrid rowClick="edit">
            <ListIconField source="hosts" label="Installed"/>
            <TextField source="name"/>
            <TextField source="version"/>
            <TextField source="author"/>
            <TextField source="description"/>
        </Datagrid>
    </List>
);

// remove delete button
const EditToolbar = props => (
    <Toolbar {...props}>
        <SaveButton label="INSTALL" icon={<InstalledIcon/>}/>
    </Toolbar>
);

export const BehaviourEdit = (props) => {
    return <Edit
        undoable={false}
        actions={<EditActions/>}
        {...props}>
        <SimpleForm submitOnEnter={false} toolbar={<EditToolbar/>}>
            <TextField source="name"/>
            <TextField source="description"/>
            <TextField source="author"/>
            <TextField source="bundle"/>
            <TextField source="version"/>
            <TextField source="consumed"/>
            <TextField source="hosts"/>
            <ReferenceInput source="installHost" label="Install host" reference="hosts"
                            validate={[validateRequired()]}>
                <AutocompleteInput optionText="id"/>
            </ReferenceInput>
        </SimpleForm>
    </Edit>
};


