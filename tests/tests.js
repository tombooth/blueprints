
var b = require('nodeunit-b'),
    blueprints = require('../src/main.js');


b.setInjectRoot(__dirname);


exports['test the lot'] = b({

   tearDown: function(callback, window) { window.document.body.innerHTML = ''; callback(); },

   'test basic functionality': function(test, window) {

      var message = "Hello World!";

      window.document.body.appendChild(window.blueprints('basic', { message: message }));

      test.equal(window.document.querySelectorAll('h1').length, 1);
      test.equal(window.document.querySelector('h1').innerHTML, message);

      test.done();

   },

   'test deep namespace': function(test, window) {

      var message = "Hello World!";

      window.document.body.appendChild(window.blueprints('namespace:another:deep-namespace', { message: message }));

      test.equal(window.document.querySelectorAll('h1').length, 1);
      test.equal(window.document.querySelector('h1').innerHTML, message);

      test.done();

   },

   'test multiple attrs': function(test, window) {

      var document = window.document,
          list = [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ],
          currentItem = list[1];

      document.body.appendChild(window.blueprints('multiple-attrs', { list: list, currentItem: currentItem }));

      test.equal(document.querySelectorAll('option').length, 3);
      test.equal(document.querySelectorAll('option')[1].getAttribute('selected'), 'true');

      test.done();

   },

   'test node insertion': function(test, window) {

      var document = window.document,
          list = [ { name: 'item1' }, { name: 'item2' }, { name: 'item3' } ],
          listElements;

      document.body.appendChild(window.blueprints('node-insertion-parent', { items: list }));

      listElements = window.document.querySelectorAll('li');
      
      test.equal(listElements.length, 3);

      for (var i = 0; i < listElements.length; i++) {
         test.equal(listElements[i].innerHTML, list[i].name);
      }

      test.done();

   },

   'test ending whitespace stripping': function(test, window) {

      var document = window.document,
          list = [ 'a', 'b', 'c' ],
          listElements;

      document.body.appendChild(window.blueprints('ending-whitespace', { list: list }));

      listElements = window.document.querySelectorAll('li');
      
      test.equal(listElements.length, 3);

      for (var i = 0; i < listElements.length; i++) {
         test.equal(listElements[i].innerHTML, ' (' + list[i] + ') ');
      }

      test.done();

   }

});





exports.setUp = function(callback) {

   var stream = require('fs').createWriteStream(__dirname + '/compiled.js');

   new blueprints(__dirname + '/templates').out(stream, function() {
      stream.end(); 
      b.inject(['compiled.js']);
      callback(); 
   });

};


