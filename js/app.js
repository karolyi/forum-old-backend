var Forum = {}, f = Forum;
Forum.widget = {};
Forum.settings = {
  cacheKey: '',
  displayLanguage: '',
  languageObj: {},
  usedSkin: '',
  timeZoneDiff: 0,
  bgImageArray: [],
};

Forum.backgroundImage = {
  _loadImageCache: new Object(),
  _imageAspectsObj: new Object(),
  _selected: null,
  _selectedBefore: null,
  _resizeTimeoutId: null,

  _getSrc: function(url) {
    var tempLink = document.createElement('a');
    tempLink.href = url;
    return tempLink.pathname;
  },

  _imageLoaded: function(imageObj) {
    var src = Forum.backgroundImage._getSrc(imageObj.src);
    // Store aspects of the background image
    Forum.backgroundImage._imageAspectsObj[src] = {
      origHeight: imageObj.height,
      origWidth: imageObj.width,
      src: imageObj.src,
    };
    Forum.backgroundImage._loadImageCache[src].resolve(src);
  },

  load: function (imageSrc) {
    if (typeof Forum.backgroundImage._loadImageCache[imageSrc] === "undefined") {

      preloader         = new Image();
      preloader.onload  = function() { Forum.backgroundImage._imageLoaded(this) };
      preloader.onerror = function() { Forum.backgroundImage._deferredObj.reject(this.src)  };
      preloader.src     = imageSrc;

      Forum.backgroundImage._loadImageCache[imageSrc] = $.Deferred();
    }
    return Forum.backgroundImage._loadImageCache[imageSrc].promise();
  },

  change: function(src) {
    var bgImage = $('#backgroundImage');
    var infoObj = Forum.backgroundImage._imageAspectsObj[src];
    bgImage.removeAttr('src');
    bgImage.attr('src', '');
    Forum.backgroundImage.resize(infoObj);
    bgImage.attr('src', infoObj['src']);
  },

  resize: function(infoObj) {
    var bgImage = $('#backgroundImage');
    if (!infoObj) {
      // Called from timer, get the current info obj
      var src = Forum.backgroundImage._getSrc(bgImage.attr('src'));
      var infoObj = Forum.backgroundImage._imageAspectsObj[src];
    }
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    // Height goes 100%
    var multiplicator = windowHeight / infoObj['origHeight'];
    var width = infoObj['origWidth'] * multiplicator;
    var height = infoObj['origHeight'] * multiplicator;
    if (width < windowWidth) {
      // Width is less than window widht, so we resize again to make width 100% and height more than 100%
      multiplicator = windowWidth / infoObj['origWidth'];
      width = infoObj['origWidth'] * multiplicator;
      height = infoObj['origHeight'] * multiplicator;
    }
    bgImage.attr('height', height);
    bgImage.attr('width', width);
  },

  prepareResize: function() {
    if (Forum.backgroundImage._resizeTimeoutId) {
      clearTimeout(Forum.backgroundImage._resizeTimeoutId);
    }
    Forum.backgroundImage._resizeTimeoutId = setTimeout(function() {
      Forum.backgroundImage.resize();
      Forum.backgroundImage._resizeTimeoutId = null;
    }, 0);
  },

  getRandomSrc: function() {
    var backgroundImagesLength = Forum.settings.bgImageArray.length;
    if (backgroundImagesLength > 1) {
      while(Forum.backgroundImage._selected === Forum.backgroundImage._selectedBefore)
        Forum.backgroundImage._selected = Math.floor(Math.random() * backgroundImagesLength);
      Forum.backgroundImage._selectedBefore = Forum.backgroundImage._selected;
    } else {
      Forum.backgroundImage._selected = 0;
      Forum.backgroundImage._selectedBefore = 0;
    }
    return Forum.settings.bgImageArray[Forum.backgroundImage._selected];
  },
}

