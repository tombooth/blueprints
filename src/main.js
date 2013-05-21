
var Seq = require('seq'),
    htmlparser = require('htmlparser'),
    uglify = require('uglify-js'),
    fs = require('fs');


function blueprints(path, options) {

   options = options || { };
   this.token_regex = options.token_regex || /##(.+?)##/g;
   this.namespace_separator = options.namespace_separator || ':';
   this.template_extension = options.template_extension || '.html';
   this.minify = options.minify;

   this.path = path;
   this._tokens = [ ];
   this._processed_token_regex = /##(.+?)##/g;
}


blueprints.prototype.out = function(stream, fn) {

   this._walk(this.path, (function(files) { 
      var that = this;

      Seq(this._flatten(files))
         .seqMap(function(file) { 
             fs.readFile(file.path, (function(err, source) { file.source = source.toString('utf8'); this(null, file); }).bind(this))
          })
         .seqMap(function(file) {
             that._parse_file(file.source, (function(err, dom) { file.dom = dom; this(null, file); }).bind(this));
          })
         .seqMap(function(file) {
             var flattened = that._flatten(file.dom);

             file.fn = 'blueprints._s["' + file.id +'"] = function(data) {\n' +
                          '\tvar fragment = doc[cf]();\n\twith (data||{}){\n\t' +
                           flattened.map(that._gen_code.bind(that)).join('\n\t') +
                          '\t}\n\treturn fragment;\n' +
                       '};\n';

             this(null, file);
          })
         .unflatten()
         .seq(function(files) {
             var src = '';

             src += '(function(doc) {\n\nvar ce="createElement",\nct="createTextNode",\nac="appendChild",\nsa="setAttribute",\ncf="createDocumentFragment";\n\n';
             src += 'function blueprints(id, data) {\n\treturn blueprints._s[id](data, blueprints);\n}\n';
             src += '\nblueprints._s = { };\n';
             src += files.map(function(file) { return file.fn; }).join('\n\n');
             src += 'window.blueprints = blueprints;\n})(document);';

             if (!that.minify) stream.write(src, 'utf8');
             else {
                var parser = uglify.parser,
                    processor = uglify.uglify,
                    ast = parser.parse(src);

                ast = processor.ast_mangle(ast);
                ast = processor.ast_squeeze(ast);

                stream.write(processor.gen_code(ast), 'utf8');
             }

             fn && fn();
                
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
      out += '##' + this._tokens.length + '##';

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

blueprints.prototype._minimise_whitespace = function(text) {
   var start_match = /^[\s]*\S/.exec(text),
       end_match = /\S[\s]*$/.exec(text);

   if (!start_match) return '';

   if (start_match[0].length >= 2) {
      text = ' ' + text.substr(start_match[0].length - 1);
   }

   if (end_match[0].length >= 2) {
      text = text.substring(0, text.length - (end_match[0].length - 1)) + ' ';
   }

   return text;
};

blueprints.prototype._gen_text_node = function(text, parent) {
   if (text) text = this._minimise_whitespace(text);
   return (text) ? parent + '[ac](doc[ct]("' + text + '"));' : '';
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

         src.push('var ' + elem.var_name + ' = doc[ce]("' + elem.name + '");');

         for (var i = 0, l = attrs.length; i < l; i++) {
            cursor = 0;
            attr_value = elem.attribs[attrs[i]];

            if (this.token_regex.test(attr_value)) {
               attr_var = elem.var_name + '_attr' + i;

               this.token_regex.lastIndex = 0;

               src.push('var ' + attr_var + ' = "";');
               while (match = this._processed_token_regex.exec(attr_value)) {
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

               src.push(elem.var_name + '[sa]("' + attrs[i] + '", ' + attr_var + ');');
            } else {
               src.push(elem.var_name + '[sa]("' + attrs[i] + '", "' + attr_value + '");');
            }
         }

         src.push(parent_var + '[ac](' + elem.var_name + ');');

         break;

      case 'text':
         var text = elem.data;

         while (match = this._processed_token_regex.exec(text)) {
            src.push(this._gen_text_node(text.substring(cursor, match.index), parent_var));

            code = this._tokens[match[1]].trim();
            switch (code.charAt(0)) {
               case '=':
                  src.push(parent_var + '[ac](doc[ct](' + code.substr(1).trim() + '));');
                  break;
               case '&':
                  src.push(parent_var + '[ac](' + code.substr(1).trim() + ');');
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

