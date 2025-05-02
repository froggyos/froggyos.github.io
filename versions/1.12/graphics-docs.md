# Info
(0,0) is in the top left corner of the screen. Maximum displayable x is 78 and maximum displayable y is 57.

# methods
## toRect
Converts an array to a rectangle.
```
#$0, 0, 50, 50$>toRect
```
## toText
Converts an array to a text object.
```
#$0, 0, 'Hello World'$>toText
```
# keywords
## createscreen
Adds a screen to the terminal line.
```
createscreen
```
## rect
Creates a variable of type Rect.
```
rect [name] = $[x], [y], [width], [height]$
```
## pixel
Creates a variable of type Pixel.
```
pxl [name] = $[x], [y]$
```
## text
Creates a variable of type Text. `x` and `y` is where the first character of the text will be drawn.
```
text [name] = $[x], [y], [text]$
```

# Rect
## methods
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
## getters and setters
* `>x` - x position of the rectangle
* `>y` - y position of the rectangle
* `>width` - width of the rectangle
* `>height` - height of the rectangle
* `>fill` - fill color of the rectangle
* `>stroke` - stroke color of the rectangle

# Pixel
Manipulate individual pixels on the screen.
## methods
### is
Checks if the pixel is the provided color. Returns Boolean.
```
pxl pixel = $0, 0$
#pixel>is('c00')
```

## getters and setters
* `>color` - color of the pixel

# Text
## methods
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
## getters and setters
* `>x` - x position of the text
* `>y` - y position of the text
* `>width` - width of the text (only if wordwrap is true)
* `>wrap` - whether the text should be wrapped or not (default: false)
* `>color` - color of the text
* `>text` - text to be displayed

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
```