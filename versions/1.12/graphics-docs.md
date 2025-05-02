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
## getters
* `>_x` - x position of the rectangle
* `>_y` - y position of the rectangle
* `>_width` - width of the rectangle
* `>_height` - height of the rectangle
* `>_fill` - fill color of the rectangle
* `>_stroke` - stroke color of the rectangle
## setters
* `>x` - x position of the rectangle
* `>y` - y position of the rectangle
* `>width` - width of the rectangle
* `>height` - height of the rectangle
* `>fill` - fill color of the rectangle
* `>stroke` - stroke color of the rectangle

# Pixel
## methods
### is
Checks if the pixel is the provided color. Returns Boolean.
```
pxl pixel = $0, 0$
#pixel>is('c00')
```

## getter
* `>_color` - color of the pixel
## setter
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