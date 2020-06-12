# The Paremus JS Client Repository

This repository contains a skeleton Javascript UI that works with the REST server implemented by `com.paremus.ui`. It is based on the react-admin framework: https://marmelab.com/react-admin/.

## How to build this repository

This repository can be built using `yarn` and `node` 12+.

It also contains a Maven `pom.xml`, so that the UI `build` output can be deployed to a Maven repository as artefact `js_client-1.0.0-build.tar.gz` where it can be served by the UI server.

### Toolchain installation

`yarn` and `node` can be installed using `nvm`: https://github.com/nvm-sh/nvm

```
$ nvm install 12
$ npm install --global yarn
```

### Production build

```
yarn install
yarn build
```

This creates a production build (in `./build`).

### Development build

```
yarn install
yarn dev
^C
```

This creates a watched development build (in `./build-dev`). Terminate it with `^C`.

### Live testing

The Paremus UI server can serve the live development js_client (instead of the deployed production artefact), by setting the following property in `com.paremus.ui.rest.app/app.bndrun` to reference the `build-dev` directory in this project:

```
-Dcom.paremus.ui.client.dir=${.}/../../js-client/build-dev
```

## end

