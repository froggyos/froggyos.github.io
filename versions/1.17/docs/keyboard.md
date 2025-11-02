# Keywords
## keydown
Runs the provided block of code when the specified key is pressed down.
```
keydown [string] [block]

keydown "a" {
    out "The 'a' key was pressed down!"
}
```

##keyup
Runs the provided block of code when the specified key is released.
```
keyup [string] [block]

keyup "a" {
    out "The 'a' key was released!"
}
```

## anykeydown
Runs the provided block of code when any key is pressed down. Use the `__key__` variable to get the key that was pressed.
```
anykeydown [block]

anykeydown {
    out "Key " + __key__ + " was pressed down!"
}
```