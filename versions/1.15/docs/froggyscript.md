FroggyScript is a feature of froggyOS that allows you to write programs in a simple, easy-to-understand language. It's designed to be very modular, so you can easily extend its functionality.
# FroggyScript Documentation
## Notes
* `[argument=default_value]` denotes a default argument value
* `:[character]` denotes a specific type input
    * `T` - placeholder; used in documentation **only** to show that the type should be specified
    * `*` - any type
    * `S` - String
    * `N` - Number
    * `B` - Boolean
    * `A` - Array
    * `R` - Identifier Reference
    * `U` - Undefined
* error position is unreliable
* error lines are not always accurate ??? whyyy idk 
* After a keyword, you must used `,` to separate arguments. ex. `ask %name , "?"`. The whitespace around the comma is not required, but is recommended for readability.

## General Utilities
### Comments
```
## comment!
str test = "hello" ## this is a comment
```
### Prematurely End the Program
```
endprog
```
### Wait
```
wait [time]

wait 1000
wait number
```
### Clear Screen
```
clearterminal
```
### Preset Variables
These variables are immutable.
```
Pi:N - 3.141592653589793
ProgramName:S - name of the current program
```
<!-- Time_MsEpoch:N - time since epoch (January 1, 1970) in milliseconds
Time_OSRuntime:N - OS uptime in milliseconds
Time_ProgramRuntime:N - program uptime in milliseconds
Undefined:U - undefined -->
## Identifier References
To pass a reference to a variable, prefix the name with the `%` symbol. This is useful for getting variable names, like in the `ask` or `prompt` keywords.
## Calculation
To perform mathematical operations, you must surround the expression with `{}`. You cannot perform string comparison using calculations, use the `>eq` method instead. You may use variables inside of calculations, but you cannot use methods.
```
num i = 5
num j = 10

out {i + j} ## outputs 15

out i + j ## outputs 5
```
These are the valid operators in calculations:
* `+` - addition
* `-` - subtraction
* `*` - multiplication
* `/` - division
* `^` - exponentiation
* ` == ` - equality
* ` != ` - inequality
* ` < ` - less than
* ` > ` - greater than
* ` <= ` - less than or equal to
* ` >= ` - greater than or equal to
The whitespace around the comparison operators is **required**.
## Oneliners
The `.` (oneliner) operator is used to perform methods without needing to use another keyword.
```
rect rectangle = $0, 0, 20, 20$
do rectangle>render
```
## Variables
### Create a Variable
#### String
Make a variable immutable by prefixing the keyword with `c` (ex. `cstr`).
```
str [variable name] = [value]

str test = 'single'
str test = "double"
str test = "multiple words"

-- string literals
num age = 20
str output = "i am $|age| years old"
```
#### Number
```
num [variable name] = [value]

num i = 9
```
#### Boolean
```
bln [variable name] = [value]

bln test = true
```
#### Array
* Indexing starts at `0`.
* To create an empty array, do `arr [variable_name] = $ $`.
```
arr [variable name] = $[value], [value], ...$

arr test1 = $1, 2, 3, 4, 5$
arr test2 = $"a", "b", "c", "d", "e"$
arr test3 = $"a", 1, true, 2.5, "b"$
```

### Edit a Variable
You may only edit a variable if the value is of the same type.
```
set [variable name] = [value]

num i = 5
str test = "text"

set test = "many word"
set i = i + 1

set i = test ## typeError
```
You can also use the `<` (reflexive) operator and a variable reference to set a value to itself.
```
str string = "hello, "
<%string>append("world!")
## "hello, world!"
```
### Delete a Variable
```
free [variable name:R]

free %test
```

## Output
### Basic Output
```
out [argument:S|B|N]

out variable_name
out "text"
out "more text"
out 1
out false
```
Outputting a string with length 0 will result in `(Empty String)` being outputted. To output a blank line, use `out EmptyLine`.
```
out "" ## outputs (Empty String)
out EmptyLine ## outputs a blank line
```
### Formatted Output
#### General
* index `0` is the 1st character.
* There is less than normal error checking on formatting, so make sure it's correct.
```
outf [format],[text]

outf "t=c01" , "this is blue text"
outf "b=c00" , "this is a black background"
outf "t=c06, b=c01" , "this is brown text on a blue background"
outf "t=c01, tr=0-21" , "from char 0 to char 21, the text will be blue" 
outf "t=c01, tr=4-48 | b=c04, br=57-91" , "from the char 4 to char 48, the text will be blue. AND from char 57 to char 91 the background will be red"
```
#### Formatting
* **rules** are delimited by the pipe operator: `{[property]=[value] | [property]=[value], [property]=[value]}`
* **subrules** are delimited by the comma operator, and occur inside of **rules**: `{[property]=[value],[property]=[value]}`
    * If a range is not specified, it will apply to the entire string
    * The value for Italic is `1` to be enabled, and `0` to be disabled
* valid properties:
    * `t` - text color
    * `b` - background color
    * `i` - italic
    * `tr` - text color range
    * `br` - background color range
    * `ir` - italic range