Forum.storage = {
  _storage: new Object(),

  deferObj: function(key) {
    // Function for loading files when not in local storage or in the variable scope
    var dfd = $.Deferred();
    var key;

    this.load = function(key) {
      $.ajax({
        url: key + '?_=' + (new Date()).getTime(),
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

Forum.date = {
  _currTime: 0,
  _timeZoneSecsDiff: 0,
  _unixTimes: {},
  _updateTimeoutId: null,

  init: function() {
    // console.log((new Date()).getTimezoneOffset());
    var myTimeZone = (new Date()).getTimezoneOffset();
    this._timeZoneSecsDiff = (myTimeZone + Forum.settings.timeZoneDiff) * 60;
    dateFormat.i18n = {
      dayNames: [
        _("Sun"), _("Mon"), _("Tue"), _("Wed"), _("Thu"), _("Fri"), _("Sat"),
        _('Sunday'), _('Monday'), _('Tuesday'), _('Wednesday'), _('Thursday'), _('Friday'), _('Saturday')
      ],
      monthNames: [
        _("Jan"), _("Feb"), _("Mar"), _("Apr"), _("May_short"), _("Jun"), _("Jul"), _("Aug"), _("Sep"), _("Oct"), _("Nov"), _("Dec"),
        _('January'), _('February'), _('March'), _('April'), _('May'), _('June'), _('July'), _('August'), _('September'), _('October'), _('November'), _('December')
      ]
    };
    this.doUpdate();
  },

  calculateUnixTimes: function() {
    var nowDate = new Date();
    this._unixTimes['currTime'] = nowDate;
    this._unixTimes['thisYearBegin'] = new Date(nowDate.getFullYear(), 0, 1, 0, 0, 0);
    this._unixTimes['todayBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
    this._unixTimes['yesterdayBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1, 0, 0, 0);
    this._unixTimes['fourDaysBeforeBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 3, 0, 0, 0);
    this._unixTimes['oneDayBeforeBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1, nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds());
    for (key in this._unixTimes)
      this._unixTimes[key] = Math.floor(this._unixTimes[key].getTime() / 1000);
  },

  doUpdate: function() {
    if (Forum.date._updateTimeoutId)
      clearTimeout(Forum.date._updateTimeoutId);
    var nowDate = new Date();
    var nextMinute = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), nowDate.getHours(), nowDate.getMinutes(), 60);
    var millisecs = nextMinute - nowDate;
    Forum.date._updateTimeoutId = setTimeout('Forum.date.doUpdate()', millisecs + 500); // Plus 500 for safety
    Forum.date.calculateUnixTimes();
    $('[data-time]').each(Forum.date.updateOneElement);
  },

  longDate:function(time) {
    var thatTime = (new Date()).setTime(time * 1000);
    return dateFormat(thatTime, _('dddd, mmmm dd, yyyy, HH:MM:ss Zo'))
  },

  shortDate: function(time) {
    var timeWithTimeZone = time + this._timeZoneSecsDiff; // Can be that its a subtraction, really
    var difference = this._unixTimes['currTime'] - timeWithTimeZone;
    var thatTime = (new Date()).setTime(time * 1000);
    if (difference < 60)
      return _('less then a minute ago');
    if (difference < 3600)
      return sprintf(Forum.gettext.ngettext('%d minutes ago', '%s minutes ago'), Math.floor(difference / 60));
    if (difference > 3600 && difference < 7200)
      return _('about an hour ago');
    if (timeWithTimeZone > this._unixTimes['oneDayBeforeBegin']) {
      // Calculate hours difference
      var hourValue = Math.floor((this._unixTimes['currTime'] - timeWithTimeZone) / 3600);
      return sprintf(Forum.gettext.ngettext('%d hours ago', '%s hours ago', hourValue), hourValue);
    }
    if (timeWithTimeZone > this._unixTimes['yesterdayBegin'])
      return dateFormat(thatTime, _('"Yesterday at" H:MM'));
    if (timeWithTimeZone > this._unixTimes['fourDaysBeforeBegin'])
      return dateFormat(thatTime, _('ddd "at" H:MM'));
    if (timeWithTimeZone > this._unixTimes['thisYearBegin'])
      return dateFormat(thatTime, _('mmm d "at" H:MM'));
    return dateFormat(thatTime, _('mmmm d, yyyy'));
  },

  updateOneElement: function(key, element) {
    element = $(element);
    var time = element.data('time');
    var shortDate = Forum.date.shortDate(time);
    var longDate = Forum.date.longDate(time);
    element.html(shortDate);
    element.data('mouseover', longDate)
  },

  updateDomPart: function(domRoot) {
    if (!domRoot)
      var domRoot = $(document);
    this.calculateUnixTimes();
    domRoot.find('[data-time]').each(Forum.date.updateOneElement);
  },
}

Forum.widget.TopicList = function(options){
  var domRoot;
  var frameTemplate, topicGroupTemplate, topicElementTemplate, topicPageTemplate, topicUserTemplate;
  this.init = function(options) {
    try {
      domRoot = options['domRoot'];
    } catch (err) {
      domRoot = $(document);
    }
    if (!Forum.gui._languageHookObj['TopicList'])
      Forum.gui._languageHookObj['TopicList'] = initTexts;
    $.when(
      $.ajax({
        url: '/api/topic',
        dataType: 'json',
      }),
      Forum.storage.getDeferred('/skins/' + Forum.settings.usedSkin + '/html/topicGroupTemplate.html'),
      Forum.storage.getDeferred('/skins/' + Forum.settings.usedSkin + '/html/topicPageTemplate.html'),
      Forum.storage.getDeferred('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html'),
      Forum.storage.getDeferred('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html'),
      Forum.storage.getDeferred('/skins/' + Forum.settings.usedSkin + '/html/topicUserTemplate.html')
    ).then(function(data, res1, res2, res3, res4, res5) {
      topicGroupTemplate = res1;
      topicPageTemplate = res2;
      topicElementTemplate = res3;
      frameTemplate = res4;
      topicUserTemplate = res5;
      initTopics(data[0]);
    });
  };

  var parseTopicList = function(topicListArray) {
    var topicListHtml = '';
    for (var element in topicListArray) {
      var currentElement = topicListArray[element];
      var lastCommenterDiv = topicUserTemplate
      .replace('{{userName}}', currentElement['currCommentUser']['name'])
      .replace('{{userId}}', currentElement['currCommentUser']['id']);
      var currentTopic = topicElementTemplate
      .replace('{{topicId}}', currentElement['topicId'])
      .replace('{{commentCount}}', currentElement['commentCount'])
      .replace('{{topicName}}', currentElement['htmlName'])
      .replace('{{lastCommentTime}}', currentElement['currCommentTime'])
      .replace('{{lastCommenterDiv}}', lastCommenterDiv);
      topicListHtml += currentTopic;
    }
    return topicListHtml;
  };

  var initScripts = function() {
    Forum.date.updateDomPart(domRoot);
    domRoot.find('div#topicGroup table#topicTable tbody tr#topicHeader').on('mouseover', function() {$(this).addClass('mouseover')});
    domRoot.find('div#topicGroup table#topicTable tbody tr#topicHeader').on('mouseout', function() {$(this).removeClass('mouseover')});
    domRoot.find('div#topicGroup table#topicTable tbody tr#topicHeader').on('mouseout', function() {$(this).removeClass('mouseover')});
  };

  var initTopics = function(topicDataArray) {
    var topicTypeArray = ['topicHighlighted', 'topicNormal', 'topicBookmarked', 'topicNotBookmarked', 'topicArchived'];
    var topicGroupNameArray = ['Highlighted topics', 'Normal topics', 'Bookmarked topics', 'Not bookmarked topics', 'Archived topics'];
    var topicHtml = topicPageTemplate;
    for (var element in topicTypeArray) {
      var topicType = topicTypeArray[element];
      var parsedTopicHtml = parseTopicList(topicDataArray[topicType]);
      var htmlWithFrame = '';
      if (parsedTopicHtml != '') {
        var topicGroupHtml = topicGroupTemplate
          .replace('{{topicGroupName}}', topicGroupNameArray[element])
          .replace('{{topicElements}}', parsedTopicHtml);
        var htmlWithFrame = frameTemplate.replace('{{content}}', topicGroupHtml);
      }
      topicHtml = topicHtml.replace('{{' + topicType + '}}', htmlWithFrame);
    }
    domRoot.html(topicHtml);
    initScripts();
    initTexts();
    Forum.loader.hide();
  };

  var initTexts = function(actDomRoot) {
    if (!actDomRoot)
      actDomRoot = domRoot;
    actDomRoot.find('[data-text="Reload topic list"]').html(_('Reload topic list'));
    actDomRoot.find('[data-text="Highlighted topics"]').html(_('Highlighted topics'));
    actDomRoot.find('[data-text="Normal topics"]').html(_('Normal topics'));
    actDomRoot.find('[data-text="Bookmarked topics"]').html(_('Bookmarked topics'));
    actDomRoot.find('[data-text="Not bookmarked topics"]').html(_('Not bookmarked topics'));
    actDomRoot.find('[data-text="Archived topics"]').html(_('Archived topics'));
    actDomRoot.find('[data-text="Topic name"]').html(_('Topic name'));
    actDomRoot.find('[data-text="Comment count"]').html(_('Comment count'));
    actDomRoot.find('[data-text="Last comment time"]').html(_('Last comment time'));
    actDomRoot.find('[data-text="Last commenter name"]').html(_('Last commenter name'));
//    actDomRoot.find('[data-text=""]').html(_(''));
  };

  return this.init(options);
};

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
  _languageHookObj: new Object(),
  _tabList: new Object(),

  init: function() {
    if ($.jStorage.get('cacheKey') != Forum.settings.cacheKey) {
      $.jStorage.flush();
      $.jStorage.set('cacheKey', Forum.settings.cacheKey);
    }
    $.when(
      Forum.storage.getDeferred('/languages/' + Forum.settings.displayLanguage + '.json'),
      Forum.backgroundImage.load(Forum.backgroundImage.getRandomSrc())
    ).then(function(res1, res2) {
      Forum.backgroundImage.change(res2);
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

  initTabContent: function(tabName, options) {
    if (options['moduleName'] = 'topicList') {
      Forum.gui._tabList[tabName] = new Forum.widget.TopicList(options['options']);
    }
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
      Forum.date.init();
    });
  },

  initTexts: function (domRoot) {
    if (!domRoot)
      domRoot = $(document);
    domRoot.find('[data-text="Loading, please wait ..."]').html(_('Loading, please wait ...'));
    domRoot.find('[data-text="Settings"]').html(_('Settings'));
    domRoot.find('[data-text="Topic list"]').html(_('Topic list'));
    for (key in Forum.gui._languageHookObj)
      Forum.gui._languageHookObj[key](domRoot);
  },

  launch: function() {
    $(window).resize(function(eventObj) {
      Forum.backgroundImage.prepareResize(eventObj);
    });
    setInterval(function() {
      var newSrc = Forum.backgroundImage.getRandomSrc();
      $.when(Forum.backgroundImage.load(newSrc))
      .then(function(src){
        Forum.backgroundImage.change(src);
      });
    }, 5 * 60 * 1000);
    Forum.gettext = new Gettext({
      domain: Forum.settings.displayLanguage,
      locale_data: JSON.parse(Forum.storage.get('/languages/' + Forum.settings.displayLanguage + '.json'))
    });
    _ = function(msgid) {
      return Forum.gettext.gettext(msgid);
    }
    Forum.gui.initTexts();
//    $('#mainTab').tabs({fx: { opacity: 'toggle' }}).find( ".ui-tabs-nav" ).sortable({ axis: "x" });
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
    Forum.gui.initTabContent('topicListTab', {
      moduleName:'topicList',
      options: {
        domRoot: $('#topicListTab'),
      }
    });
    Forum.date.init();
  },
}

var _ = $.noop;

$(document).ready(Forum.gui.init);
