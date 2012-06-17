(function($) {
  Forum.widget.topicList = {
    _create: function() {
      var self = this;
      this.options.labelObj.html('Topic list');
      this.element.append('<div id="loader"/>');
      this.root = $('<div id="mainContentHolder">');
      this.element.append(this.root);
      this.loader = new Forum.widget.Loader({
        root: this.element,
        fadeTime: 1000,
      });
      $.when(
        this.loader.show()
        , Forum.codeLoader.load('Forum.widget.TopicName')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.topic')
      ).then(function() {
        self.loadTopics();
        self._changeLanguage();
      });
    },

    options: {
      labelObj: $(this.element).siblings('ul#tabList').find('> li > a[href="#topicList'),
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
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicGroupTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html')
      ).then(function(topicPageTemplate, topicGroupTemplate, topicElementTemplate, frameTemplate) {
        var orderArray = ['topicHighlighted', 'topicBookmarked', 'topicNotBookmarked', 'topicNormal', 'topicArchived'];
        var topicGroupLabels = {
          topicHighlighted: 'Highlighted topics',
          topicBookmarked: 'Bookmarked topics',
          topicNotBookmarked: 'Not bookmarked topics',
          topicNormal: 'Normal topics',
          topicArchived: 'Archived topics',
        };
        var topicPageHtml = $(topicPageTemplate);
        orderArray.forEach(function(topicGroupType) {
          var topicGroupArray = topicListObj[topicGroupType];
          var topicElementArray = new Array();
          topicGroupArray.forEach(function(topicObj) {
            var topicElementHtml = $(topicElementTemplate);
            // Fill the topic image
            topicElementHtml.find('#topicName').TopicName({
              topicObj: topicObj,
              display: 'htmlName',
              tooltip: {
                content: 'currParsedCommentText',
                position: {
                  my: 'left center',
                  at: 'right center',
                },
                style: {
                  classes: 'ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-light ui-tooltip-forum',
                },
              },
            });
            // Fill the comment count
            topicElementHtml.find('#commentCount').TopicName({
              topicObj: topicObj,
              display: 'commentCount',
            });
            // Fill the last comment time
            topicElementHtml.find('#currCommentTime').TopicName({
              topicObj: topicObj,
              display: 'currCommentTime',
            });
            // Fill the username
            topicElementHtml.find('#currCommentOwnerId').UserName({
              userObj: userListObj[topicObj.currCommentOwnerId],
              display: 'currCommentOwnerId',
            });
            topicElementArray.push(topicElementHtml);
          });
          //  console.log(topicElementArray);
          if (topicElementArray.length) {
            // Topics generated in this group
            var topicGroupHtml = $(topicGroupTemplate);
            var label = topicGroupHtml.find('#topicLabel');
            if (!label.length)
              label = topicGroupHtml.siblings('#topicLabel');
            label.attr('data-text', topicGroupLabels[topicGroupType]);
            var topicElementsHolder = topicGroupHtml.find('#topicElementsHolder')
            topicElementArray.forEach(function(element) {
              topicElementsHolder.append(element);
            });
            var frameHolder = $(frameTemplate);
            var frameContentHolder = frameHolder.find('#frame');
            if (!frameContentHolder.length)
              frameContentHolder = frameHolder.siblings('#frame');
            if (!frameContentHolder.length)
              frameContentHolder = frameHolder;
            frameContentHolder.append(topicGroupHtml);
          } else {
            var frameHolder = $('');
            // No topics generated in this group
          }
          var topicGroupTypeHolder = topicPageHtml.find('#' + topicGroupType);
          if (!topicGroupTypeHolder.length)
            topicGroupTypeHolder = topicPageHtml.siblings('#' + topicGroupType);
          topicGroupTypeHolder.append(frameHolder);
        });
        self.root.append(topicPageHtml);
        self._changeLanguage();
        self.loader.hide();
      });
    },

    _changeLanguage: function() {
      this.options.labelObj.html(_('Topic list'));
      this.loader.initTexts();
      this.element.find('[data-text="Topic list"]').html(_('Topic list'));
      this.element.find('[data-text="Topic name"]').html(_('Topic name'));
      this.element.find('[data-text="Comment count"]').html(_('Comment count'));
      this.element.find('[data-text="Last comment time"]').html(_('Last comment time'));
      this.element.find('[data-text="Last commenter name"]').html(_('Last commenter name'));
      this.element.find('[data-text="Highlighted topics"]').html(_('Highlighted topics'));
      this.element.find('[data-text="Bookmarked topics"]').html(_('Bookmarked topics'));
      this.element.find('[data-text="Not bookmarked topics"]').html(_('Not bookmarked topics'));
      this.element.find('[data-text="Normal topics"]').html(_('Normal topics'));
      this.element.find('[data-text="Archived topics"]').html(_('Archived topics'));
    },
  };

  $.widget('Forum.TopicList', Forum.widget.topicList);
})(jQuery)
