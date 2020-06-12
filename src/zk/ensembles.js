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
import React  from 'react';
import {
    ArrayField,
    ArrayInput,
    AutocompleteInput,
    Button,
    ChipField,
    Datagrid,
    DeleteButton,
    Edit,
    FormDataConsumer,
    List,
    ListButton,
    ReferenceInput,
    ReferenceManyField,
    SimpleForm,
    SimpleFormIterator,
    SingleFieldList,
    TextField,
    TextInput,
    Toolbar,
    required,
    TitleForRecord,
} from 'react-admin';

import {useMutation, useNotify, useRedirect, useRefresh} from 'react-admin';

import AddMemberIcon from '@material-ui/icons/Add';
import RemoveMemberIcon from '@material-ui/icons/Remove';
import ChangeRoleIcon from '@material-ui/icons/SwapHoriz';

import Card from '@material-ui/core/Card';

import EditActions from '../defaults/EditActions';

const AddMemberButton = ({member, record}) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const [addMember] = useMutation(
        {
            type: 'create',
            resource: 'zkservers',
            payload: {
                id: record.id,
                data: {
                    fibre_id: member,
                    ensemble_id: record.id
                }
            }
        },
        {
            onSuccess: ({data}) => {
                refresh();
                notify('Member added successfully');
            },
            onFailure: (error) => {
                notify(`Failed to add member: ${error.message}`, 'warning');
            }
        });

    return <Button label="Add Member" onClick={addMember}>
        <AddMemberIcon/>
    </Button>;
};

const RemoveMemberButton = ({record}) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const [removeMember] = useMutation(
        {
            type: 'delete',
            resource: 'zkservers',
            payload: {
                id: record.id
            }
        },
        {
            onSuccess: ({data}) => {
                refresh();
                notify('Member removed successfully');
            },
            onFailure: (error) => {
                notify(`Failed to remove member: ${error.message}`, 'warning');
            }
        });

    return <Button label="Remove Member" onClick={removeMember}>
        <RemoveMemberIcon/>
    </Button>;
};

const ChangeRoleButton = ({record}) => {
    const role = record.role === 'participant' ? 'observer' : 'participant';
    const notify = useNotify();
    const refresh = useRefresh();
    const [changeRole] = useMutation(
        {
            type: 'update',
            resource: 'zkservers',
            payload: {
                id: record.id,
                data: {
                    ...record,
                    role: role
                }
            }
        },
        {
            onSuccess: ({data}) => {
                refresh();
                notify('Role changed successfully');
            },
            onFailure: (error) => {
                notify(`Failed to change role: ${error.message}`, 'warning');
            }
        });

    const label = record.role === 'participant' ? 'Make Observer' : 'Make Participant';

    return <Button label={label} onClick={changeRole}>
        <ChangeRoleIcon/>
    </Button>;
};

// SingleFieldList is blowing up because props.ids is initially undefined
// so define TagsField instead.
// Note: tags are not actually required in the ensemble UI,
// they were added as a demo but are actually hard to render.
const TagsField = (props) => {
    if (props.ids && props.data) {
        // value = ids.map(key => data[key].value).join(' ');
        return <SingleFieldList linkType={false} {...props}>
            <ChipField source="value"/>
        </SingleFieldList>
    }
    return <span/>;
};

export const EnsembleList = props => {
    return <List title="Ensembles"
          bulkActionButtons={false}
          exporter={false}
          sort={{field: 'id', order: 'ASC'}}
          {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" label="Name"/>
            <ArrayField source="tags">
                <TagsField />
                {/*<SingleFieldList linkType={false}>*/}
                {/*    <ChipField source="value"/>*/}
                {/*</SingleFieldList>*/}
            </ArrayField>

            <DeleteButton redirect='list' undoable={false}/>
        </Datagrid>
    </List>
};

// we don't want delete or save on edit toolbar
// if we supply empty toolbar, then both edit and save are shown!
// so just list button
const EditToolbar = props => (
    <Toolbar {...props} >
        <ListButton label="Cancel"/>
    </Toolbar>
);

export const EnsembleEdit = (props) => (
    <Edit
        actions={<EditActions/>}
        {...props}>
        <SimpleForm toolbar={<EditToolbar/>}>
            <TextInput disabled label="Name" source="id"/>

            <ArrayField source="tags">
                <TagsField/>
                {/*<SingleFieldList linkType={false}>*/}
                {/*    <ChipField source="value"/>*/}
                {/*</SingleFieldList>*/}
            </ArrayField>

            <ReferenceInput label="Add Member" source="member" reference="fibres">
                <AutocompleteInput optionText="id"/>
            </ReferenceInput>

            <FormDataConsumer>
                {
                    ({formData, ...rest}) =>
                        <AddMemberButton member={formData.member} {...rest} />
                }
            </FormDataConsumer>

            <ReferenceManyField
                label="Members"
                reference="zkservers"
                target="ensemble_id"
            >
                <Datagrid>
                    <TextField source="serverId"/>
                    <TextField source="managementStatus" label="Status"/>
                    <TextField source="role"/>
                    <TextField source="currentRole"/>
                    <TextField source="fibre_id" label="Fibre"/>
                    <TextField source="address"/>
                    <TextField source="clientPort"/>
                    <TextField source="quorumPort"/>
                    <TextField source="transactionPort"/>
                    <ChangeRoleButton/>
                    <RemoveMemberButton/>
                    {
                        // delete button doesn't refresh after delete
                        // <DeleteButton undoable={false}/>
                    }
                </Datagrid>
            </ReferenceManyField>

        </SimpleForm>
    </Edit>
);


const validateRequired = required();

/*
 * We want to override save() so we can create a ZkServer rather than an Ensemble
 * i.e. UI needs to allow ensembleCreate, but API only supports zkServerCreate.
 *
 * It's not possible to override save() when SimpleForm is contained in <Create/>,
 * so we put it in our own <div/>.
 */
export const EnsembleCreate = props => {
    const [mutate] = useMutation();
    const redirect = useRedirect();

    const save = (record, redirectView) => {
        console.log("EnsembleCreate save:", {record, redirectView});
        const zkRecord = {ensemble_id: record.id, fibre_id: record.member};
        delete record.member;

        mutate({
            type: 'create',
            resource: 'ensembles',
            payload: {
                data: record
            },
        });

        mutate({
            type: 'create',
            resource: 'zkservers',
            payload: {
                data: zkRecord
            },
        });

        redirect('/ensembles');
    };

    return <div>
        <TitleForRecord title="Create Ensemble" record={{}}/>
        <Card>
            <SimpleForm redirect="list" resource="ensembles" save={save}>
                <TextInput source="id" label="Name" validate={validateRequired}/>

                <ArrayInput source="tags">
                    <SimpleFormIterator>
                        {/*<TextInput source="name"/>*/}
                        <TextInput label="tag name" source="value"/>
                    </SimpleFormIterator>
                </ArrayInput>

                <ReferenceInput label="Initial Member" source="member" reference="fibres" validate={validateRequired}>
                    <AutocompleteInput optionText="id"/>
                </ReferenceInput>

            </SimpleForm>
        </Card>
    </div>
};

