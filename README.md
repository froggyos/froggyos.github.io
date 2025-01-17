
# Things to know about froggyOS

 * in paths, "." will be replaced with the current directory
 * programs can *only* be written in designated directories
 * for the `hop` command, `~` will be replaced with the root directory ("C:"), and `-` will be replaced with the previous directory

# Aliases

 * clear -> cl
 * croak -> c
 * formattime -> ft
 * hatch -> ch
 * help -> ?
 * hop -> h
 * list -> ls
 * loadstate -> lds
 * meta -> m
 * metaperm -> mp
 * savestate -> svs
 * spawn -> s
 * swimto -> st

# FroggyScript documentation
**Note: spaces are part of syntax, and must be used as shown**

Operators:
* All JavaScript operators are valid

comments:
```
-- comment
```

output text:
```
out "[input]"

out v:variable_name
out "text"
out "text with spaces"
out 'more text'
out "i can output a v:variable inside a string"
```

function:
```
func [func_name]
    code
endfunc

func name
    code
endfunc
```

define a variable:
```
str [variable_name] = [value]
int [variable_name] = [value]

str test = 'single'
str test = "double"
str test = "multiple words"

int age = 20
str out = "i am v:age years old"
```

define a file argument:
```
define [variable_name] [type]
define name str
define age int
out "hello I am v:name and I am v:age years old"

-- when running the program
C:/Home> st [program_name] [arg1] [arg2]
C:/Home> st profile froggy 7
> hello I am froggy and I am 7 years old
```

edit a variable:
```
set [variable_name] = [value]

set test = 5
set test = 'text'
set test = "many word"
```

call a function:
```
f: [func_name]

f: name
```

end program:
```
endprog
```

define a label:
```
label [label_name]

label start
```

jump to a label:
```
goto [label_name]

goto start
```
control flow:
```
if {[condition]}
    code
endif

if {variable_name == "value"}
    goto start
endif

if {6 < 7} 
    f: name
endif

if {[condition]}
    code_if_true
else
    code_if_false
endif

if {variable_name == "value"}
    goto start
else
    f: name
endif
```
