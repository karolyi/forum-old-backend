var Forum = {}, f = Forum;
Forum.widget = {};
Forum.settings = {
  cacheKey: '',
  displayLanguage: '',
  languageObj: {},
};
Forum.storage = {
  _storage: new Object(),

  deferObj: function(key) {
    // Function for loading files when not in local storage or in the variable scope
    var dfd = $.Deferred();
    var key;

    this.load = function(key) {
      $.ajax({
        url: key,
        success: this.setKey
      });
      this.key = key;
      return dfd.promise();
    };

    this.setKey = function(data, textStatus, jqXHR) {
      Forum.storage.set(key, data);
      dfd.resolve(data);
    };

    return this.load(key);
  },

  set: function(key, value) {
    Forum.storage._storage[key] = value;
    $.jStorage.set(key, value);
  },

  get: function(key) {
    var value = Forum.storage._storage[key];
    if (!value)
      value = $.jStorage.get(key);
    return value;
  },

  getDeferred: function(key) {
    var value = Forum.storage._storage[key];
    if (!value) {
      // Key does not exist, load from local storage
      var value = $.jStorage.get(key);
      if (value) {
        // console.log('key in local storage');
        Forum.storage.set(key, value);
      } else {
        // Key not in local storage, load from server
        return this.deferObj(key);
      }
    }
    return $.Deferred().resolve(value);
  },
};

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
}

// FIXME
Forum.widget.TopicList = function(){
  this.init = function() {
    Forum.gui.initTexts();
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

  init: function() {
    if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
      $.jStorage.flush();
      $.jStorage.set('cacheKey', Forum.settings.cacheKey);
    }
    $.when(
      Forum.storage.getDeferred('/languages/' + Forum.settings.displayLanguage + '.json'),
      Forum.storage.getDeferred('/html/topicGroup.html')
    ).then(function(res1, res2) {
      Forum.gui.launch();
    });
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
    var localeUrl = '/languages/' + Forum.settings.displayLanguage + '.json';
    $.when(
      Forum.storage.getDeferred(localeUrl)
    ).then(function(localeData) {
      Forum.gettext = new Gettext({
        domain: Forum.settings.displayLanguage,
        locale_data: JSON.parse(localeData)
      });
      Forum.gui.initTexts();
    });
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

$(document).ready(Forum.gui.init);
