var Forum = new Object(), f = Forum;
Forum.widget = new Object;
Forum.settings = {
  cacheKey: '',
  displayLanguage: '',
  languageObj: {},
};
Forum.storage = {
  _storage: new Object(),

  set: function(key, value, callback) {
    Forum.storage._storage[key] = value;
    if (typeof(callback) == 'object') {
      var functionObj = callback['functionObj'];
      var options = callback['options'];
      if (functionObj)
        functionObj(options);
    }
  },

  get: function(key) {
    return Forum.storage._storage[key];
  },

  load: function(options) {
    var key = options['key'];
    var callback = options['callback'];
    if (!Forum.storage._storage[key]) {
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
      if (typeof(callback) == 'object') {
        var functionObj = callback['functionObj'];
        var options = callback['options'];
        if (functionObj)
          functionObj(options);
      }
    }
  },
};

Forum.MassExecuter = function(funcArray, readyCallback) {
  var instance = this;
  this.init = function(funcArray, readyCallback) {
    this.funcArray = new Array();
    this.readyCallback = readyCallback;

    count = 0;
    for (element in funcArray) {
        funcArray[element]['funcNumber'] = count;
        this.funcArray.push(count);
        count++;
    }

    for (element in funcArray) {
      // Setup the function call
      var funcNumber = funcArray[element]['funcNumber'];
      var functionObj = funcArray[element]['run'];
      var options = funcArray[element]['options'];
      options['callback'] = {
        functionObj: this.oneFinishCallback,
        options: {
          funcNumber: funcNumber,
          scope: this,
        },
      }
      functionObj(options);
    }
  };

  this.oneFinishCallback = function(options) {
    var scope = options['scope'];
    scope.funcArray.pop(scope.funcArray.indexOf(options['funcNumber']))
    if (!scope.funcArray.length) {
      // All loading finished, call the readyCallback
      scope.readyCallback()
    }
  };
  
  this.init(funcArray, readyCallback);
}


Forum.widget.Base = function() {
  this.init = function() {
    this.options = options;
  };

  this.ready = function() {
    if (this.options['callback']) {
      // Call the ready callback
      var functionObj = this.options['callback']['functionObj'];
      var options = this.options['callback']['options'];
      functionObj(options);
    }
  };
};

// FIXME
Forum.widget.TopicList = function(){
  this.init = function() {

  }
};
Forum.widget.TopicList.prototype = new Forum.widget.Base();

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
  languageHookObj: new Object(),
  tabList: {
    'settingsTab': null,
    'topicListTab': null,
  },

  start: function() {
    if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
      $.jStorage.flush();
      $.jStorage.set('cacheKey', Forum.settings.cacheKey);
    }
    new Forum.MassExecuter([
      {
        run: Forum.storage.load,
        options: {
          key: '/languages/' + Forum.settings.displayLanguage + '.json'
        },
      },
      {
        run: Forum.storage.load,
        options: {
          key: '/html/topicGroup.html'
        },
      },
    ], Forum.gui.launch);
  },

  closeTab: function(tabName) {
    // Remove the # character from the href
    tabName = tabName.substr(1);
    var mainTab = $('#mainTab');
    mainTab.tabs("remove", tabName);
  },

  addTab: function(options) {
    var mainTab = $('#mainTab');
    if (options['closable']) {
      mainTab.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a> <span class="ui-icon ui-icon-close" data-text="Close tab">' + _('Close tab') + '</span></li>');
    } else {
      mainTab.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a></li>');
    }
    mainTab.tabs('add', options['tabId'], options['tabName']);
    $('[data-text="' + options['tabName'] + '"]').html(Forum.gettext.gettext(options['tabName']));
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
    $('#mainTab').tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
    for (key in Forum.settings.languageObj) {
      selected = '';
      if (key == Forum.settings.displayLanguage)
        selected = ' selected="selected"';
      $('#languageSelectorForm > select').append('<option value="' + key + '"' +  selected + '>' + Forum.settings.languageObj[key] + '</option>')
    }
    $( "#mainTab span.ui-icon-close" ).live( "click", function() {
      var tabName = $(this).parent().find('a:first').attr('href');
      Forum.gui.closeTab(tabName);
    });
    $('#languageSelectorForm > select').on('change', Forum.gui.changeLanguage);
    $('#mainTab').tabs('select', 'topicListTab');
    Forum.gui.tabList['topicListTab'] = new Forum.widget.TopicList();
    Forum.loader.hide();
  },

  changeLanguage: function() {
    Forum.settings.displayLanguage = $('#languageSelectorForm > select').val();
    new Forum.MassExecuter([
      {
        run: Forum.storage.load,
        options: {
          key: '/languages/' + Forum.settings.displayLanguage + '.json'
        },
      },
    ], function() {
      Forum.gettext = new Gettext({
        domain: Forum.settings.displayLanguage,
        locale_data: JSON.parse(Forum.storage.get('/languages/' + Forum.settings.displayLanguage + '.json'))
      });
      Forum.gui.initTexts();
    })
  },

  initTexts: function () {
    $('[data-text="Loading, please wait ..."]').html(_('Loading, please wait ...'));
    $('[data-text="Settings"]').html(_('Settings'));
    $('[data-text="Topic list"]').html(_('Topic list'));
    for (key in Forum.gui.languageHookObj)
      Forum.gui.languageHookObj[key]();
  },
}

var _ = $.noop;

$(document).ready(Forum.gui.start);
