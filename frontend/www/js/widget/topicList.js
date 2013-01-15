(function($) {
  Forum.widget.topicList = {
    options: {
      showArchived: false,
      tabElement: $('<li/>'),
    },

    _create: function() {
      var self = this;
      this.options.tabElement.find('a').html(_('Topic list'));
      this.element.append('<div id="loader-wrapper"/>');
      this.root = $('<div id="content-wrapper"/>');
      this.element.append(this.root);
      this.topicGroupInstanceArray = new Object();
      this._initLoadingScreen();
      $.when(
        self.loadingScreen.show()
        , Forum.codeLoader.load('Forum.widget.topicName')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.topic')
        , Forum.codeLoader.load('Forum.widget.userName')
      ).then(function() {
        self.loadTopics();
        self._changeLanguage();
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

    loadTopics: function() {
      //if (Forum.settings.userSettings.showArchivedTopics)
      var self = this;
      $.when(
        $.ajax({
          url: Forum.settings.apiHost + '/topic/index',
          dataType: 'json',
        })
      ).then(function(topicListObj) {
        var userIdArray = new Array();
        var newTopicListObj = new Object();
        for (var topicType in topicListObj) {
          if (!newTopicListObj[topicType])
            newTopicListObj[topicType] = new Array();
          topicListObj[topicType].forEach(function (topicObj, index) {
            newTopicListObj[topicType].push(Forum.controller.topic.set(topicObj.id, topicObj));
            var userId = topicObj['currCommentOwnerId'];
            if (userIdArray.indexOf(userId) == -1)
              userIdArray.push(userId);
            var userId = topicObj['ownerId'];
            if (userIdArray.indexOf(userId) == -1)
              userIdArray.push(userId);
          });
        }
        $.when(
          Forum.controller.user.get(userIdArray)
          , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicPageTemplate.html')
          , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicGroupTemplate.html')
          , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html')
          , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html')
          , Forum.codeLoader.load('Forum.widget.topicGroup')
        ).then(function(userListObj, topicPageTemplate, topicGroupTemplate) {
          self.printTopics(newTopicListObj, userListObj, topicGroupTemplate);
        });
      });
    },

    printTopics: function(topicListObj, userListObj, topicGroupTemplate) {
      var self = this;
      var orderArray = ['topicHighlighted', 'topicBookmarked', 'topicNotBookmarked', 'topicNormal', 'topicArchived'];
      var topicGroupWrappers = {
        topicHighlighted: this.root.find('#topic-highlighted-group-wrapper'),
        topicBookmarked: this.root.find('#topic-bookmarked-group-wrapper'),
        topicNotBookmarked: this.root.find('#topic-not-bookmarked-group-wrapper'),
        topicNormal: this.root.find('#topic-normal-group-wrapper'),
        topicArchived: this.root.find('#topic-archived-group-wrapper'),
      };
      orderArray.forEach(function(topicGroupType) {
        var topicGroupArray = topicListObj[topicGroupType];
        var expand = true;
        if (topicGroupType == 'topicArchived' && !Forum.settings.userSettings.showArchivedTopics)
          expand = false;
        var topicGroupHtml = $(topicGroupTemplate);

        var topicGroupInstance = topicGroupHtml.TopicGroup({
          expand: expand,
          userListObj: userListObj,
          topicGroupArray: topicGroupArray,
          myType: topicGroupType,
        }).data('TopicGroup');
        self.topicGroupInstanceArray[topicGroupType] = topicGroupInstance;
        self.root.append(topicGroupHtml);
      });
      self._changeLanguage();
      self.loadingScreen.hide();
    },

    _changeLanguage: function() {
      this.options.tabElement.find('a').html(_('Topic list'));
      this.loadingScreen.initTexts();
      this.element.find('[data-text="Highlighted topics"]').html(_('Highlighted topics'));
      this.element.find('[data-text="Bookmarked topics"]').html(_('Bookmarked topics'));
      this.element.find('[data-text="Not bookmarked topics"]').html(_('Not bookmarked topics'));
      this.element.find('[data-text="Normal topics"]').html(_('Normal topics'));
      this.element.find('[data-text="Archived topics"]').html(_('Archived topics'));
      for (var name in this.topicGroupInstanceArray)
        this.topicGroupInstanceArray[name]._changeLanguage();
    },
  };

  $.widget('Forum.TopicList', Forum.widget.topicList);
})(jQuery)
