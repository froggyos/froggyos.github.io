
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

out - output text to the console
to output the contents of a variable, prefix the variable name with "v:"
```
out text
out text with spaces
out v:variable_name
```

function:
```
func func_name
    code
endfunc
```

define a variable:
 - i - integer
 - s - string
```
var variable_name:type = value
```

call a function:
```
f: func_name
```

end program:
```
endprog
```

[comment]: <> (goto a line number:)
[comment]: <> (if you jump into the middle of a function, an error will be thrown and the program will close)
[comment]: <> (```)
[comment]: <> (goto line_number)
[comment]: <> (```)
[comment]: <> ()
[comment]: <> (if goto statement:)
[comment]: <> (```)
[comment]: <> (if condition goto line_number)
[comment]: <> (```)
