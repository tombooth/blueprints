
var Seq = require('seq'),
    htmlparser = require('htmlparser'),
    uglify = require('uglify-js'),
    fs = require('fs');


function blueprints(path, options) {

   options = options || { };
   this.token_regex = options.token_regex || /{{(.+?)}}/g;
   this.namespace_separator = options.namespace_separator || ':';
   this.template_extension = options.template_extension || '.html';

   this.path = path;
   this._tokens = [ ];
}


blueprints.prototype.out = function(stream) {

   this._walk(this.path, (function(files) { 
      var that = this;

      //console.log(require('util').inspect(files, false, 3, true)); 

      Seq(this._flatten(files))
         .seqMap(function(file) { 
             fs.readFile(file.path, (function(err, source) { file.source = source.toString('utf8'); this(null, file); }).bind(this))
          })
         .seqMap(function(file) {
             that._parse_file(file.source, (function(err, dom) { file.dom = dom; this(null, file); }).bind(this));
          })
         .seqMap(function(file) {
             var flattened = that._flatten(file.dom);

             file.fn = 'blueprints._store["' + file.id +'"] = function(data) {\n' +
                          '\tvar fragment = document.createDocumentFragment();\n\t' +
                           flattened.map(that._gen_code.bind(that)).join('\n\t') +
                          '\treturn fragment;\n' +
                       '};\n';

             this(null, file);
          })
         .unflatten()
         .seq(function(files) {
             stream.write('(function() {\n\nfunction blueprints(id, data) {\n\treturn blueprints._store[id](data, blueprints);\n}\n', 'utf8');
             stream.write('\nblueprints._store = { };\n', 'utf8');
             stream.write(files.map(function(file) { return file.fn; }).join('\n\n'), 'utf8');
             stream.write('window.blueprints = blueprints;\n})();', 'utf8');
          });


   }).bind(this));

   return this;

};


blueprints.prototype._walk = function(path, cb, dirs) {
   var that = this,
       file = require('path').basename(path, this.template_extension);

   fs.stat(path, function(err, stat) {
      if (err) cb([]);
      else {
         if (stat.isDirectory()) {
            dirs = dirs === undefined ? [ ] : dirs.concat([file]);

            fs.readdir(path, function(err, files) {
               var to_walk = files.length,
                   out_files = [ ];

               files.length === 0 && cb && cb(out_files);

               function done(walked_files) {
                  out_files = out_files.concat(walked_files);
                  !--to_walk && cb && cb(out_files); // if we have walked all the paths and there is a callback invoke it
               }

               files.map(function(file) { return require('path').resolve(path, file); })
                    .forEach(function(path) { that._walk(path, done, dirs); });
            });
         } else if (require('path').extname(path) === that.template_extension) {
            cb([ { id: (dirs ? dirs.concat([file]).join(that.namespace_separator) : file), path: path } ]);
         } else {
            cb([ ]);
         }
      }
   });
};


blueprints.prototype._pre_process = function(html) {
   var match,
       out = '',
       cursor = 0;

   while (match = this.token_regex.exec(html)) {
      out += html.substring(cursor, match.index);
      out += '{{' + this._tokens.length + '}}';

      this._tokens.push(match[1].trim());

      cursor = this.token_regex.lastIndex;
   }

   out += html.substring(cursor, html.length);

   return out;
};

blueprints.prototype._parse_file = function(source, cb) {
   var handler = new htmlparser.DefaultHandler(cb, { verbose: false }),
       parser = new htmlparser.Parser(handler);

   parser.parseComplete(this._pre_process(source));

};

blueprints.prototype._flatten = function(arr, parent) {
   if (!arr) return [];
   else {
      var out = [];
      for (var i = 0, l = arr.length; i < l; i++) {
         out.push(arr[i]);
         out = out.concat(this._flatten(arr[i].children, arr[i]));
         
         arr[i].parent = parent;
      }
      
      return out;
   }
};

blueprints.prototype._gen_text_node = function(text, parent) {
   return text ? parent + '.appendChild(document.createTextNode(decodeURI("' + encodeURI(text) + '")));' : '';
};

blueprints.prototype._gen_code = function(elem, index) {

   var src = [],
       parent_var = (elem.parent ? elem.parent.var_name : 'fragment'),
       cursor = 0, match, code;

   elem.var_name = 'elem' + index;

   switch (elem.type) {
      case 'tag':
         var attrs = elem.attribs ? Object.keys(elem.attribs) : [],
             attr_value;

         src.push('var ' + elem.var_name + ' = document.createElement("' + elem.name + '");');

         for (var i = 0, l = attrs.length; i < l; i++) {
            attr_value = elem.attribs[attrs[i]];

            if (this.token_regex.test(attr_value)) {
               attr_var = elem.var_name + '_attr' + i;

               this.token_regex.lastIndex = 0;

               src.push('var ' + attr_var + ' = "";');
               while (match = this.token_regex.exec(attr_value)) {
                  src.push(attr_var + ' += "' + attr_value.substring(cursor, match.index) + '";');
                  
                  code = this._tokens[match[1]].trim();
                  switch (code.charAt(0)) {
                     case '=':
                        src.push(attr_var + ' += ' + code.substr(1).trim() +';');
                        break;
                     default:
                        src.push(code);
                  }

                  cursor = match.index + match[0].length;
               }
               src.push(attr_var + ' += "' + attr_value.substring(cursor, attr_value.length) + '";');

               src.push(elem.var_name + '.setAttribute("' + attrs[i] + '", ' + attr_var + ');');
            } else {
               src.push(elem.var_name + '.setAttribute("' + attrs[i] + '", "' + attr_value + '");');
            }
         }

         src.push(parent_var + '.appendChild(' + elem.var_name + ');');

         break;

      case 'text':
         var text = elem.data;

         while (match = this.token_regex.exec(text)) {
            src.push(this._gen_text_node(text.substring(cursor, match.index), parent_var));

            code = this._tokens[match[1]].trim();
            switch (code.charAt(0)) {
               case '=':
                  src.push(parent_var + '.appendChild(document.createTextNode(' + code.substr(1).trim() + '));');
                  break;
               case '&':
                  src.push(parent_var + '.appendChild(' + code.substr(1).trim() + ');');
                  break;
               default:
                  src.push(code);
            }

            cursor = match.index + match[0].length;
         }

         src.push(this._gen_text_node(text.substring(cursor, text.length), parent_var));

         break;
   }

   
   return src.filter(function(l) { return !!(l.trim()); }).join('\n\t');
};



module.exports = blueprints;

