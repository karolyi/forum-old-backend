var Forum = new Object(), f = Forum;
Forum.settings = {
  cacheKey: '',
  displayLanguage: '',
  languageObj: {},
};
Forum.storage = {
  _storage: new Object(),

  set: function(key, value, callback) {
    Forum.storage._storage[key] = value;
    if (callback)
      callback(callback.scope, key);
  },

  get: function(key) {
    return this._storage[key];
  },

  load: function(key, callback) {
    if (!this._storage[key]) {
      // Key does not exist, load from local storage
      var value = $.jStorage.get(key);
      if (value) {
        // console.log('key in local storage');
        Forum.storage.set(key, value, callback);
      } else {
        // Key not in local storage, load from server
        $.ajax(key, {
          success: function(data, textStatus, jqXHR) {
            // Add in local storage too
            // console.log('key on server');
            $.jStorage.set(key, data);
            Forum.storage.set(key, data, callback);
          },
        });
      }
    } else {
      // Key already in cache, just execute the callback
      // console.log('key in client');
      if (callback)
        callback(key);
    }
  },
};

Forum.massLoader = function(options) {
  var instance = this;
  this.load = function(filesArray, readyCallback) {
    this.filesArray = new Array();
    this.readyCallback = readyCallback;
    for (element = 0; element < filesArray.length; element++)
      this.filesArray.push(filesArray[element]);
    for (element = 0; element < filesArray.length; element++) {
      Forum.storage.load(
        filesArray[element],
        this.loadCallback
      );
    }
  };

  this.loadCallback = function(file) {
    instance.filesArray.pop(instance.filesArray.indexOf(file));
    //console.log(instance.filesArray.length);
    if (!instance.filesArray.length) {
      // All loading finished, call the readyCallback
      instance.readyCallback()
    }
  };
  this.load(options['filesArray'], options['readyCallback']);
}

Forum.loader = {
  show: function() {
    $('#pageLoader').fadeIn(1000);
    $('#pageHolder').fadeOut(1000);
  },
  hide: function() {
    $('#pageLoader').fadeOut(1000);
    $('#pageHolder').fadeIn(1000);
  },
};

Forum.gui = {
  start: function() {
    if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
      $.jStorage.flush();
      $.jStorage.set('cacheKey', Forum.settings.cacheKey);
    }
    new Forum.massLoader({
      filesArray: [
        '/html/topicGroup.html',
        '/languages/' + Forum.settings.displayLanguage + '.json',
      ],
      readyCallback: Forum.gui.launch,
    })
  },
  launch: function() {
    Forum.gettext = new Gettext({
      domain: Forum.settings.displayLanguage,
      locale_data: JSON.parse(Forum.storage.get('/languages/' + Forum.settings.displayLanguage + '.json'))
    });
    _ = function(msgid) {
      return Forum.gettext.gettext(msgid);
    }
    Forum.gui.initTexts();
    $('#tabs').tabs();
    for (key in Forum.settings.languageObj) {
      selected = '';
      if (key == Forum.settings.displayLanguage)
        selected = ' selected="selected"';
      $('#languageSelectorForm > select').append('<option value="' + key + '"' +  selected + '>' + Forum.settings.languageObj[key] + '</option>')
    }
    $('#languageSelectorForm > select').on('change', Forum.gui.changeLanguage);
    Forum.loader.hide();
  },
  changeLanguage: function() {
    Forum.settings.displayLanguage = $('#languageSelectorForm > select').val();
    new Forum.massLoader({
      filesArray: [
        '/languages/' + Forum.settings.displayLanguage + '.json',
      ],
      readyCallback: function() {
        Forum.gettext = new Gettext({
          domain: Forum.settings.displayLanguage,
          locale_data: JSON.parse(Forum.storage.get('/languages/' + Forum.settings.displayLanguage + '.json'))
        });
        Forum.gui.initTexts();
      }
    })
  },

  initTexts: function () {
    $('[data-text="Loading, please wait ..."]').html(_('Loading, please wait ...'));
    $('[data-text="Settings"]').html(_('Settings'));
    $('[data-text="Topic list"]').html(_('Topic list'));
  },
}

var _ = $.noop;

$(document).ready(Forum.gui.start);
