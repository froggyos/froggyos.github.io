# froggyOS Documentation
FroggyOS is a CLI-based programming operating system that is designed to be simple and easy to use. It is built using HTML, CSS, and JavaScript. It was created to be a fun and educational way to introduce beginners to CLI-based operating systems, as opposed to GUI-based operating systems, like Windows.
## Info
* in paths, `.` will be replaced with the current directory
* programs can *only* be written in designated directories
* you can press the `DEL` key to escape programs (ex. an infinite loop)
* if a FroggyScript program exits with an error, the command `[[BULLFROG]]gotoprogramline [program] [line with error]` will be put into your command history
* file types are inferred based on file location
* For whatever reason, if there is no typeable line in the terminal, press `SHIFT + ENTER` to create a typeable line
### Paths
Paths have three parts, the drive, the directory, and the file name.
```
┌───────────Full Path──────────┐
├─────Location─────┐           │
[drive]:/[directory]/[file name]
```

## Palette Conventions
There are no set colors that you must have, but these are the color conventions.
* `00` - black
* `01` - blue
* `02` - green
* `03` - cyan
* `04` - red
* `05` - magenta
* `06` - orange/brown
* `07` - light grey
* `08` - dark grey
* `09` - light blue
* `10` - light green
* `11` - light cyan
* `12` - light red
* `13` - light magenta
* `14` - light orange/yellow
* `15` - white

### Current Color Palettes
* standard
* revised
* cherry
* swamp
* swamp-revised
* neon

## Aliases
* changelanguage -> lang
* clear -> cl
* clearstate -> cls
* croak -> c
* formattime -> ft
* hatch -> ch
* help -> ?
* hop -> h
* list -> ls
* listdrives -> ld
* loadstate -> lds
* macro -> /
* meta -> m
* metaprop -> mp
* opendocumentation -> docs
* savestate -> svs
* spawn -> s
* swimto -> st

## Translating froggyOS into Different Languages
* The `lbh` file in the `Config:/langs` directory is what holds the indexes for translation. **Do not edit this file unless you deliberately want to mess up froggyOS.**
    * Languages file names are 3 letter abbreviations of the language name.
* To add a new language, clone the `lbh`, or `language build helper` file, which contains **translation descriptors** (prefixed with `T_`), which give you an idea of what the intended meaning of the text.
* Set the language to `lbh` to see which translation descriptors are used where in froggyOS. If there are missing translation descriptors at the end of a file, the English translation will be used.
    * If a language file does not meet requirements (valid name declaration, correct file length), it will be invalid and unable to be used.
* The **name declaration** must be the first line of the file, and must be in the format `!LANGNAME: [language name]`. For example, the name declaration for the `eng` file is `!LANGNAME: English`.
* If the default language is invalid, froggyOS will automatically revert to the `lbh` language file.
* If a text results in `Index Missing! -> [translation descriptor]`, this means that the translation descriptor is missing from the language file.
* Some translation descriptors include `{{}}` in it. These are called **inclusions**. Inclusions allow translations to include dynamic text. For example, if you used `T_greeting_2 {{3 million}}`, it would return in the `eng` translation as `* Welcome to froggyOS, version 3 million *`. You can use as many inclusions as you want. You can also use multiple inclusions in a single translation descriptor, as long as the descriptor can handle that amount of inclusions.

## Bugs
### 1
* error text color does not save properly when running `svs`.
* example program:
```
error 0, 'alert', 'hey look here! read me!'
error 1, 'warning', 'something might be wrong'
error 2, 'error', 'something IS wrong'
error 3, 'important warning', 'something is wrong but its not too bad'
error 4, 'important error', 'something is wrong and it is bad'
error 5, 'critical error', 'something is wrong and it is very bad'
error 6, 'fatal error', 'you curbstomped froggyOS and it is now dead'
```
* steps to reproduce:
    1. run the example program
    2. run `changepalette (any palette)`
    3. run `svs`
    4. reload the page
    5. Result -> text color of the error text should be the same as the normal text color
### 2
* In froggyScript
* In string inclusions, you can sometimes return `undefined` if you mess up syntax inside of the inclusion.
* example program:
```
out 10>repeat('meow')
## will return undefined
```
### 3
* Prompts inside of loops dont work the way they should.
* given an infinite loop, the prompt should be displayed every time the loop runs, but it only displays once.
* example program:
```
str promptVariable = ''
loop true
    out "this will output every loop, but the prompt will only show once"
    prompt %promptVariable, 0, $'hello','goodbye'$
endloop
```
### 4
* example program:
```
str promptVariable = ''
loop true
    out "this will output every loop, but the prompt will only show once"
    prompt %promptVariable, 0, $'hello','goodbye'$
endloop
```
* how to reproduce:
    1. run the example program
    2. interrupt the program with `DEL` and do not complete the prompt
    3. Run the program again, every single method will throw `MethodParseError` and loop will continue without user being able to interrupt
* possible reason:
    * the `load_function()` is not being called properly, or is being wiped
## Command Help
### formattime
The all instances of the following characters (or character sequences) will be replaced with their respective values. Place a `!` before the character to escape it.
#### Date
* weekday
    * `w` - short weekday (Mon, Tues)
    * `W` - long weekday (Monday, Tuesday)
