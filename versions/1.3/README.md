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

## General Stuff
### Comments
```
-- comment
```
### end program
```
endprog
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

## Variable
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
> Froggy
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
    code
endfunc

func name
    code
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
    code
endif

if {v:variable_name == "value"}
    set variable_name = 'new value'
endif

if {6 < 7} 
    f: name
endif

if {[condition]}
    code_if_true
else
    code_if_false
endif

if {v:variable_name == 4}
    set variable_name = 7
else
    f: name
endif
```