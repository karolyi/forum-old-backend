(function($) {
  Forum.widget.topicList = {
    _create: function() {
      var self = this;
      this.options.tabLabel.html('Topic list');
      this.element.append('<div id="loader"/>');
      this.root = $('<div id="mainContentHolder"/>');
      this.element.append(this.root);
      this.loader = new Forum.widget.Loader({
        root: this.element,
        fadeTime: 1000,
      });
      $.when(
        this.loader.show()
        , Forum.codeLoader.load('Forum.widget.topicName')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.topic')
        , Forum.codeLoader.load('Forum.widget.userName')
      ).then(function() {
        self.loadTopics();
        self._changeLanguage();
      });
      this.topicGroupInstanceArray = new Array();
    },

    options: {
      tabLabel: $(this.element).siblings('ul#tabList').find('> li > a[href="#topicList"]'),
      showArchived: false,
    },

    loadTopics: function() {
      //if (Forum.settings.userSettings.showArchivedTopics)
      var self = this;
      $.when(
        $.ajax({
          url: '/api/topic/index',
          dataType: 'json',
        })
      ).then(function(topicListObj) {
        var userIdArray = new Array();
        var newTopicListObj = new Object();
        for (var topicType in topicListObj) {
          if (!newTopicListObj[topicType])
            newTopicListObj[topicType] = new Array();
          for (var elementId in topicListObj[topicType]) {
            var topicObj = topicListObj[topicType][elementId];
            newTopicListObj[topicType].push(Forum.controller.topic.set(topicObj.id, topicObj));
            var userId = topicObj['currCommentOwnerId'];
            if (userIdArray.indexOf(userId) == -1)
              userIdArray.push(userId);
            var userId = topicObj['ownerId'];
            if (userIdArray.indexOf(userId) == -1)
              userIdArray.push(userId);
          }
        }
        $.when(
          Forum.controller.user.get(userIdArray)
        ).then(function(userListObj) {
          self.printTopics(newTopicListObj, userListObj)
        });
      });
    },

    printTopics: function(topicListObj, userListObj) {
      var self = this;
      $.when(
        Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicPageTemplate.html')
        , Forum.codeLoader.load('Forum.widget.topicGroup')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicGroupTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html')
      ).then(function(topicPageTemplate) {
        var orderArray = ['topicHighlighted', 'topicBookmarked', 'topicNotBookmarked', 'topicNormal', 'topicArchived'];
        var topicPageHtml = $(topicPageTemplate);
        self.root.append(topicPageHtml);
        orderArray.forEach(function(topicGroupType) {
          var topicGroupArray = topicListObj[topicGroupType];
          var topicGroupTypeHolder = topicPageHtml.find('#' + topicGroupType);
          if (!topicGroupTypeHolder.length)
            topicGroupTypeHolder = topicPageHtml.siblings('#' + topicGroupType);
          var expand = true;
          if (topicGroupType == 'topicArchived')
            if (!Forum.settings.userSettings.showArchivedTopics)
              expand = false;
          var topicGroupInstance = topicGroupTypeHolder.TopicGroup({
            expand: expand,
            userListObj: userListObj,
            topicGroupArray: topicGroupArray,
            myType: topicGroupType,
          }).data('TopicGroup');
          self.topicGroupInstanceArray.push(topicGroupInstance);
        });
        self._changeLanguage();
        self.loader.hide();
      });
    },

    _changeLanguage: function() {
      this.options.tabLabel.html(_('Topic list'));
      this.loader.initTexts();
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
