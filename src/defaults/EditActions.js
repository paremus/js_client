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

import React from "react";
import {
    ListButton,
    ShowButton,
    TopToolbar
} from "react-admin";

const EditActions = ({basePath, className, data, hasList, hasShow, resource}) => (
    <TopToolbar className={className}>
        {hasList && <ListButton basePath={basePath}/>}
        {hasShow && <ShowButton basePath={basePath} record={data}/>}
    </TopToolbar>
);

export default EditActions;