* `y` - year
* month
    * `mn` - month number (01, 02)
    * `mnu` - month number unpadded (1, 2)
    * `ms` - month short (Jan, Feb)
    * `M` - month long (January, February)
* day
    * `d` - day (01, 02)
    * `du` - day unpadded (1, 2)
    * `D` - ordinal day (1st, 2nd)

#### Time
* hour
    * `h` - 24 hour (00, 01, ... 22, 23)
    * `hu` - 24 hour unpadded (0, 1, ... 22, 23)
    * `H` - 12 hour (01, 02, ... 11, 12)
    * `Hu` - 12 hour unpadded (1, 2, ... 11, 12)
* minute
    * `m` - minute (00, 01)
    * `mu` - minute unpadded (0, 1)
* second
    * `s` - second (00, 01)
    * `su` - second unpadded (0, 1)
* `a` - AM/PM
* `z` - timezone

### hop
* `hop ~` will take you to the root directory of the current drive
* `hop -` will take you to the previous directory

### metaprop
Properties:
* read - If this file can be read. This includes being able to run the program or list file contents with the `spy` command.
    * when a file is cloned, this property will be set to `true`.
* write - If this file can be written to. This includes being able to edit the file or delete it.
    * when a file is cloned, this property will be set to `true`.
* hidden - If this file is hidden. This will prevent the file from being acted upon (ie. cannot be edited).
* transparent - This file will not show in the directory or in lists, but can be acted upon (ie. can be edited).
    * when a file is cloned, this property will be set to `false`.

## Macros
* Macros are written in the `D:/Macros` directory
* each line in a macro file is a command that will be executed
* to add an alias to a macro, the **first line must** be `![alias]`. You can add only one alias per macro.
* to use file arguments inside of a macro, use `$[file argument number]` (ex. `$1`)

## Settings Directory
If you edit the `Settings:` drive directly, some settings won't apply until you reload the froggyOS state. An easy way to do this would be to run the `reload` macro.

## Trusting Programs
To trust a program, you must add its file name in the `D:/trusted_files` file. This will allow the program to have extended control over the operating system. Trusted programs are refreshed **only** on hard restarts (reload the page).

## froggyOS Structured Data Storage (fSDS)
fSDS is a way to store key-value pairs in a file. A value can be one of four types: `String`, `Number`, `Boolean`, or `Array`. fSDS is most prominently used to store file data in the `Config:/program_data` directory, but may be used in other places as well. You cannot store arrays inside of arrays.
### Non-Array
```
KEY [key name] TYPE [type (String/Number/Boolean)] VALUE [value] END
```
### Array
```
KEY [key name] TYPE Array START
0 TYPE [type (String/Number/Boolean)] VALUE [value]
1 TYPE [type (String/Number/Boolean)] VALUE [value]
(...)
KEY [key name] TYPE Array END
```
## Lilypad keybinds
Lilypad is the text editor in froggyOS. It has a few keybinds that you can use to make editing easier.
### Saving
* `ESC` - save and exit
* `SHIFT + ESC` - exit without saving

### Navigation
* `ArrowUp` - move cursor up one line
* `ArrowDown` - move cursor down one line

* `Shift + ArrowUp` - move cursor to end of previous line
* `Shift + ArrowDown` - move cursor to beginning of next line

* `CTRL + ArrowUp` - Move to first line
* `CTRL + ArrowDown` - Move to last line

* `ALT + ArrowUp` - Move current line up one line
* `ALT + ArrowDown` - Move current line down one line

* `CTRL + ArrowLeft` - Move to beginning of current line
* `CTRL + ArrowRight` - Move to end of current line

### Selection
* `Shift + ArrowLeft` - select one character to the left
* `Shift + ArrowRight` - select one character to the right

* `CTRL + Shift + ArrowLeft` - select one word to the left
* `CTRL + Shift + ArrowRight` - select one word to the right

* `CTRL + A` - select all text on the current line
### Creation
* `Enter` - insert a new line at the current cursor position
* `Shift + Enter` - create a new line below the current line
* `DEL` - delete current line
### Other
* `CTRL + C` - copy selected text
* `CTRL + X` - cut selected text
* `CTRL + V` - paste text from clipboard
# Technical Information
## Startup Sequence
1. Load any state if it exists from `localStorage`
2. Get the user config from `Config:/user`
3. Set the program list
4. Update date and time
5. Change the color palette
6. Create the color palette bar
7. Set trusted files    
8. Validate current language
Along with the startup sequence, there are two intervals, `configInterval` and `dateTimeInterval`. The `configInterval` updates the user config and program list every 250 milliseconds, while the `dateTimeInterval` updates the date and time every 100 milliseconds.
# FroggyScript
FroggyScript is a programming language used in froggyOS. Documentation [here](./docs/froggyscript.md). To get a formatted version of the documentation, append `https://rus1130.github.io/projects/mdparser.html?toc=true&url=` to the start of the URL.
# Other
If you have any questions, comments, or suggestions, email `froggyoscom+other@gmail.com`. If you have any concerns or found a bug, [open an issue on the GitHub repository](https://github.com/froggyos/froggyos.github.io/issues).