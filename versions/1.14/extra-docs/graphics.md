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

rect rectangle = $0, 0, 50, 50$
```
# Rect
## Methods
### render
Renders the object to the screen.
```
.rectangle>render
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
## Getters and Setters
* `>x` - x position of the rectangle
* `>y` - y position of the rectangle
* `>width` - width of the rectangle
* `>height` - height of the rectangle
* `>fill` - fill color of the rectangle
* `>stroke` - stroke color of the rectangle
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

<!-- # Rect
## Methods
### render
Renders the rectangle to the screen.
```
rect rectangle = $0, 0, 50, 50$
#rectangle>render
```
### clear
Clears the rectangle from the screen.
```
rect rectangle = $0, 0, 50, 50$
#rectangle>clear
```
### move
Moves the rectangle to a new position on the screen. Alias of `>x()>y()`.
```
rect rectangle = $0, 0, 50, 50$
#rectangle>move(10;10)
```
### clone
Creates a clone of the rectangle object. The clone will have the same properties as the original rectangle object, but will not be linked to it. This means that changes made to the clone will not affect the original rectangle object, and vice versa.
```
rect rectangle = $0, 0, 50, 50$
rect clone = rectangle>clone
#clone>render>move(10;10)
-- does not affect the original rectangle object
```
### intersects
Checks if the rectangle intersects with another rectangle. Returns Boolean.
```
rect rectangle1 = $0, 0, 50, 50$
rect rectangle2 = $10, 10, 50, 50$
#rectangle1>intersects(rectangle2)
```
## Getters and Setters
* `>x` - x position of the rectangle
* `>y` - y position of the rectangle
* `>width` - width of the rectangle
* `>height` - height of the rectangle
* `>fill` - fill color of the rectangle
* `>stroke` - stroke color of the rectangle

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
* `>color` - color of the pixel

# Text
## Methods
### render
Renders the text to the screen.
```
text text = $0, 0, 'Hello World'$
#text>render
```
### clear
Clears the text from the screen.
```
text text = $0, 0, 'Hello World'$
#text>clear
```
### move
Moves the text to a new position on the screen. Alias of `>x()>y()`.
```
text text = $0, 0, 'Hello World'$
#text>move(10;10) 
```
### clone
Creates a clone of the text object. The clone will have the same properties as the original text object, but will not be linked to it. This means that changes made to the clone will not affect the original text object, and vice versa.
```
text text = $0, 0, 'Hello World'$

text clone = text>clone
#clone>render>move(10;10) 
-- does not affect the original text object
```
## Getters and Setters
* `>x` - x position of the text
* `>y` - y position of the text
* `>width` - width of the text (only if wordwrap is true)
* `>wrap` - whether the text should be wrapped or not (default: false)
* `>color` - color of the text
* `>text` - text to be displayed

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