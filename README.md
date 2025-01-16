
# Things to know about froggyOS

 * in paths, "." will be replaced with the current directory
 * programs can *only* be written in the C:/Programs directory
 * for the `hop` command, `~` will be replaced with the root directory ("C:"), and `-` will be replaced with the previous directory

# Aliases

 * clear -> cl
 * croak -> c
 * formattime -> ft
 * hatch -> ch
 * help -> ?
 * hop -> h
 * list -> ls
 * meta -> m
 * spawn -> s
 * swimto -> st

# FroggyScript documentation
**Note: spaces are part of syntax, and must be used as shown**

output text:
```
out [input]
out text
out text with spaces
out v:variable_name
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

str test = single_word
str test = multiple words
int test = 5
```

edit a variable:
```
set [variable_name] = [value]

set test = 5
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
```
