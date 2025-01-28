# Things to know about froggyOS

 * in paths, `.` will be replaced with the current directory
 * programs can *only* be written in designated directories
 * for the `hop` command, `~` will be replaced with the root directory ("C:"), and `-` will be replaced with the previous directory

# Aliases

 * clear -> cl
 * clearstate -> cls
 * croak -> c
 * formattime -> ft
 * hatch -> ch
 * help -> ?
 * hop -> h
 * list -> ls
 * loadstate -> lds
 * macro -> /
 * meta -> m
 * savestate -> svs
 * spawn -> s
 * swimto -> st

# Macros

 * Macros are written in the `C:/Macros` directory
 * each line in a macro file is a command that will be executed
 * to add an alias to a macro, the **first** line must be `![alias]`. You can add only one alias per macro.
 * to use file arguments inside of a macro, use `$[file argument number]`

# FroggyScript documentation
**Note: spaces are part of syntax, and must be used as shown**

Operators:
* All JavaScript operators are valid

## General Utilities
### End Program
```
endprog
```
### Comments
```
-- comment
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
```
out [input]

out v:variable_name
out "text"
out "text with spaces"
out 'more text'
out "i can put a v:variable inside a string"
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

append test 'ing'
append test "ing"
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
==================================== do this lol
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
### If Statements
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

### Loops
There may be a maximum loop count of 543.
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