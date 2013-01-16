(function($) {
  Forum.widget.topicGroup = {
    options: {
      expand: true,
      userListObj: new Object(),
      topicGroupArray: new Array(),
      myType: '',
    },

    _create: function() {
      var self = this;
      this.element.append('<div id="loader-wrapper"/>');
      this.root = $('<div id="content-wrapper"/>');
      this.element.append(this.root);
      this.buttonsArray = new Array();
      this._initLoadingScreen();
      if (this.options.expand) {
        if (this.options.topicGroupArray.length)
          this.printTopics();
        else
          this.element.hide();

      } else {
        // Just show the loader
        $.when(
          Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicsLoaderTemplate.html')
          , this.loadingScreen.show()
        ).then(function(topicsLoaderTemplate) {
          self.root.append(topicsLoaderTemplate);
          var loaderButton = self.root.find('#button-topics-loader').button({
            label: _('Load topics'),
            text: 'Load topics',
          }).data('button');
          loaderButton.element.click(function() {
            self._loadTopics();
          });
          self.buttonsArray.push(loaderButton);
          self.loadingScreen.hide();
        });
      }
    },

    _initLoadingScreen: function () {
      var self = this;
//      console.log(this.element.find('#loader-wrapper')[0]);
      this.loadingScreen = this.element.find('#loader-wrapper').LoadingScreen({
        contentWrapper: self.root,
        fadeTime: 1000,
      }).data('LoadingScreen');
    },

    printTopics: function() {
      var self = this;
      $.when(
        Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicGroupHeaderTemplate.html')
      ).then(function(topicElementTemplate, topicGroupHeaderTemplate) {
        var topicGroupLabels = {
          topicHighlighted: 'Highlighted topics',
          topicBookmarked: 'Bookmarked topics',
          topicNotBookmarked: 'Not bookmarked topics',
          topicNormal: 'Normal topics',
          topicArchived: 'Archived topics',
        };
        var topicElementArray = new Array();
        self.options.topicGroupArray.forEach(function(topicObj) {
          var topicElementHtml = self._createTopicElement(topicObj, topicElementTemplate);
          topicElementArray.push(topicElementHtml);
        });
        if (topicElementArray.length) {
          // Topics generated in this group
          label = self.root.append(topicGroupHeaderTemplate).find('.topic-group-name-wrapper');
          label.attr('data-text', topicGroupLabels[self.options.myType]);
          label.text(_(topicGroupLabels[self.options.myType]));

          topicElementArray.forEach(function(element) {
            self.root.append(element);
          });
        }
        self._changeLanguage();
        self.loadingScreen.hide();
      });
    },

    _createTopicElement: function (topicObj, topicElementTemplate) {
      var self = this;
      var topicElementHtml = $(topicElementTemplate);
      // Fill the topic image
      topicElementHtml.find('.name').TopicName({
        topicObj: topicObj,
        display: 'htmlName',
        click: 'openTopic',
        tooltip: {
          contentId: 'currParsedCommentText',
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
      topicElementHtml.find('.comment-count').TopicName({
        topicObj: topicObj,
        display: 'commentCount',
      });
      // Fill the last comment time
      topicElementHtml.find('.last-comment-time').TopicName({
        topicObj: topicObj,
        display: 'currCommentTime',
      });
      // Fill the username
      topicElementHtml.find('.last-commenter-name').UserName({
        userObj: self.options.userListObj[topicObj.currCommentOwnerId],
        display: 'currCommentOwnerId',
      });
      return topicElementHtml;
    },

    _changeLanguage: function() {
//      this.loadingScreen.initTexts();
      this.element.find('[data-text="Topic name"]').html(_('Topic name'));
      this.element.find('[data-text="Comment count"]').html(_('Comment count'));
      this.element.find('[data-text="Last comment time"]').html(_('Last comment time'));
      this.element.find('[data-text="Last commenter name"]').html(_('Last commenter name'));
      this.buttonsArray.forEach(function (element) {
        element._setOption('label', _(element.options.text));
      });
    },
  };

  $.widget('Forum.TopicGroup', Forum.widget.topicGroup);
})(jQuery)
