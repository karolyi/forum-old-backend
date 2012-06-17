(function($) {
  Forum.widget.forumTabs = {
    tabListObj: new Object(),

    _create: function() {
      this.self = this;
      this.root = $(this.element.find('> div#contentHolder'))
      this.tabHolder = this.root.find('> div#mainTab');
      this.tabHolder.tabs().find(".ui-tabs-nav").sortable({ axis: "x" });
      this._loadGui();
      $.Widget.prototype._create.call(this);
    },

    _init: function() {
    },

    _launchTab: function(tabListObjName, options) {
      var self = this;
      $.when(Forum.codeLoader.load('Forum.widget.' + options['widgetName']))
      .then(function() {
        var closable = true;
        if (options.closable === false)
          closable = false;
        if (closable) {
          self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a> <span class="ui-icon ui-icon-close" data-text="Close tab">' + _('Close tab') + '</span></li>');
        } else {
          self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a></li>');
        }
        self.tabHolder.tabs('add', '#' + tabListObjName, options.labelName);
        var tabLabel = self.tabHolder.find('ul > li > a[href="#' + tabListObjName + '"]');
        if (closable) {
          tabLabel.siblings("span.ui-icon-close").bind( "click", function() {
            // Cut the beginnig # from the tab id
            var widgetId = tabLabel.attr('href').substr(1);
            self.tabListObj[widgetId].destroy();
            self.tabHolder.tabs('remove', widgetId);
          });
        }
        var tabContent = self.tabHolder.find('> div#' + tabListObjName + ':first');
        var widgetOptions = options.options;
        widgetOptions.labelObj = tabLabel;
//        tabContent.TopicList({labelObj:tabLabel}).data('TopicList');
        self.tabListObj[tabListObjName] = eval('tabContent.' + options['widgetName'] + '(widgetOptions).data(\'' + options['widgetName'] + '\')');
        // Open the tab, execute the widget on its content name
      })
    },

    _changeLanguage: function() {
      for (var tabName in this.tabListObj)
        this.tabListObj[tabName]._changeLanguage();
    },

    _loadGui: function() {
      var self = this;
      $.when(
        $.ajax({
          url: '/api/session/getGuiState',
          dataType: 'json',
        })
      ).then(function(guiStateObj){
        for (var tabListObjName in guiStateObj['tabList']) {
          self._launchTab(tabListObjName, guiStateObj['tabList'][tabListObjName])
        }
      });
    },

  };

  $.widget('Forum.ForumTabs', Forum.widget.forumTabs);
})(jQuery);
