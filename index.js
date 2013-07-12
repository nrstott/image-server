var bogart = require('bogart')
  , path = require('path')
  , fs = require('fs')
  , querystring = require('querystring')
  , os = require('os')
  , childProcess = require('child_process')
  , q = require('q');

var tmpdir = os.tmpDir ? os.tmpDir : os.tmpdir;

var defaultOpts = {
  root: path.join(bogart.maindir(), 'public')
};

/**
 * Image Server
 *
 * You must have Image Magick installed for this to function properly.
 */
function imageServer(opts) {
  if (typeof opts === 'function') {
    var next = opts;
    opts = defaultOpts;

    return middleware(next);
  }

  opts = opts || defaultOpts;

  return middleware;

  function middleware(next) {
    var validMimeTypes = opts.mimeTypes || [ 'image/jpeg', 'image/png' ];
    var convertPath = opts.convertPath || 'convert';
    var tempDir = opts.tempDir || tmpdir();

    return function (req) {
      var reqPath = path.join(opts.root, req.pathInfo.substring(1));
      var reqMimeType = bogart.mimeType(reqPath);

      if (validMimeTypes.indexOf(reqMimeType) === -1) {
        return next(req);
      }
      var stat = bogart.promisify(fs.stat)
        , exec = bogart.promisify(childProcess.exec);

      return exists(reqPath).then(function (fileExists) {

        if (!fileExists) {
          return next(req);
        }

        return stat(reqPath).then(function (stat) {
          if (stat.isFile()) {
            var search = querystring.parse(req.queryString);

            if (search.size) {
              var fileName = path.basename(reqPath)+path.extname(reqPath);
              var destination = path.join(tempDir, fileName);

              return exec(convertPath+' '+reqPath+' -resize '+search.size+' '+destination).then(function () {
                return bogart.file(destination);
              });
            } else {
              return bogart.file(reqPath);
            }
          }
        });
      }, function (err) {
        return bogart.q.reject(err);
      });
    };
  }
}

function exists(path) {
  var deferred = bogart.q.defer();

  fs.exists(path, function(exists) {
    deferred.resolve(exists);
  });

  return deferred.promise;
}

module.exports = imageServer;
