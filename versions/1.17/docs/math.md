# Variables
The `math` import provides the `math` variable, which contains the methods. It is of type `import_math

# Methods
```
import_math>random(min: number, max: number) => number


```

<!--
        new Method("random", ["import_math"], [{type: ["number"], optional: false}, {type: ["number"], optional: false}], (parent, args, interpreter) => {
            let min = args[0].value;
            let max = args[1].value;
            if(min >= max){
                throw new FS3Error("RangeError", `math>random() min [${min}] must be less than max [${max}]`, args[0]);
            }
            let rand = Math.floor(Math.random() * (max - min)) + min;
            return {
                type: "number",
                value: rand,
                line: parent.line,
                col: parent.col,
                methods: []
            }
        }, false);
        
        thats the random method, document it>