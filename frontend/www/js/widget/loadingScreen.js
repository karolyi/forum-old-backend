(function ($) {
  /**
   *
   * Widget handler for the loader overlay
   *
   */

  Forum.widget.loadingScreen = {
    options: {
      contentWrapper: $('<div/>'),
      fadeTime: 1000,
      showImmediately: false,
    },
// SERIOUS FIXME HERE
    _create: function () {
      var self = this;
      this.loaderDivLoaded = false;
      this.shownOnce = false;
      this.showDeferredObj = $.Deferred().resolve();
      this.hideDeferredObj = $.Deferred().resolve();
      if (this.options.showImmediately)
        this._showImmediately();
    },

    _loadTemplate: function () {
      var self = this;
      var dfd = $.Deferred();
      if (!this.loaderDivLoaded) {
        $.when(
          Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/loaderTemplate.html')
        ).then(function(loaderDivContent) {
          self.element.append(loaderDivContent);
          self.loaderDivLoaded = true;
          if (!self.shownOnce) {
            self.initTexts();
            self.shownOnce = true;
          }
          dfd.resolve();
        });
      } else {
        dfd.resolve();
      }
      return dfd.promise();
    },

    _showImmediately: function () {
      this._loadTemplate();
      this.options.contentWrapper.hide();
      this.element.show();
    },

    _realShow: function () {
      var self = this;
      $.when(self._loadTemplate()).then(function () {
        self.options.contentWrapper.fadeOut(self.options.fadeTime);
        self.element.fadeIn(self.options.fadeTime, function () {
          if (Forum.settings.userSettings.useBackgrounds && Forum.widgetInstances.backgroundChanger)
            Forum.widgetInstances.backgroundChanger.resize();
          self.showDeferredObj.resolve();
        });
        if (!self.shownOnce) {
          self.initTexts();
          self.shownOnce = true;
        }
        self.showDeferredObj.resolve();
      });
    },

    _realHide: function () {
      var self = this;
      this.options.contentWrapper.fadeIn(this.options.fadeTime);
      this.element.fadeOut(this.options.fadeTime, function() {
        if (Forum.settings.userSettings.useBackgrounds && Forum.widgetInstances.backgroundChanger)
          Forum.widgetInstances.backgroundChanger.resize();
        self.hideDeferredObj.resolve();
      });
    },

    initTexts: function() {
      this.element.find('[data-text="Loading, please wait ..."]').html(_('Loading, please wait ...'));
    },

    show: function() {
      var self = this;
      if (this.showDeferredObj.state() == 'resolved')
        this.showDeferredObj = $.Deferred();
      if (this.hideDeferredObj.state() == 'resolved')
        this._realShow();
      else {
        this.hideDeferredObj.then(function () {
          self._realShow();
        });
      }
      return this.showDeferredObj.promise();
    },

    hide: function() {
      var self = this;
      if (this.hideDeferredObj.state() == 'resolved')
        this.hideDeferredObj = $.Deferred();
      if (this.showDeferredObj.state() == 'resolved')
        this._realHide();
      else {
        this.showDeferredObj.then(function () {
          self._realHide();
        });
      }
      return this.hideDeferredObj.promise();
    },

  };

  $.widget('Forum.LoadingScreen', Forum.widget.loadingScreen);

})(jQuery)
