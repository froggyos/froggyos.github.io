# Info
Introduces a variable called `Config` of type `Config`. This variable has access to the froggyOS config via the `>get()` method.

# Config
## Methods
### get
Gets a value from the config. Valid keys:
 * language - returns String
 * colorPalette - returns String
 * version - returns String
 * showSpinner - returns Boolean
 * currentSpinner - returns String
 * defaultSpinner - returns String
 * timeFormat - returns String
 * updateStatBar - returns Boolean
 * allowedProgramDirectories - returns Array of Strings
 * dissallowSubdirectoriesIn - returns Array of Strings
 * validateLanguageOnStartup - returns Boolean
 * currentPath - returns String
 * spinnerIndex - returns Number
 * programList - returns Array of Strings
 * programSession - returns Number
```
str osVersion = Config>get('version')
```