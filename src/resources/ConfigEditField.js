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
    BooleanInput,
    CheckboxGroupInput,
    NumberInput,
    RadioButtonGroupInput,
    SelectArrayInput,
    SelectInput,
    TextInput,
} from 'react-admin';

const ConfigEditField = ({record = {}, ...props}) => {
    // record here is an attributes element

    const id = record.id;
    const cardinality = record.cardinality;
    const defaultValue = record.defaultValue;
    const name = record.name;
    const options = record.options;
    const required = record.required;
    const type = record.type;

    const label = name || id;
    const value = defaultValue ? defaultValue[0] : undefined;

    // The source=key attribute navigates the record structure if it contains '.':
    // e.g. attributes.3.defaultValue.0 or values.org.osgi.service.http.port
    //
    // The key must not contain any other non-navigation '.', so convert to '~' here and in WrapDataProvider.
    const key = id.replace(/[.]/g, '~');
    const source = 'values.' + key + (cardinality === 0 ? '.0' : '');

    const vrequired = (message = 'Required') =>
        value => {
            if (Array.isArray(value)) {
                value = value[0];
            }
            return value ? undefined : message;
        };

    let validate = [];

    if (required) {
        validate = [vrequired()];
    }

    if (options) {
        const choices = Object.keys(options).map((k) => {
            const def = defaultValue ? defaultValue.includes(k) : false;
            const badge = def ? ' *' : '';
            return {id: k, name: options[k] + badge};
        });

        const small = choices.length <= 6;

        if (cardinality === 0) { // single select
            return small
                ? <RadioButtonGroupInput source={source} choices={choices} label={label} validate={validate}/>
                : <SelectInput source={source} choices={choices} label={label} validate={validate}/>
        } else { // multiple select
            return small
                ? <CheckboxGroupInput source={source} choices={choices} label={label} validate={validate}/>
                : <SelectArrayInput source={source} choices={choices} label={label} validate={validate}/>
        }
    } else if (cardinality !== 0) {
        // all other multiple inputs read as strings
        // server will convert them to correct type
        const arrayFormatter = (array) => array ? array.join('\n') : undefined;
        const arrayParser = (string) => typeof string === 'string' ? string.split('\n') : undefined;
        const value = defaultValue ? defaultValue.join('\n') : undefined;
        return <TextInput multiline source={source} label={label} placeholder={value}
                          format={arrayFormatter} parse={arrayParser}
                          validate={validate}/>;
    } else switch (type) {
        case 'BOOLEAN':
            // don't validate required on boolean field (otherwise you can only set it true!
            const boolFormatter = (string) => string ? string === 'true' : false;
            const boolParser = (bool) => bool ? 'true' : 'false';
            return <BooleanInput source={source} label={label} format={boolFormatter} parse={boolParser}
                                 placeholder={value}/>;

        case 'INTEGER':
        case 'SHORT':
        case 'LONG':
        case 'FLOAT':
        case 'DOUBLE':
            return <NumberInput source={source} label={label} placeholder={value} validate={validate}/>;

        case 'PASSWORD':
            return <TextInput type='password' source={source} label={label} placeholder={value} validate={validate}/>;

        default:
            return <TextInput source={source} label={label} placeholder={value} validate={validate}/>;
    }
};

ConfigEditField.defaultProps = {addLabel: true};


export {ConfigEditField};
