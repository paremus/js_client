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

/*
 * Copied from node_modules/ra-ui-materialui/src/auth/LoginForm.tsx
 * to add "RememberMe" check-box.
 */
import * as React from 'react';
import {FunctionComponent} from 'react';
import * as PropTypes from 'prop-types';
import {Field, Form} from 'react-final-form';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {useTranslate, useLogin, useNotify, useSafeSetState} from 'ra-core';
import {BooleanInput} from 'react-admin';

interface Props {
    redirectTo?: string;
}

interface FormData {
    username: string;
    password: string;
}

const useStyles = makeStyles((theme: Theme) => ({
    form: {
        padding: '0 1em 1em 1em',
    },
    input: {
        marginTop: '1em',
    },
    button: {
        width: '100%',
    },
    icon: {
        marginRight: theme.spacing(1),
    },
}));

const Input = ({
                   meta: {touched, error}, // eslint-disable-line react/prop-types
                   input: inputProps, // eslint-disable-line react/prop-types
                   ...props
               }) => (
    <TextField
        error={!!(touched && error)}
        helperText={touched && error}
        {...inputProps}
        {...props}
        fullWidth
    />
);

const LoginForm: FunctionComponent<Props> = ({redirectTo}) => {
    const [loading, setLoading] = useSafeSetState(false);
    const login = useLogin();
    const translate = useTranslate();
    const notify = useNotify();
    const classes = useStyles({});

    const validate = (values: FormData) => {
        const errors = {username: undefined, password: undefined};

        if (!values.username) {
            errors.username = translate('ra.validation.required');
        }
        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        return errors;
    };

    const submit = values => {
        setLoading(true);
        login(values, redirectTo)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                notify(
                    typeof error === 'string'
                        ? error
                        : typeof error === 'undefined' || !error.message
                        ? 'ra.auth.sign_in_error'
                        : error.message,
                    'warning'
                );
            });
    };

    return (
        <Form
            onSubmit={submit}
            validate={validate}
            render={({handleSubmit}) => (
                <form onSubmit={handleSubmit} noValidate>
                    <div className={classes.form}>
                        <div className={classes.input}>
                            <Field
                                autoFocus
                                id="username"
                                name="username"
                                component={Input}
                                label={translate('ra.auth.username')}
                                disabled={loading}
                            />
                        </div>
                        <div className={classes.input}>
                            <Field
                                id="password"
                                name="password"
                                component={Input}
                                label={translate('ra.auth.password')}
                                type="password"
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>
                        <div className={classes.input}>
                            <BooleanInput label="Remember Me" source="rememberMe"/>
                        </div>
                    </div>
                    <CardActions>
                        <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            className={classes.button}
                        >
                            {loading && (
                                <CircularProgress
                                    className={classes.icon}
                                    size={18}
                                    thickness={2}
                                />
                            )}
                            {translate('ra.auth.sign_in')}
                        </Button>
                    </CardActions>
                </form>
            )}
        />
    );
};

LoginForm.propTypes = {
    redirectTo: PropTypes.string,
};

export default LoginForm;
