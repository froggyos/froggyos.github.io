# Info
(0,0) is in the top left corner of the screen. Maximum x is 78 and maximum y is 57.
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
# methods
## render
Renders the rectangle to the screen.
```
rect rectangle = $0, 0, 50, 50$
#rectangle>render
```
## clear
Clears the rectangle from the screen.
```
rect rectangle = $0, 0, 50, 50$
#rectangle>clear
```


```
to implement:
>setFill()
>setOutline()
```