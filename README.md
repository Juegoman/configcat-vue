# ConfigCat SDK for Vue.js frontend applications

Adds Vue.js plugin to connect to ConfigCat

Currently only `auto` and `manual` fetching modes are functional

## Usage

```js
import Vue from 'vue';
import ConfigcatVue from 'configcat-vue';
const sdkKey = 'abc/123'; // SDK key from configcat
const mode = null; // optional, defaults to 'auto', can be 'manual' too
const opts = {}; // also optional, this is the regular configcat options object

Vue.use(ConfigcatVue, { SDK_KEY: sdkKey, POLLING_MODE: mode, options: opts });
```

```vue
<template>
    <div>
        <div v-feature-flag="'myAwesomeFeatureFlag'">
            if feature flag "myAwesomeFeatureFlag" is on, then this element will be visible
        </div>
        <div v-if="otherFlag">ogey</div>
        <div v-if="myOGConfigCatFlag">rrat</div>
        <button @click="forceCCRefresh">Force configcat refresh</button>
    </div>
</template>
<script>
export default {
    data() {
        return {
            myOGConfigCatFlag: false,
        }
    },
    computed: {
        /*
            you can access the currently cached feature flag values
            by calling this.$configcat.getCachedValue()
        */
        otherFlag() {
            this.$configcat.getCachedValue('myOtherFeatureFlag', false);
        },
    },
    methods: {
        /*
            configcat client is accessible through the this.$configcat.client property
        */
        forceCCRefresh() {
          this.$configcat.client.forceRefreshAsync();  
        },
    },
    async mounted() {
        /*
            this.$configcat.getValue() passes the key and the default value
            into the configcat client getValueAsync() method
        */
        this.myOGConfigCatFlag = await this.$configcat.getValue('myOGConfigCatFlag', false)
    },
};
</script>
```

## `v-feature-flag` directive
if the feature flag string passed into the directive is false then sets `display: none` on the element

assumes default value of `false`

## `$configcat` interface
| property | description |
|---|---|
| `client` | current instantiated configcat client |
| `user` | configcat user object |
| `getCachedValue(key, defaultValue)` | get currently cached feature flag |
| `async getValue(key, defaultValue)` | get feature flag, potentially refreshing the feature flags state from configcat |
| `setUser({ identifier, email, country, custom })` | set the currently stored user object to send to configcat |


#Original README

https://configcat.com

ConfigCat SDK for JavaScript provides easy integration for your application to ConfigCat.

## About

Manage features and change your software configuration using <a href="https://configcat.com" target="_blank">ConfigCat feature flags</a>
, without the need to re-deploy code. A <a href="https://app.configcat.com" target="_blank">10 minute trainable Dashboard</a> 
allows even non-technical team members to manage features directly. Deploy anytime, release when confident. 
Target a specific group of users first with new ideas. Supports A/B/n testing and soft launching.

ConfigCat is a <a href="https://configcat.com" target="_blank">hosted feature flag service</a>. Manage feature toggles across frontend, backend, mobile, desktop apps. <a href="https://configcat.com" target="_blank">Alternative to LaunchDarkly</a>. Management app + feature flag SDKs.

[![Build Status](https://travis-ci.com/configcat/js-sdk.svg?branch=master)](https://travis-ci.com/configcat/js-sdk) 
[![codecov](https://codecov.io/gh/configcat/js-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/configcat/js-sdk) 
[![Known Vulnerabilities](https://snyk.io/test/github/configcat/js-sdk/badge.svg?targetFile=package.json)](https://snyk.io/test/github/configcat/js-sdk?targetFile=package.json) 
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=configcat_js-sdk&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=configcat_js-sdk) 
[![Tree Shaking](https://badgen.net/bundlephobia/tree-shaking/configcat-js)](https://bundlephobia.com/result?p=configcat-js) 
![License](https://img.shields.io/github/license/configcat/js-sdk.svg) 
[![](https://data.jsdelivr.com/v1/package/npm/configcat-js/badge)](https://www.jsdelivr.com/package/npm/configcat-js)
[![NPM](https://nodei.co/npm/configcat-js.png)](https://nodei.co/npm/configcat-js/)

## Getting Started

### 1. Install and import package:

*via NPM [package](https://npmjs.com/package/configcat-js):*
```PowerShell
npm i configcat-js
```
```js
import * as configcat from "configcat-js";
```

*via CDN:*
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/configcat-js@latest/dist/configcat.min.js"></script>
```

### 2. Go to the <a href="https://app.configcat.com/sdkkey" target="_blank">Dashboard</a> to get your *SDK Key*:
![SDK-KEY](https://raw.githubusercontent.com/ConfigCat/js-sdk/master/media/readme01.png  "SDK-KEY")

### 3. Create a *ConfigCat* client instance:
```js
var configCatClient = configcat.createClient("#YOUR-SDK-KEY#");
```
> We strongly recommend using the *ConfigCat Client* as a Singleton object in your application.

### 4. Get your setting value:
The Promise (async/await) way:
```js
configCatClient.getValueAsync("isMyAwesomeFeatureEnabled", false)
.then((value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```
or the Callback way:
```js
configCatClient.getValue("isMyAwesomeFeatureEnabled", false, (value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```

## Getting user specific setting values with Targeting
Using this feature, you will be able to get different setting values for different users in your application by passing a `User Object` to `getValue()` or `getValueAsync()`.

Read more about [Targeting here](https://configcat.com/docs/advanced/targeting/).
```js
const userObject = { identifier : "#USER-IDENTIFIER#" };
configCatClient.getValueAsync("isMyAwesomeFeatureEnabled", false, userObject)
.then((value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```

## Sample/Demo apps
  - [Angular 2+](https://github.com/configcat/js-sdk/tree/master/samples/angular-sample)
  - [React](https://github.com/configcat/js-sdk/tree/master/samples/react-sample)
  - [Pure HTML + JS](https://github.com/configcat/js-sdk/tree/master/samples/html)

## Polling Modes
The ConfigCat SDK supports 3 different polling mechanisms to acquire the setting values from ConfigCat. After latest setting values are downloaded, they are stored in the internal cache then all requests are served from there. Read more about Polling Modes and how to use them at [ConfigCat Docs](https://configcat.com/docs/sdk-reference/js/).

## Need help?
https://configcat.com/support

## Contributing
Contributions are welcome.

## About ConfigCat
- [Official ConfigCat SDK's for other platforms](https://github.com/configcat)
- [Documentation](https://configcat.com/docs)
- [Blog](https://blog.configcat.com)

## Troubleshooting

`XMLHttpRequest module not defined/found`:

Since the `configcat-js` SDK needs to download the feature flag and setting values from ConfigCat's servers via a HTTP GET request. The SDK uses `XMLHttpRequest` a built in object in all browsers. This way the package size is smaller instead of using a 3rd party library. The error above can appear in cases when the `configcat-js` SDK is used within a SSR (Server-Side Rendering) Universal application. In these cases we recommend using [configcat-node](https://github.com/configcat/js-ssr-sdk) [configcat-node](https://github.com/configcat/node-sdk) .
