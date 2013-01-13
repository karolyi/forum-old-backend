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
        this.printTopics();
      } else {
        // Just show the loader
        $.when(
          Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicsLoaderTemplate.html')
          , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html')
        ).then(function(template, frameTemplate) {
          var parsedTemplate = $(template);
          var frameHolder = $(frameTemplate);
          var frameContentHolder = frameHolder.find('#frame');
          if (!frameContentHolder.length)
            frameContentHolder = frameHolder.siblings('#frame');
          if (!frameContentHolder.length)
            frameContentHolder = frameHolder;
          var loaderButton = parsedTemplate.find('#topicsLoaderButton').button({
            label: _('Load topics'),
            text: 'Load topics',
          }).data('button');
          frameContentHolder.append(parsedTemplate);
          loaderButton.element.click(function() {
            self._loadTopics();
          });
          self.buttonsArray.push(loaderButton);
          self.root.append(frameHolder);
          self.loadingScreen.hide();
        });
      }
    },

    _initLoadingScreen: function () {
      var self = this;
      this.loadingScreen = this.element.find('> #loader-wrapper').LoadingScreen({
        contentWrapper: self.root,
        fadeTime: 1000,
      }).data('LoadingScreen');
      this.loadingScreen.show();
    },

    printTopics: function() {
      var self = this;
      $.when(
        Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicGroupTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/topicElementTemplate.html')
        , Forum.storage.get('/skins/' + Forum.settings.usedSkin + '/html/frameTemplate.html')
      ).then(function(topicGroupTemplate, topicElementTemplate, frameTemplate) {
        var topicGroupLabels = {
          topicHighlighted: 'Highlighted topics',
          topicBookmarked: 'Bookmarked topics',
          topicNotBookmarked: 'Not bookmarked topics',
          topicNormal: 'Normal topics',
          topicArchived: 'Archived topics',
        };
        var topicElementArray = new Array();
        self.options.topicGroupArray.forEach(function(topicObj) {
//          console.log(topicElementTemplate);
          var topicElementHtml = $(topicElementTemplate);
          // Fill the topic image
          topicElementHtml.find('#topicName').TopicName({
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
            userObj: self.options.userListObj[topicObj.currCommentOwnerId],
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
          label.attr('data-text', topicGroupLabels[self.options.myType]);
          label.text(_(topicGroupLabels[self.options.myType]));
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
        self.root.append(frameHolder);
        self._changeLanguage();
        self.loadingScreen.hide();
      });
    },

    _changeLanguage: function() {
      this.loadingScreen.initTexts();
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
