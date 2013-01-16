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
    _deferObjs: new Object(),

    _returnFromStorage: function (key) {
      var dfd = $.Deferred();
      var value = this._storage[key];
      if (!key in $.jStorage.storageObj())
        $.jStorage.set(key, value);
      dfd.resolve(value);
      this._deferObjs[key] = dfd;
      return dfd.promise();
    },

    _returnFromJStorage: function (key) {
      var dfd = $.Deferred();
      var value = $.storageObj.get(key);
      this._storage[key] = value;
      dfd.resolve(value);
      this._deferObjs[key] = dfd;
      return dfd.promise();
    },

    _loadViaAjax: function (key) {
      var self = this;
      var dfd = $.Deferred();
      this._deferObjs[key] = dfd;
      $.ajax({
        url: key + '?_=' + (new Date()).getTime(),
        success: function(data, textStatus, jqXHR) {
          self.set(key, data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error(textStatus + ': ', jqXHR, errorThrown);
        }
      });
      return dfd.promise();
    },

    load: function(key) {
      // Try to get from the local storage first
      if (key in this._storage)
        return this._returnFromStorage(key);
      // Not in local storage, check in jStorage
      if (key in $.jStorage.storageObj())
        return this._returnFromJStorage(key);
      // If it doesn't exist in the local storage, nor in jStorage, load it from the server via ajax
      return this._loadViaAjax(key);
    },

    set: function(key, value) {
      this._storage[key] = value;
      $.jStorage.set(key, value);
      // Check if there's already a Deferred object for that key
      if (!key in this._deferObjs)
        this._deferObjs[key] = $.Deferred();
      this._deferObjs[key].resolve(value);
    },

    get: function(key) {
      if (key in this._deferObjs)
        return this._deferObjs[key].promise();
      // If not exists, place a load on it
      return this.load(key);
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
        self._loadWidgetCode();
      });

      $.Widget.prototype._create.call(this);
    },

    _loadCss: function (noCache) {
      noCache = noCache || false;
      var fileName = '/skins/' + Forum.settings.usedSkin + '/css/style.css';
      if (noCache)
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
      this._loadCss(Forum.settings.reloadCache);
      $.when(
        // Models have to be loaded first, so that we can use them in the controllers
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
        showImmediately: true,
      }).data('LoadingScreen');
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
      this.loadingScreen.hide();
//      console.log('_createContinue');
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
  // For API cookies
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true,
    },
   });
  $('body > div#page-wrapper').Main();
})
