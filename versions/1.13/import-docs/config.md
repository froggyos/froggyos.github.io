<style>
    .trusted {
        color: red;
        font-weight: bold;
    }
    .trusted::after {
        content: "This is a trusted " attr(type) "!";
    }
</style>
# Info
Introduces a variable called `Config` of type `Config`. You can find the list of valid keys if you input an invalid key. It will be in the error message.

# Config
## Methods
### get
Gets a value from both user and os config.
```
str osVersion = Config>get('version')
```
### oc_set
<span class='trusted' type="method"></span>
Sets an operating system config value. Value input types will vary depending on the key.
```
Config>oc_set('currentPath', 'C:/Random');
```
### uc_set
<span class='trusted' type="method"></span>
Sets a user config value. Value input types will vary depending on the key.
```
Config>uc_set('language', 'jpn');
```
