var bogart = require('bogart')
  , imageServer = require('../index');

var router = bogart.router();
router.get('/', function (req) {
  var html = '<html><head><title>Image Server Example</title></head><body>';
  html += '<form><label for="height">Height</label><input name="height" type="text" />';
  html += '<label for="width">Width</label><input name="width" type="text" />';
  html += '<input type="submit" />';
  html += '</form>';
  html += '<img src="/images/ninja-cat.jpg';

  if (req.params.width || req.params.height) {
    var width = req.params.width || '';
    var height = req.params.height || '';

    var size = width+'x'+height;

    html += '?size='+size;
  }

  html += '" />';
  html += '</body></html>';

  return bogart.html(html);
});

var app = bogart.app();
app.use(imageServer);
app.use(router);

app.start();
