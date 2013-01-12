(function($) {
  Forum.widget.backgroundChanger = {
    _loadImageCache: new Object(),
    _imageAspectsObj: new Object(),
    _selected: null,
    _selectedBefore: null,
    _resizeTimeoutId: null,
    _changeIntervalId: null,
    _started: false,
    _imageObjArray: new Array(),
    _actualImageNumber: 1,

    _create: function() {
      var self = this;
      Forum.widgetInstances.backgroundChanger = this;
//      if (Forum.settings.userSettings.useBackgrounds)
      if (!this.element.find('> img#backgroundImage').length) {
        // Create the image holder
        self._imageObjArray[0] = $('<img/>').attr('id', 'backgroundImage').attr('src', '');
        self._imageObjArray[1] = $('<img/>').attr('id', 'backgroundImage').attr('src', '').hide();
        self._backgroundColorHolder = $('<div id="backgroundColor"/>')
        this.element.append(self._imageObjArray[0]);
        this.element.append(self._imageObjArray[1]);
        this.element.append(self._backgroundColorHolder);
      }
      $(window).resize(function() {self.prepareResize()})
      this.nextRandom();
      $.Widget.prototype._create.call(this);
    },

    destroy: function() {
      delete(Forum.widgetInstances.backgroundChanger);
      $.Widget.prototype.destroy.call(this);
    },

    start: function() {
    },

    options: {
      bgImageArray: Forum.settings.bgImageArray || [],
      fadeTime: 3000,
      changeTime: 5 * 60 * 1000,
    },

    _getSrc: function(url) {
      var tempLink = document.createElement('a');
      tempLink.href = url;
      var src = tempLink.pathname;
      delete(tempLink);
      // Exploder workaround
      if (src[0] != '/')
        src = '/' + src;
      return src;
    },

    _imageLoaded: function(imageObj) {
      var self = this;
      var src = self._getSrc(imageObj.src);
      // Store aspects of the background image
      self._imageAspectsObj[src] = {
        origHeight: imageObj.height,
        origWidth: imageObj.width,
        src: imageObj.src,
      };
      self._loadImageCache[src].resolve(self._imageAspectsObj[src]);
    },

    startChanging: function(timeOut) {
      var self = this;
      if (timeOut === undefined)
        timeOut = self.options.changeTime;
      if (self._changeIntervalId)
        clearInterval(self._changeIntervalId);
      self._changeIntervalId = setInterval(function() {
        self.nextRandom();
        self.change();
      }, timeOut);
    },

    load: function (imageSrc) {
      var self = this;
      if (typeof self._loadImageCache[imageSrc] === "undefined") {
        self._loadImageCache[imageSrc] = $.Deferred();

        preloader         = new Image();
        preloader.onload  = function() { self._imageLoaded(this) };
        preloader.onerror = function() { self._deferredObj.reject(this.src)  };
        preloader.src     = imageSrc;
//        if (preloader.complete)
//          this._imageLoaded(preloader);

      }
      return self._loadImageCache[imageSrc].promise();
    },

    change: function() {
      var self = this;
      self._actualImageNumber = 1 - self._actualImageNumber;
      var dfd = $.Deferred();
      var src = self.options.bgImageArray[self._selected];
      $.when(
        self.load(src)
      ).then(function(infoObj) {
        self._imageObjArray[self._actualImageNumber].removeAttr('src');
        self._imageObjArray[self._actualImageNumber].attr('src', '');
        self.resize(infoObj);
        self._imageObjArray[self._actualImageNumber].attr('src', infoObj['src']);
        self._imageObjArray[1 - self._actualImageNumber].fadeOut(self.options.fadeTime)
        self._imageObjArray[self._actualImageNumber].fadeIn(self.options.fadeTime, function() {
          dfd.resolve();
        });
      });
      return dfd.promise();
    },

    resize: function(infoObj) {
      var self = this;
      if (!infoObj) {
        // When called from timer or external, get the current info obj
        var src = self._getSrc(self._imageObjArray[self._actualImageNumber].attr('src'));
        var infoObj = self._imageAspectsObj[src];
      }
      if (infoObj) {
        //console.log(self.element);
        var elementHeight = self.element.height();
        var elementWidth = self.element.width();
        // Height goes 100%
        var multiplicator = elementHeight / infoObj['origHeight'];
        var width = infoObj['origWidth'] * multiplicator;
        var height = infoObj['origHeight'] * multiplicator;
        if (width < elementWidth) {
          // Width is less than window widht, so we resize again to make width 100% and height more than 100%
          multiplicator = elementWidth / infoObj['origWidth'];
          width = infoObj['origWidth'] * multiplicator;
          height = infoObj['origHeight'] * multiplicator;
        }
        self._imageObjArray[self._actualImageNumber].attr('height', height);
        self._imageObjArray[self._actualImageNumber].attr('width', width);
      }
    },

    prepareResize: function() {
      var self = this;
      if (self._resizeTimeoutId) {
        clearTimeout(self._resizeTimeoutId);
      }
      self._resizeTimeoutId = setTimeout(function() {
        self.resize();
        self._resizeTimeoutId = null;
      }, 0);
    },

    nextRandom: function() {
      var self = this;
      var backgroundImagesLength = self.options.bgImageArray.length;
      if (backgroundImagesLength > 1) {
        while(self._selected === self._selectedBefore)
          self._selected = Math.floor(Math.random() * backgroundImagesLength);
        self._selectedBefore = self._selected;
      } else {
        self._selected = 0;
        self._selectedBefore = 0;
      }
    },

    _changeLanguage: function() {
    },
  };

  $.widget('Forum.BackgroundChanger', Forum.widget.backgroundChanger);
})(jQuery);