### Error
Errors do not end the program early, follow with the `endprog` keyword to do so. Severy is a number from `0` to `6`, with `0` being the least severe and `6` being the most severe. The text appears in the path section of the terminal line, and the message appears in the text section of the terminal line.
```
error [severity:N] [text:S] [message:S]

error 0 , "error", "this is an error message"

-- test program
error 0 , "error", "this is an error message"
out "hello world!"
endprog

-- when ran
C:/Home> st [program name]
error - this is an error message
hello world!
C:/Home>
```
## Input
### Define a File Argument
File arguments are passed in the terminal when running the program. The order they are defined will determine the order that they are passed in the terminal. You cannot use spaces in file arguments. The `filearg` keyword will replace itself with the line `set [variable name] = "[input]">coerce("[variable type]")` after the input is received.
```
filearg [variable name:R]

## default usage
str name = ""
num age = 0
filearg %name
filearg %age
out "hello I am $|Filearg_name| and I am $|Filearg_age| years old"

## when running the program
C:/Home> st [program name] [arg1] [arg2]
C:/Home> st [program name] froggy 7
 hello I am froggy and I am 7 years old
```
### Typeable Input
The `ask` keyword will not create a new variable and cannot overwrite other variable values, even if that variable is mutable. After input, the interpreter will replace the `ask` keyword line with `set [variable name] = "[input]">coerce("[variable type]")`.
```
ask [variable:R],[prefix:S]

ask %name , "?"

## different line
str name = ""
out "What is your name?"
ask %name , "?"
out 'Hello $|name|!'

## same line
str name = ""
ask %name , "What is your name?"
out 'Hello $|name|!'

## in the terminal, different line
C:/Home> st [program name]
What is your name?
? Froggy
 Hello Froggy!

## in the terminal, same line
C:/Home> st [program name]
What is your name? Froggy
 Hello Froggy!
```

### Input with Navigable Options
```
prompt [variable:R] , [default highlighted option:N] , [options:A]

str output = ''
prompt %output , 0 , $'hello', "world!", "I am froggy!"$
```
## Methods
If no arguments are passed, you may omit the parentheses. Arguments are separated by `,`.
### Multipule Types
#### coerce
Converts a variable to a different type. The type must be one of the following: `String`, `Number`, `Boolean`.
##### String → Number
```
out "42">coerce("Number")
## 42

out "not a number">coerce("Number")
## TypeError
```
##### String → Boolean
```
out "true">coerce("Boolean")
## true

out "false">coerce("Boolean")
## false

out "not a boolean">coerce("Boolean")
## TypeError
```
##### String → String
```
out "hello">coerce("String")
## "hello"
```
##### Number → String
```
out 42>coerce("String")
## "42"
```
##### Number → Boolean
```
out 123>coerce("Boolean")
## true

out 1>coerce("Boolean")
## true

out 0>coerce("Boolean")
## false

out -1>coerce("Boolean")
## false

out -123>coerce("Boolean")
## false
```
##### Number → Number
```
out 42>coerce("Number")
## 42
```
##### Boolean → String
```
out true>coerce("String")
## "true"

out false>coerce("String")
## "false"
```
##### Boolean → Number
```
out true>coerce("Number")
## 1

out false>coerce("Number")
## 0
```
##### Boolean → Boolean
```
out true>coerce("Boolean")
## true
```
#### type
Returns the type of the variable as a string.
```
str string = "hello"
out string>type
## "String"

num number = 5
out number>type
## "Number"

bln boolean = true
out boolean>type
## "Boolean"

arr array = $1, 2, 3, 4, 5$
out array>type
## "Array"
```
### String
#### eq
Tests if two strings are equal.
```
str test = "hello"
str test2 = "hello"
out test>eq(test2)
```
#### neq
Tests if two strings are not equal.
```
str test = "hello"
str test2 = "world"
out test>neq(test2)
```
#### append
Adds a string to the end of another string.
```
str test = "hello"
str test2 = " world"
out test>append(test2)
## "hello world"
```
#### length
Returns the length of a string.
```
str test = "this is a long string"
out test>length
## 22
```
#### repeat
Repeats a string a certain number of times.
```
str test = "hello"
out test>repeat(5)
## "hellohellohellohellohello"
```
### Number
#### abs
Returns the absolute value of a number.
```
num test = -5
out test>abs
## 5
```
#### truncate
Truncates a number to the nearest place value. Default is `0`.
```
out 5.5>truncate
## 5

out 5.5>truncate(1)
## 5.5

out 3.1203>truncate(3)
## 3.12

out 54.291>truncate(3)
## 54.291
```
#### round
Rounds a number to the nearest integer.
```
out 10.203>round
## 10
```
#### mod
Returns the modulus of a number.
```
out 10>mod(3)
## 1
```
#### inc
Increments a number by `1`.
```
out 1>inc
## 2
```
#### dec
Decrements a number by `1`.
```
out 5>dec
## 4
```

