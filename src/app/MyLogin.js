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
import {withStyles} from '@material-ui/core/styles';
import {Login} from 'ra-ui-materialui';
import RememberMeLoginForm from './RememberMeLoginForm';

const loginStyles = theme => ({
    main: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '1px',
        alignItems: 'center',
        justifyContent: 'flex-start',
        // background: 'url(https://source.unsplash.com/random/1600x900)',
        // wow! it's hard to add gradient _only_ on the background image
        // https://stackoverflow.com/questions/4183948/css-set-background-image-with-opacity#10849233
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%), url(/paremus-logo-large.jpg)",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    card: {
        opacity: '1.0',
        minWidth: 300,
        marginTop: '6em',
    },
    avatar: {
        margin: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        backgroundColor: theme.palette.secondary[500],
    },
});

const MyLogin = ({classes, ...props}) => (
    <Login backgroundImage='' classes={classes} {...props} >
        <RememberMeLoginForm/>
    </Login>
);

export default withStyles(loginStyles)(MyLogin);
