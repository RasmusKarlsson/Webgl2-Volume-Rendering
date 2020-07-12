(function () {
    'use strict';

    window.getShaderSource = function(id) {
        return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
    };

    function createShader(gl, source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {
        var program = gl.createProgram();
        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vshader);
        gl.deleteShader(vshader);
        gl.attachShader(program, fshader);
        gl.deleteShader(fshader);
        gl.linkProgram(program);

        var log = gl.getProgramInfoLog(program);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(vshader);
        if (log) {
            console.log(log);
        }

        log = gl.getShaderInfoLog(fshader);
        if (log) {
            console.log(log);
        }

        return program;
    };

    window.loadTexture = function(gl, url) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Because images have to be download over the internet
      // they might take a moment until they are ready.
      // Until then put a single pixel in the texture so we can
      // use it immediately. When the image has finished downloading
      // we'll update the texture with the contents of the image.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);

      const image = new Image();
      image.onload = function()
      {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      srcFormat, srcType, image);

           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      };

      image.src = url;

      return texture;
    };

    window.loadImage = function(url, onload) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
            onload(img);
        };
        return img;
    };

    window.loadImages = function(urls, onload) {
        var imgs = [];
        var imgsToLoad = urls.length;

        function onImgLoad() {
            if (--imgsToLoad <= 0) {
                onload(imgs);
            }
        }

        for (var i = 0; i < imgsToLoad; ++i) {
            imgs.push(loadImage(urls[i], onImgLoad));
        }
    };

    window.loadObj = function(url, onload) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function(e) {
            var mesh = new OBJ.Mesh(this.response);
            onload(mesh);
        };
        xhr.send();
    };
})();
