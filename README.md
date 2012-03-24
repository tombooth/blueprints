
blueprints is a JavaScript template library for generating DOM elements. It takes a directory and converts
it into a namespaced template library.


Installation
---------------------
```
npm install blueprints
```

Usage
---------------------
Create a template file with a .html extension (can be changed through options object see below) for
this example we will name this file list.html. Place this file in a root directory and then compile
it using one of the methods below.

root_dir/list.html

```
<div class="## if (something) { ##a-class## } ##">
   ## for (var i = 0, l = xs.length; i < l; i++) { ##
   <span>##= xs[i].name##</span>
   ## } ##
</div>
```
When you include your compiled template library in your javascript web app you will be able to access
it using the window.blueprints function passing in the id of the template and data to be used in the
template.

```javascript
var element = window.blueprints('list', { 
   something: true, 
   xs: [ { name:'foo' }, { name:'bar' } ] 
});
```

Here is a slightly more compiles template directory and the ids that correspond to the different files.

```
root_dir/list.html                       list
root_dir/reports/table.html              reports:table
root_dir/reports/structure.html          reports:structure
root_dir/reports/daily/breakdown.html    reports:daily:breakdown
```

Compilation
---------------------

Through a terminal:

```
$ blueprints {directory}

will out the template file to stdout

$ blueprints {directory} -o {file}

will out the template file to the specified file

$ blueprints -m {directory}

will minify the template file before outputting it
```

As a module:

```javascript
var blueprints = require('blueprints');

new blueprints(path, { minify: true }).out(writeable_stream);
```



