exports.isImage  = function (filename) {
    switch (filename.toLowerCase()) {
      case '.jpg':
      case '.gif':
      case '.bmp':
      case '.png':
        //etc
        return true;
    }
    return false;
  }
  
exports.isVideo=  function (filename) {
    switch (filename.toLowerCase()) {
      case '.m4v':
      case '.avi':
      case '.mpg':
      case '.mp4':
      case '.webm':

        // etc
        return true;
    }
    return false;
}
