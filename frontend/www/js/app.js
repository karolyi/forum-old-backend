var Forum = new Object();
var _ = function(string) {return string};

(function($) {
  Forum.controller = new Object();
  Forum.model = new Object();
  Forum.widget = new Object();
  Forum.widgetInstances = new Object();

  /**
   *
   * The settings object, with the extender function
   *
   */

  Forum.settings = {
    reloadCache: false,

    _onLoadGet: function () {
      var self = this;
      this.dfd = $.Deferred();
      $.ajax({
        url: Forum.settings.apiHost + '/settings/defaults',
        // Firefox workaround lol
        dataType: 'json',
        success: function (data) {
          self._extendDefaults(data);
        },
      });
      return this.dfd.promise();
    },

    _extendDefaults: function (data) {
      for (key in data) {
        Forum.settings[key] = data[key];
      }
      this.dfd.resolve();
    },
  };

  /**
   *
   * Storage object for storing stuff in local persistent storage
   *
   */

  Forum.storage = {
    _storage: new Object(),

    deferObj: function(key) {
      // Function for loading files when not in local storage or in the variable scope
      this.load = function(key) {
        var self = this;
        var dfd = $.Deferred();
        $.ajax({
          url: key + '?_=' + (new Date()).getTime(),
          success: function(data, textStatus, jqXHR) {
            Forum.storage.set(key, data);
            dfd.resolve(data);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error(textStatus + ': ', jqXHR, errorThrown);
          }
        });
        return dfd.promise();
      };

      return this.load(key);
    },

    set: function(key, value) {
      Forum.storage._storage[key] = value;
      $.jStorage.set(key, value);
    },

    get: function(key) {
      var value = Forum.storage._storage[key];
      if (!value) {
        // Key does not exist, load from local storage
        var value = $.jStorage.get(key);
        if (value) {
          // console.log('key in local storage');
          Forum.storage.set(key, value);
        } else {
          // Key not in local storage, load from server
          return new this.deferObj(key);
        }
      }
      return $.Deferred().resolve(value);
    },
  };

  /**
   *
   * Code for loading source from the server
   *
   */

  Forum.codeLoader = {
    load: function(namespace) {
      var dfd = $.Deferred();
      var namespaceArray = namespace.split('.');
      // Remove the first 'Forum' string
      namespaceArray.shift();
      var fileName = '/js/';
      namespaceArray.forEach(function (element, index, origArray) {
        if (index != namespaceArray.length - 1)
          fileName += element + '/';
        else
          fileName += element + '.js';
      });
      if (Forum.settings.reloadCache)
        fileName += '?' + (new Date()).getTime();
      yepnope({
        test: window['eval'].call(window, namespace),
        nope: fileName,
        complete: function() {
          dfd.resolve()
        },
      });
      return dfd.promise();
    }
  };

  /**
   *
   * Utilities
   *
   */

  Forum.utils = {
    htmlEntities: function(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
  };

  /**
   *
   * The main widget code, this is launched at startup
   *
   */

  $.widget('Forum.Main', {
    _create: function() {
      var self = this;
      this.root = this.element.find('> div#root-content-wrapper');
      this.myWidgets = new Object();
      $.when(
        Forum.settings._onLoadGet()
      ).then(function() {
        self._loadCss();
        self._loadWidgetCode();
      });

      $.Widget.prototype._create.call(this);
    },

    _loadCss: function () {
      var fileName = '/skins/' + Forum.settings.usedSkin + '/css/style.css';
      if (Forum.settings.reloadCache)
        fileName += '?' + (new Date()).getTime();
      this.cssElement = $('<link>', {
        href: fileName,
        rel: 'stylesheet',
        type: 'text/css',
      });
      $('html > head', document).append(this.cssElement);
    },

    _loadWidgetCode: function () {
      var self = this;
      if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
        $.jStorage.flush();
        $.jStorage.set('cacheKey', Forum.settings.cacheKey);
        Forum.settings.reloadCache = true;
      }
      $.when(
        Forum.codeLoader.load('Forum.model.User')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.user')
        , Forum.codeLoader.load('Forum.widget.forumTabs')
        , Forum.codeLoader.load('Forum.widget.backgroundChanger')
        , Forum.codeLoader.load('Forum.widget.dateTime')
        , Forum.codeLoader.load('Forum.socketHandler')
        , Forum.codeLoader.load('Forum.widget.loadingScreen')
      ).then(function () {
        self._initLoadingScreen();
        self._initLanguageSelector();
        self._initBackgroundChanger();
        self._initForumTabs();
        if (Forum.settings.userSettings.useBackgrounds) {
          $.when(
            self.myWidgets.backgroundChanger.change()
          ).then(function() {
            self._createContinue();
            self.myWidgets.backgroundChanger.startChanging();
          });
        } else {
          self._createContinue();
        }
      });
    },

    _initLoadingScreen: function () {
      var self = this;
      this.loadingScreen = this.element.find('> #loader-wrapper').LoadingScreen({
        contentWrapper: self.root,
        fadeTime: 1000,
      }).data('LoadingScreen');
      this.loadingScreen.show();
    },

    _initLanguageSelector: function () {
      var self = this;
      this.languageSelector = this.root.find('#language-selector #selector-form select');
      for (key in Forum.settings.languageObj) {
        selected = '';
        if (key == Forum.settings.displayLanguage)
          selected = ' selected="selected"';
        self.languageSelector.append('<option value="' + key + '"' +  selected + '>' + Forum.settings.languageObj[key] + '</option>');
      }
      this.languageSelector.bind('change', function() {
        self._changeLanguage();
      });
      this._changeLanguage();
    },

    _initBackgroundChanger: function () {
      this.myWidgets.backgroundChanger = $('body > div#page-wrapper').BackgroundChanger({
        bgImageArray: Forum.settings.bgImageArray,
        fadeTime: 3000,
        changeTime: 5 * 60 * 1000,
        fullWindowBackground: true,
      }).data('BackgroundChanger');
    },

    _initForumTabs: function () {
      // Init the tabs
      this.myWidgets.forumTabs = this.root.find('> div#main-tab-wrapper').ForumTabs().data('ForumTabs');
    },

    _createContinue: function () {
      var self = this;
      this.loadingScreen.hide();
    },

    _changeLanguage: function() {
      var self = this;
      Forum.settings.displayLanguage = this.languageSelector.val();
      var localeUrl = '/languages/' + Forum.settings.displayLanguage + '.json';
      $.when(
        Forum.storage.get(localeUrl)
      ).then(function(localeData) {
        Forum.gettext = new Gettext({
          domain: Forum.settings.displayLanguage,
          locale_data: JSON.parse(localeData)
        });
        _ = function(msgid) {
          return Forum.gettext.gettext(msgid);
        };
        self.initTexts();
        for (var widgetId in self.myWidgets) {
          self.myWidgets[widgetId]._changeLanguage();
        if ($.Forum.TopicName)
          $.Forum.TopicName.instances.forEach(function(instance) {
            instance._changeLanguage();
          });
        if ($.Forum.UserName)
          $.Forum.UserName.instances.forEach(function(instance) {
            instance._changeLanguage();
          });
        if ($.Forum.DateTime)
          $.Forum.DateTime._changeLanguage();
        }
      });
    },

    initTexts: function() {
      var self = this;
      this.loadingScreen.initTexts();
    },

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
    },

  });

})(jQuery);

$(document).ready(function() {
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true,
    },
   });
  $('body > div#page-wrapper').Main();
})
