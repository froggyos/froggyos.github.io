# Info
(0,0) is in the top left corner of the screen. Maximum displayable x is 79 and maximum displayable y is 58.
# Keywords
## createscreen
Adds a screen to the terminal line.
```
createscreen [width:N],[height:N]
createscreen 78, 57
```
## rect
Creates a variable of type Rect.
```
rect [name] = $[x:N], [y:N], [width:N], [height:N]$

rect rectangle = $0, 0, 20, 20$
```
## text
Creates a variable of type Text. `x` and `y` is where the first character of the text will be drawn.
```
text [name] = $[x:N], [y:N], [text:S]$

text txt = $0, 0, 'Hello World'$
```
## line
Creates a variable of type Line. `x1` and `y1` is the starting point of the line, and `x2` and `y2` is the ending point of the line.
```
line [name] = $[x1:N], [y1:N], [x2:N], [y2:N]$

line ln = $0, 0, 20, 20$
```
## pixel
Creates a variable of type Pixel, which is a reference to a specific pixel on the screen. `x` and `y` is the position of the pixel.
```
pxl [name] = $[x:N], [y:N]$

pxl pixel = $0, 0$
```
You can also set `pxl` to another pixel, instead of an array.
```
line line1 = $0, 0, 10, 10$
line line2 = $0, 10, 10, 0$
pxl pixel = line1>intersection(line2)
out pixel>toString ## '(5,5)'
```
# Methods
## rect
### add
Adds the object to the screen.
```
.rectangle>add
```
### remove
Removes the object from the screen.
```
.rectangle>remove
```
### move
Macro for `>x()>y()`.
```
>move([x], [y])

.rectangle>move(10, 10)
```
### size
Macro for `>width()>height()`.
```
>size([width], [height])

.rectangle>size(10, 10)
```
### clone
Creates a clone of the rectangle object. The clone will have the same properties as the original rectangle object, but will not be linked to it. This means that changes made to the clone will not affect the original rectangle object, and vice versa. You still must use `>add` to add the clone to the screen.
```
rect rectangle = $0, 0, 50, 50$
rect clone = rectangle>clone
.clone>add>move(10, 10)
## does not affect the original rectangle object
```
### overlaps
Checks if a rectangle overlaps with another rectangle. Returns Boolean.
```
rect rectangle1 = $0, 0, 10, 10$
rect rectangle2 = $5, 5, 10, 10$
.rectangle1>overlaps(rectangle2) ## true
```
### Getters and Setters
* `>x` - x position of the rectangle
* `>y` - y position of the rectangle
* `>width` - width of the rectangle
* `>height` - height of the rectangle
* `>fill` - fill color of the rectangle
* `>stroke` - stroke color of the rectangle
## text
### add
Adds the object to the screen.
```
.txt>add
```
### remove
Removes the object from the screen.
```
.txt>remove
```
### move
Macro for `>x()>y()`.
```
>move([x], [y])

.txt>move(10, 10)
```
### clone
Creates a clone of the text object. The clone will have the same properties as the original text object, but will not be linked to it. This means that changes made to the clone will not affect the original text object, and vice versa. You still must use `>add` to add the clone to the screen.
```
text txt = $0, 0, 'Hello World'$
text clone = txt>clone
.clone>add>move(10, 10)
## does not affect the original text object
```
### Getters and Setters
* `>x` - x position of the text
* `>y` - y position of the text
* `>width` - width of the text (only if wordwrap is true)
* `>wrap` - whether the text should be wrapped or not (default: false)
* `>color` - color of the text
* `>text` - text to be displayed
## line
### add
Adds the object to the screen.
```
.ln>add
```
### remove
Removes the object from the screen.
```
.ln>remove
```
### cross
Checks if the line crosses another line. Returns Boolean.
```
line line1 = $0, 10, 10, 0$
line line2 = $0, 0, 10, 10$
.out line1>cross(line2) ## true
```
### intersection
Calculates the intersection point of two lines. Returns a Pixel object.
```
line line1 = $0, 0, 50, 50$
line line2 = $10, 10, 50, 50$
pxl intersection = line1>intersection(line2)
out intersection>toString ## '(10,10)'
```
### Getters and Setters
* `>x1` - x position of the first point of the line
* `>y1` - y position of the first point of the line
* `>x2` - x position of the second point of the line
* `>y2` - y position of the second point of the line
* `>stroke` - stroke color of the line

## pixel
### x
Gets the x position of the pixel.
```
pxl pixel = $0, 0$
out pixel>x ## 0
```
### y
Gets the y position of the pixel.
```
pxl pixel = $0, 0$
out pixel>y ## 0
```
### back
Gets the back color of the pixel.
```
pxl pixel = $0, 0$
out pixel>back ## 'c00'
```
### front
Gets the front color of the pixel.
```
pxl pixel = $0, 0$
out pixel>front ## 'c02'
```
### value
Gets the text value of the pixel. Values are a single character.
```
pxl pixel = $0, 0$
out pixel>value ## 'A'
```
### toString
Converts the pixel to a string representation.
```
pxl pixel = $0, 0$
out pixel>toString ## '(0,0)'
```
<!-- ## pixel
Creates a variable of type Pixel.
```
pxl [name] = $[x], [y]$
pxl pixel = $0, 0$
``` -->
<!-- ## text
Creates a variable of type Text. `x` and `y` is where the first character of the text will be drawn.
```
text [name] = $[x], [y], [text]$

text text = $0, 0, 'Hello World'$
``` -->
<!-- ## line
Creates a variable of type Line. `x1` and `y1` is the starting point of the line, and `x2` and `y2` is the ending point of the line.
```
line [name] = $[x1], [y1], [x2], [y2]$

line line = $0, 0, 50, 50$
``` -->

<!-- 
# Pixel
Manipulate individual pixels on the screen.
## Methods
### is
Checks if the pixel is the provided color. Returns Boolean.
```
pxl pixel = $0, 0$
#pixel>is('c00')
```
## Getters and Setters
* `>color` - color of the pixel-->
<!--
# Line
## Methods
### render
Renders the line to the screen.
```
line line = $0, 0, 50, 50$
#line>render
```
### clear
Clears the line from the screen.
```
line line = $0, 0, 50, 50$
#line>clear
```
### cross
Checks if the line crosses another line. Returns Boolean.
```
line line1 = $0, 0, 50, 50$
line line2 = $10, 10, 50, 50$
#line1>cross(line2)
```
### intersection
Calculates the intersection point of two lines. Returns an array of two points $x, y$.
```
let line1 = $0, 0, 50, 50$
let line2 = $10, 10, 50, 50$
#line1>intersection(line2)
```
### clone
Creates a clone of the line object. The clone will have the same properties as the original line object, but will not be linked to it. This means that changes made to the clone will not affect the original line object, and vice versa.
```
line line1 = $0, 0, 50, 50$
line line2 = line1>clone
#line2>render>move(10;10)
```
## Getters and Setters
* `>x1` - x position of the first point of the line
* `>y1` - y position of the first point of the line
* `>x2` - x position of the second point of the line
* `>y2` - y position of the second point of the line
* `>text` - text to be displayed on the line
* `>stroke` - stroke color of the line
* `>color` - text color of the line
```
to add:
Line = $[x1], [y1], [x2], [y2]$
methods:
>cross(Line) -> returns boolean
>intersecton(Line) -> returns point of intersection

getter/setters:
>stroke
>x1
>y1
>x2
>y2
``` -->