#### add
Adds two numbers together.
```
out 5>add(10)
## 15
```
#### sub
Subtracts two numbers.
```
out 10>sub(5)
## 5
```
#### mul
Multiplies two numbers.
```
out 5>mul(10)
## 50
```
#### div
Divides two numbers.
```
out 10>div(5)
## 2

out 10>div(0)
## Infinity
```
### Boolean
#### flip
Flips a boolean value.
```
bln test = true
out test>flip
## false
```
### Array
#### append
Adds a value to the end of an array.
```
arr test = $1, 2, 3, 4, 5$
out test>append(6)
## $1, 2, 3, 4, 5, 6$
```
#### join
Joins an array into a string. Default delimiter is `,`.
```
arr test = $1, 2, 3, 4, 5$
out test>join
## "1,2,3,4,5"

arr test2 = $1, 2, 3, 4, 5$
out test2>join(" and ")
## "1 and 2 and 3 and 4 and 5"
```
#### length
Returns the length of an array.
```
arr test = $1, 2, 3, 4, 5$
out test>length
## 5
```
#### index
Returns the value at a specific index.
```
arr test = $1, 2, 3, 4, 5$
out test>index(2)
## 3
```
## Functions
### Create a Function
#### No Arguments
```
func [func name]()
    [code]
endfunc

func name()
    out "hello"
endfunc
```
#### Arguments
```
func [func name]([arg1:T],[arg2:T],...,[argN:T])
    [code]
endfunc

func name(str:S)
    out "hello $|str|!"
endfunc
```
#### Return Values
If the *last parsed token* in a function is `return`, you can retrieve that value for use. `![function name]` will resolve as the return value of the specified function, and then discard the return value.
```
func name()
    return 5
endfunc

call @name()
num i = !name ## i = 5
out !name ## ReferenceError, value was already returned
```
### Call a Function
#### No Arguments
Currently they do require the parenthesis but i wanna make it not
```
call @[func name]()

call @name()
```
#### Arguments
```
call @[func name]([arg1],[arg2],...,[argN])

call @name("hello","world!")
```

## Control Flow
### If Statement
```
if [condition]  
    [code]
endif

if variable_name>eq('value')
    set variable_name = 'new value'
endif

if [condition]
    [if true]
else
    [if false]
endif

if {variable_name == 4}
    out "something"
else
    out "something else"
endif
```

### Loops
#### Standard Loop
When the `loop` keyword is read, if the condition is true, the code will continue. If it is false, the interpreter will skip the line after the next matching `endloop` keyword and the code inside will not be run. When an `endloop` keyword is read, the interpreter will move to the matching `loop` keyword.
```
loop [condition:N|B]
    [code]
endloop

## Boolean condition
loop {i < 5}
    out i
    set i = {i + 1}
endloop

## Number condition
loop 10
    out "hello"
endloop
## will output "hello" 10 times

num i = 0
num j = 0
num number = 0
loop {i < 5}
    loop {j < 4}
        set number = {number + 1}
        set j = {j + 1}
    endloop
    set i = {i + 1}
    set j = 0
endloop
```

#### Quickloop
Quickloops are different from standard loops in that the entire loop is executed *almost instantly*, while standard loops are executed one line at a time.
```
quickloop [condition:N|B]
    [code]
endquickloop

## Boolean condition
quickloop {i < 5}
    out i
    set i = {i + 1}
endquickloop

## Number condition
quickloop 100
    out "hello"
endquickloop
## outputs "hello" 100 times in a row
```
## Program Data
### Saving Data
Saves the contents of `[variable]` to the corresponding file in the `Config:/program_data` file. The key cannot contain spaces.
```
savedata [key:S] [variable:R]
```

### Loading Data
From the corresponding `Config:/program_data` file, loads the contents of entry of `[variable]` to the variable called `[variable]`
```
loaddata [key:S] [variable:R]
```
## Imports
Imports are a way to extend the functionality of FroggyScript. Imports must be defined at the top of the file.
### Import a Module
```
import [import name:S]

import "graphics"
```
### Imports List & Documentation
To get a formatted version of the documentation, append `https://rus1130.github.io/projects/mdparser.html?toc=true&url=` to the start of the URL.
* [graphics](graphics.md)
* [config](config.md) (currently not implemented)
### Publish an Import
* To publish an import so every froggyOS user can use it, send an email to `froggyoscom+import@gmail.com` with a `.js` file of the import and a `.md` file with the documentation.
# Technical Information
## Types of Errors
### In-Operating System Errors
* `TypeError` - The type of a variable is not what was expected.
* `SyntaxError` - The syntax of the code is not valid.
* `ReferenceError` - The thing that was referenced is not defined, not accessible, or cannot be changed.
* `CalculationError` - The calculation could not be performed.
* `EvaluationError` - The evaluation of a token failed.
* `ImportError` - Import could not be loaded, or was already loaded.
* `RangeError` - The range of a value is out of its expected bounds.
* `StateError` - The least specific error type. The program is not in a valid state to proceed.
### Out-of-Operating System Errors
These are errors that are caused by bad JavaScript introduced by the user.
* `TokenizatorError` - The tokenizer could not tokenize. Most likely caused by no Keywords being found.
* `MethodParseError` - Token is undefined after parsing methods. Most likely caused by a method having no return value.
<!--
overhaul inclusions in translation descriptors
[T#:{value}]
# = number
this allows for multiple inclusions per descriptor
-->