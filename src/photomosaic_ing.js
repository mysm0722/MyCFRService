(function(window) {

    'use-strict';

    function PhotoMosaic(options) {
        if (!options.image) {
            throw new Error('image options is not passed');
        }
        if (!options.targetElement) {
            throw new Error('targetElement is not passed in options');
        }

        this.options = this.extend(this.defaults, options);

        if (this.options.image.complete) {
            this.process();
        } else {
            this.options.image.onload = this.process.bind(this);
        }
    }

    PhotoMosaic.prototype.process = function() {
        this.options.divX = Math.floor(this.options.width / this.options.tileWidth);
        this.options.divY = Math.floor(this.options.height / this.options.tileHeight);
        var context = this.renderImage();
        //this.originalCanvas(context);
        this.tileCanvas(context);
    };

    /**
     * Extends a Javascript Object
     * @param  {object} destination The object in which the final extended values are save
     * @param  {object} sources     The objects to be extended
     * @return {}
     */
    PhotoMosaic.prototype.extend = function(destination, sources) {
        for (var source in sources) {
            if (sources.hasOwnProperty(source)) {
                destination[source] = sources[source];
            }
        }
        return destination;
    };

    /**
     * The defaults options object
     * @type {Object}
     */
    PhotoMosaic.prototype.defaults = {
        'image': null,
        'tileWidth': 5,
        'tileHeight': 5,
        'targetElement': null,
        'tileShape': 'rectangle',
        'opacity': 100,
        'width': null,
        'height': null,
        'defaultBackground': 'rgba(0, 0, 0, 0)'
    };

    /**
     * Renders the image with an default background on a canvas before processing the pixels
     * @return {object} Context of the canvas created
     */
    PhotoMosaic.prototype.renderImage = function() {
        var options = this.options;
        var canvas = document.createElement('canvas');

        canvas.width = options.tileWidth * options.divX;
        canvas.height = options.tileHeight * options.divY;

        var context = canvas.getContext('2d');

        context.fillStyle = options.defaultBackground;
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height);
        context.closePath();
        context.fill();
        
        context.drawImage(options.image, 0, 0, canvas.width, canvas.height);
        return context;
    };

    /**
     * Returns the average color of the canvas.
     * @param  {Array} data     The data received by using the getImage() method
     * @return {Object}         The object containing the RGB value
     */
    PhotoMosaic.prototype.getAverageColor = function(data) {
        var i = -4,
            pixelInterval = 5,
            count = 0,
            rgb = {
                r: 0,
                g: 0,
                b: 0
            },
            length = data.length;

        while ((i += pixelInterval * 4) < length) {
            count++;
            rgb.r += data[i];
            rgb.g += data[i + 1];
            rgb.b += data[i + 2];
        }

        // floor the average values to give correct rgb values
        // rgb.r = Math.floor(rgb.r / count);
        // rgb.g = Math.floor(rgb.g / count);
        // rgb.b = Math.floor(rgb.b / count);

        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);
        
        return rgb;
    };

    PhotoMosaic.prototype.getOriginalColor = function(data) {
        var i = -4,
            pixelInterval = 5,
            count = 0,
            rgb = {
                r: 0,
                g: 0,
                b: 0
            },
            length = data.length;

        while ((i += pixelInterval * 4) < length) {
            count++;
            rgb.r += data[i];
            rgb.g += data[i + 1];
            rgb.b += data[i + 2];
        }

        // floor the average values to give correct rgb values
        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);

        // rgb.r = Math.floor(rgb.r);
        // rgb.g = Math.floor(rgb.g);
        // rgb.b = Math.floor(rgb.b);
        
        return rgb;
    };

    /**
     * Divides the whole canvas into smaller tiles and finds the average
     * colour of each block. After calculating the average colour, it stores
     * the data into an array.
     *
     * @param context   Context of the canvas
     */
    PhotoMosaic.prototype.tileCanvas = function(context) {
        var processedCanvas = document.createElement('canvas');
        var width = processedCanvas.width = context.canvas.width;
        processedCanvas.height = context.canvas.height;

        var processedContext = processedCanvas.getContext('2d');
        var options = this.options;

        var originalImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

        for (var i = 0; i < options.divY; i++) {
            for (var j = 0; j < options.divX; j++) {
                var x = j * options.tileWidth,
                    y = i * options.tileHeight;
                var imageData = this.getImageData(x, y, width, originalImageData);
                var averageColor = this.getAverageColor(imageData);
                var color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + this.options.opacity + ')';
                processedContext.fillStyle = color;
                this.createMosaic(x, y, processedContext);
            }
        }
        this.options.targetElement.appendChild(processedCanvas);
    };

   

    // PhotoMosaic.prototype.originalCanvas = function(context) {
       
    //     // var options = this.options;
    //     // var canvas = document.createElement('canvas');

    //     // canvas.width = options.tileWidth * options.divX;
    //     // canvas.height = options.tileHeight * options.divY;

    //     // var context = canvas.getContext('2d');

    //     // context.fillStyle = options.defaultBackground;
    //     // context.beginPath();
    //     // context.rect(0, 0, canvas.width, canvas.height);
    //     // context.closePath();
    //     // context.fill();
        
    //     // context.drawImage(options.image, 0, 0, canvas.width, canvas.height);
    //     // return context;
    
    //     var c = document.getElementById("target");
    //     console.log(c);
    
    //     var ctx = c.getContext("2d");

    //     var img = document.getElementById("image");

    //     ctx.drawImage(img, 0, 0);
    //     var imgData = ctx.getImageData(0, 0, c.width, c.height);
    //     // invert colors
    //     //var i;
    //     //for (i = 0; i < imgData.data.length; i += 4) {
    //     //    imgData.data[i] = 255 - imgData.data[i];
    //     //    imgData.data[i+1] = 255 - imgData.data[i+1];
    //     //    imgData.data[i+2] = 255 - imgData.data[i+2];
    //     //    imgData.data[i+3] = 255;
    //     //}
    //     ctx.putImageData(imgData, 0, 0);


    //     //var processedCanvas = document.createElement('canvas');
    //     var processedCanvas = document.getElementById("target");
    //     var orgProcessedCanvas = processedCanvas;

    //     var width = processedCanvas.width = context.canvas.width;
    //     processedCanvas.height = context.canvas.height;

    //     var processedContext = processedCanvas.getContext('2d');
    //     var options = this.options;

    //     var originalImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

    //     var imageData;
    //     var averageColor;
    //     var color;

    //     for (var i = 0; i < options.divY; i++) {
    //         for (var j = 0; j < options.divX; j++) {

    //             // console.log('i :' + i);
    //             // console.log('j :' + j);
    //     //  for (var i = 3; i < 10 ; i++) {
    //     //      for (var j = 2; j < 3; j++) {

    //             if ( (i > 28 && i < 57) && (j > 16 && j < 44))  {

    //                 console.log('-----------');
    //                 console.log('i :' + i);
    //                 console.log('j :' + j);
    //                 console.log('-----------');
                    
    //                 var x = j * options.tileWidth,
    //                 y = i * options.tileHeight;

    //                 imageData = this.getImageData(x, y, width, originalImageData);
    //                 averageColor = this.getAverageColor(imageData);
    //                 color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + this.options.opacity + ')';
    //                 processedContext.fillStyle = color;
    //                 this.createMosaic(x, y, processedContext);
    //                 //ctx.drawImage(img, 0,0);
                    
    //             } else {
    //                 //break;
    //                 ctx.drawImage(img, 0,0);
    //                 //ctx.drawImage(img, 101,300);
    //                 //var imgData = ctx.getImageData(0, 0, c.width, c.height);
    //                 //ctx.putImageData(imgData, 0, 0);
    //             }
                

                

    //         }
    //     }
    //     console.log('processedCanvas : ' + processedCanvas);
    //     //this.options.targetElement.appendChild(processedCanvas);
        

    //     //this.options.targetElement.appendChild(originalImageData);

    //     // for (var i = 0; i < context.canvas.height; i++) {
    //     //     for (var j = 0; j < context.canvas.width; j++) {
    //     // //  for (var i = 3; i < 10 ; i++) {
    //     // //      for (var j = 2; j < 3; j++) {
    //     //         var x = j,
    //     //             y = i;

    //     //         var imageData = this.getImageData(x, y, width, originalImageData);
    //     //         var averageColor = this.getOriginalColor(imageData);
    //     //         var color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + 1 + ')';
    //     //         processedContext.fillStyle = color;
    //     //         this.createOriginalMosaic(x, y, processedContext);
    //     //     }
    //     // }
    //     // console.log('processedCanvas : ' + processedCanvas);
    //     // this.options.targetElement.appendChild(processedCanvas);
    // };

    PhotoMosaic.prototype.originalCanvas = function(context) {
       
        // var options = this.options;
        // var canvas = document.createElement('canvas');

        // canvas.width = options.tileWidth * options.divX;
        // canvas.height = options.tileHeight * options.divY;

        // var context = canvas.getContext('2d');

        // context.fillStyle = options.defaultBackground;
        // context.beginPath();
        // context.rect(0, 0, canvas.width, canvas.height);
        // context.closePath();
        // context.fill();
        
        // context.drawImage(options.image, 0, 0, canvas.width, canvas.height);
        // return context;
    
        var c = document.getElementById("target");
        console.log(c);
    
        var ctx = c.getContext("2d");
        var img = document.getElementById("image");
        ctx.drawImage(img, 0, 0);
        var imgData = ctx.getImageData(0, 0, c.width, c.height);
        // invert colors
        //var i;
        //for (i = 0; i < imgData.data.length; i += 4) {
        //    imgData.data[i] = 255 - imgData.data[i];
        //    imgData.data[i+1] = 255 - imgData.data[i+1];
        //    imgData.data[i+2] = 255 - imgData.data[i+2];
        //    imgData.data[i+3] = 255;
        //}
        ctx.putImageData(imgData, 0, 0);


        //var processedCanvas = document.createElement('canvas');
        var processedCanvas = document.getElementById("target");
        var orgProcessedCanvas = processedCanvas;

        var width = processedCanvas.width = context.canvas.width;
        processedCanvas.height = context.canvas.height;

        var processedContext = processedCanvas.getContext('2d');
        var options = this.options;

        var originalImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

        var imageData;
        var averageColor;
        var color;
        var imgData2;

        for (var i = 0; i < options.divY; i++) {
            for (var j = 0; j < options.divX; j++) {

                // console.log('i :' + i);
                // console.log('j :' + j);
        //  for (var i = 3; i < 10 ; i++) {
        //      for (var j = 2; j < 3; j++) {

        //(i > 28 && i < 57) && (j > 16 && j < 44)

                if ( (i > 28 && i < 57) && (j > 16 && j < 44) ) {
                    //console.log('i :' + i);
                    //console.log('j :' + j);
                    //ctx.putImageData(imgData, 0, 0,j,i,600,600);
                    var x = j * options.tileWidth,
                    y = i * options.tileHeight;

                    imageData = this.getImageData(x, y, width, originalImageData);
                    averageColor = this.getAverageColor(imageData);
                    color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + this.options.opacity + ')';
                    processedContext.fillStyle = color;
                    this.createMosaic(x, y, processedContext);
                } else {
                    //ctx.putImageData(imgData, 10, 10);
                    // imgData2 = ctx.getImageData(0, 0, 100, 100);
                    // if( i == 30 && j == 10) { 
                    //     console.log(imgData2);
                    //     ctx.putImageData(imgData2, 0, 100);
                    // }
                    //ctx.putImageData(imgData, 0, 0);
                }
         
            }
        }

        // var c = document.getElementById("target");
        // console.log(c);
    
        // var ctx = c.getContext("2d");

        // var img = document.getElementById("image");
        // //ctx.drawImage(img, 0, 0);
        // var imgData = ctx.getImageData(0, 0, c.width, c.height);
        // // invert colors
        // //var i;
        // //for (i = 0; i < imgData.data.length; i += 4) {
        // //    imgData.data[i] = 255 - imgData.data[i];
        // //    imgData.data[i+1] = 255 - imgData.data[i+1];
        // //    imgData.data[i+2] = 255 - imgData.data[i+2];
        // //    imgData.data[i+3] = 255;
        // //}
        // ctx.putImageData(imgData, 0, 0);

       
        // invert colors
        //var i;
        //for (i = 0; i < imgData.data.length; i += 4) {
        //    imgData.data[i] = 255 - imgData.data[i];
        //    imgData.data[i+1] = 255 - imgData.data[i+1];
        //    imgData.data[i+2] = 255 - imgData.data[i+2];
        //    imgData.data[i+3] = 255;
        //}
        //ctx.putImageData(imgData, 100, 200);  

        console.log('processedCanvas : ' + processedCanvas);
        //this.options.targetElement.appendChild(processedCanvas);
        

        //this.options.targetElement.appendChild(originalImageData);

        // for (var i = 0; i < context.canvas.height; i++) {
        //     for (var j = 0; j < context.canvas.width; j++) {
        // //  for (var i = 3; i < 10 ; i++) {
        // //      for (var j = 2; j < 3; j++) {
        //         var x = j,
        //             y = i;

        //         var imageData = this.getImageData(x, y, width, originalImageData);
        //         var averageColor = this.getOriginalColor(imageData);
        //         var color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + 1 + ')';
        //         processedContext.fillStyle = color;
        //         this.createOriginalMosaic(x, y, processedContext);
        //     }
        // }
        // console.log('processedCanvas : ' + processedCanvas);
        // this.options.targetElement.appendChild(processedCanvas);
    };

    /**
     * Creates an array of the image data of the tile from the data of whole image
     * @param  {number} startX            x coordinate of the tile
     * @param  {number} startY            y coordinate of the tile
     * @param  {number} width             width of the canvas
     * @param  {object} originalImageData imageData if the whole canvas
     * @return {array}                    Image data of a tile
     */
    PhotoMosaic.prototype.getImageData = function (startX, startY, width, originalImageData) {
      var data = [];
      var tileWidth = this.options.tileWidth;
      var tileHeight = this.options.tileHeight;
      for (var x = startX; x < (startX + tileWidth); x++) {
          var xPos = x * 4;
          for (var y = startY; y < (startY + tileHeight); y++) {
              var yPos = y * width * 4;
              data.push(
                originalImageData.data[xPos + yPos + 0],
                originalImageData.data[xPos + yPos + 1],
                originalImageData.data[xPos + yPos + 2],
                originalImageData.data[xPos + yPos + 3]
              );
          }
      }
      return data;
    };

    /**
     * Creates a block of the mosaic. This is called divX*divY times to create all blocks
     * of the mosaic.
     * @param  {number} x          x coordinate of the block
     * @param  {number} y          y coordinate of the block
     * @param  {object} context    Context of the result canvas
     * @return {}
     */
    PhotoMosaic.prototype.createMosaic = function(x, y, context) {

        var tileWidth = this.options.tileWidth;
        var tileHeight = this.options.tileHeight;

        if (this.options.tileShape === 'circle') {
            var centerX = x + tileWidth / 2;
            var centerY = y + tileHeight / 2;
            var radius = Math.min(tileWidth, tileHeight) / 2;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
        } else if (this.options.tileShape === 'rectangle') {
            var height = tileHeight;
            var width = tileWidth;
            context.beginPath();
            context.rect(x, y, width, height);
            context.closePath();
            context.fill();
        }
    };

    PhotoMosaic.prototype.createOriginalMosaic = function(x, y, context) {

        context.beginPath();
        context.rect(x, y, 1,1);
        context.closePath();
        context.fill();
    };

    window.PhotoMosaic = PhotoMosaic;
}(window));
