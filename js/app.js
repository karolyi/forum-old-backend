var Forum = new Object();
var _ = function(string) {return string};

(function($) {
  Forum.controller = new Object();
  Forum.model = new Object();
  Forum.widget = new Object();
  Forum.settings = new Object();
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

  Forum.codeLoader = {
    load: function(namespace) {
      var dfd = $.Deferred();
      var namespaceArray = namespace.split('.');
      var fileName = '/js/' + namespaceArray[1] + '/' + namespaceArray[2] + '.js';
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

  Forum.utils = {
    htmlEntities: function(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
  };

  Forum.widget.Loader = function(options) {
    var loaderDivLoaded = false;
    var root = $(options['root']);
    var loaderDiv = $(root.find('> div')[0]);
    var content = $(root.find('> div')[1]);
    var fadeTime = options['fadeTime'] || 1000;
    var shownOnce = false;
    var self = this;

    this.show = function() {
      var dfd = $.Deferred();
      if (!loaderDivLoaded) {
        $.when(Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/loaderTemplate.html'))
        .then(function(loaderDivContent) {
          if (loaderDiv.html() == '')
            loaderDiv.html(loaderDivContent);
          content.fadeOut(fadeTime);
          loaderDiv.fadeIn(fadeTime, function () { dfd.resolve(); });
          loaderDivLoaded = true;
          if (!shownOnce) {
            self.initTexts();
            shownOnce = true;
          }
        });
      } else {
        content.fadeOut(fadeTime);
        loaderDiv.fadeIn(fadeTime, function () { dfd.resolve(); });
        if (!shownOnce) {
          this.initTexts();
          shownOnce = true;
        }
      }
      return dfd.promise();
    };

    this.hide = function() {
      var dfd = $.Deferred();
      content.fadeIn(fadeTime);
      loaderDiv.fadeOut(fadeTime, function() { dfd.resolve(); });
      return dfd.promise();
    };

    this.initTexts = function() {
      loaderDiv.find('[data-text="Loading, please wait ..."]').html(_('Loading, please wait ...'));
    };
  };

  Forum.widget.main = {
    _createContinue: function() {
      var self = this;
      self.loader.hide();
    },

    _create: function() {
      var self = this;
      if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
        $.jStorage.flush();
        $.jStorage.set('cacheKey', Forum.settings.cacheKey);
      }
      this.root = $(this.element.find('> div#mainContentHolder'));
      this.loader = new Forum.widget.Loader({
        root: this.element,
        fadeTime: 1000,
      });
      this.subWidgetObj = new Object();
      $.when(
        this.loader.show()
        , Forum.codeLoader.load('Forum.model.User')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.user')
        , Forum.codeLoader.load('Forum.widget.forumTabs')
        , Forum.codeLoader.load('Forum.widget.backgroundChanger')
        , Forum.codeLoader.load('Forum.widget.dateTime')
      ).then(function() {
        self.languageSelector = self.root.find('#languageSelectorHolder #languageSelectorForm select');
        for (key in Forum.settings.languageObj) {
          selected = '';
          if (key == Forum.settings.displayLanguage)
            selected = ' selected="selected"';
          self.languageSelector.append('<option value="' + key + '"' +  selected + '>' + Forum.settings.languageObj[key] + '</option>');
        }
        self.languageSelector.bind('change', function() { self._changeLanguage.call(self) });
        self._changeLanguage.call(self);
        self.subWidgetObj.backgroundChanger = self.backgroundChanger = $('body > div#pageHolder').BackgroundChanger({
          bgImageArray: Forum.settings.bgImageArray,
          fadeTime: 3000,
          changeTime: 5 * 60 * 1000,
        }).data('BackgroundChanger');
        self.subWidgetObj.tabsWidget = self.root.find('> div#tabsHolder').ForumTabs().data('ForumTabs');
        if (Forum.settings.userSettings.useBackgrounds) {
          $.when(
            self.subWidgetObj.backgroundChanger.change()
          ).then(function() {
            self._createContinue();
            self.subWidgetObj.backgroundChanger.startChanging();
          });
        } else {
          self._createContinue();
        }
      });

      $.Widget.prototype._create.call(this);
    },

    _changeLanguage: function() {
      var self = this;
      Forum.settings.displayLanguage = self.languageSelector.val();
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
        for (var widgetId in self.subWidgetObj) {
          self.subWidgetObj[widgetId]._changeLanguage();
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
      self.loader.initTexts();
    },
  };

  $.widget('Forum.Main', Forum.widget.main);
})(jQuery);

$(document).ready(function() {
  $('body > div#pageHolder').Main();
})
