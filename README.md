# Things to Know

 * in paths, `.` will be replaced with the current directory
 * programs can *only* be written in designated directories

## Palette Conventions
There is no set colors that you must have, but these are the color conventions.
 * 00 - black, the void surrounding the terminal
 * 01 - blue, the top bar background color
 * 02 - green, text color, as well as selected text and option background color
 * 03 - cyan
 * 04 - red
 * 05 - magenta
 * 06 - orange/brown
 * 07 - light grey
 * 08 - dark grey
 * 09 - light blue
 * 10 - light green
 * 11 - light cyan
 * 12 - light red, error background color
 * 13 - light magenta
 * 14 - light orange/yellow
 * 15 - white, the terminal background color, top bar and error text color, and the selected text and option color

## Aliases

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
 * savestate -> svs
 * spawn -> s
 * swimto -> st

## Bugs
 * ~~cannot call functions inside of functions. This is because functions are parsed by the formatter instead of the parser. This is because it was easier to do than implementing an isolated parser that has the variables from the other, parent parser~~
 * ~~something with `if` statements???? check it out later~~
    * `if` keywords work correctly now, but `else` might not work as expected.
 * load state doesnt work with palettes
 * ~~the inserted `wait` keywords may be messing loops sometimes~~
    * `wait` keywords were being inserted before every `endloop` command, which stacked. Turns out the `wait` keyword was not necessary, so it was removed.
 * There's some weird stuff going on with `append`. Fix later.

## Command Help

### formattime
The first instance of the follow characters will be replaced with their respective values. Place a "!" before the character to escape it.
 * w - weekday
 * d - day
 * M - month
 * y - year
 * h - hour (24 hour)
 * H - hour (12 hour)
 * m - minute
 * s - second
 * a - AM/PM

### hop
 * `hop ~` will take you to the root directory
 * `hop -` will take you to the previous directory

### metaprop
Properties:
 * read - If this file can be read. This includes being able to run the program or list file contents with the `spy` command.
 * write - If this file can be written to. This includes being able to edit the file or delete it.
 * hidden - If this file is hidden. This will *not* prevent you from editing the file.

## Macros

 * Macros are written in the `D:/Macros` directory
 * each line in a macro file is a command that will be executed
 * to add an alias to a macro, the **first** line must be `![alias]`. You can add only one alias per macro.
 * to use file arguments inside of a macro, use `$[file argument number]`

# FroggyScript Documentation
**Note: spaces are part of syntax, and must be used as shown**

Operators:
* All JavaScript operators are valid

## General Utilities
### End the Program
If this isn't called anywhere, once execution reaches the end of the file, froggyOS **will** brick itself. I could make it *not* do that, but that would be boring.
```
endprog
```
### Comments
```
you can just write if it doesnt start with a keyword
-- or you can (and are recommended to) use the comment keyword just to be safe
```
### Wait
```
wait [time in milliseconds]

wait 1000
wait v:number
```
### Clear Screen
```
clearterminal
```

## Output
### Output
```
out [input]

out v:variable_name
out "text"
out "text with spaces"
out 'more text'
out "i can put a v:variable inside a string"
```
### Colored Output
You can also use variables as values for color codes, variables of length 2 or less will be converted to color codes automatically. There is very little error checking on the formatting objects, so make sure they're correct.
```
outc [format] [text]

outc {t=c01} "this is blue text"
outc {b=c00} "this is a black background"
outc {t=c02,b=c01} "this is green green text on a blue background"
-- not implemented vv
outc {t=c02,ts=0:15} "from the 1st to 16th character, the text will be blue" 
outc {t=c02,ts=4:26|b=c04,bs=57:71} "from the 5th to 29th character, the text will be blue. AND from the 58th to the 72nd character the background will be red" 
```

## Variables
### Create a Variable
```
str [variable_name] = [value]
int [variable_name] = [value]

str test = 'single'
str test = "double"
str test = "multiple words"

int age = 20
str output = "i am v:age years old"
```
### Edit a Variable
```
set [variable_name] = [value]

set test = 5
set test = 'text'
set test = "many word"
set i = v:i + 1
```

### Delete a Variable
```
free v:[variable_name]

free v:test
```
## String Manipulation
### Append
```
append [variable] [value]

append test ing
append test ing the append keyword
append test ' ing it some more'
append test "AND MORE"
append test v:variable
```
## User input
### Define a File Argument
```
filearg [variable_name] [type]
filearg name str
filearg age int
out "hello I am v:name and I am v:age years old"

-- when running the program
C:/Home> st [program_name] [arg1] [arg2]
C:/Home> st about_froggy froggy 7
> hello I am froggy and I am 7 years old
```
### Typeable User Input
```
ask [variable]

ask name

-- example usage
str name = ''
out "What is your name?"
ask name
out 'Hello v:name.'
endprog

-- when running the program
C:/Home> st [program_name]
> What is your name?
? Froggy
> Hello Froggy.
```
### User Input with Navigable Options
```
prompt [default highlighted option] [variable] [...options]

prompt 0 output 0 1 2 3
prompt highlightedOption outputVariable the_options cannot_have spaces_in them
```
## Functions
### Create a Function
```
func [func_name]
    [code]
endfunc

func name
    out "hello"
endfunc
```
### Call a Function
```
f: [func_name]

f: name
```

## Control Flow
### If Statement
```
if {[condition]}
    [code]
endif

if {v:variable_name == "value"}
    set variable_name = 'new value'
endif

if {6 < 7} 
    f: name
endif

if {[condition]}
    [if true]
else
    [if false]
endif

if {v:variable_name == 4}
    f: something
else
    f: somethingElse
endif
```

### Loop
```
loop {[condition]}
    [code]
endloop

loop {v:i < 5}
    out v:i
    set i = v:i + 1
endloop

int i = 0
int j = 0
loop { v:i < 5 }
    loop { v:j < 4 }
        out v:i * v:j
        set j = v:j + 1
    endloop
    set i = v:i + 1
    set j = 0
endloop
```
## Program Data
### Saving Data
Saves the contents of `[variable]` to the corresponding file in the `D:/Program-Data` file
```
savedata [variable]
```
### Loading Data
From the corresponding `D:/Program-Data` file, loads the contents of entry of `[variable]` to the variable called `[variable]`
```
loaddata [variable]
```