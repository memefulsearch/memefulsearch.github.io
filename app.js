(function ($) {
"strict"
        
    var default_options = {
        selector: '#app-root',
        resultsSelector: '.results',
        inputSelector: 'input[type=text]',
        noResultsClass: 'no-results',
        showIfLessThan: 30,
        showIfSearchLonger: 5,
        template: 
        '<div>' + 
            '<a href="#url#" target="_new"><img src="#url#" title="#tags#" alt="#tags#"/></a>' + 
            '<div>#tags#</div>' +
        '</div>',
    }

    var datafilter = {
        data: data,

        filter: function (text) {
            var results = [];
            this.data.forEach(function (entry) {
                var tags = entry[1];
                var re = [text, text.replace(/\s+/, '')];

                for (var i = 0; i < re.length; i++) {
                    if (tags.match(re[i])) {
                        results.push(entry);
                        break;
                    }
                }
            });

            return results;
        }
    };

    function app(options) {
        this.options = $.extend({}, default_options, options);

        this.initUI();
        this.focusAlways();
    }

    app.prototype = {
        initUI: function () {
            this.container = $(this.options.selector);
            this.searchInput = this.container.find(this.options.inputSelector);
            this.resultsContainer = this.container.find(this.options.resultsSelector);
            this.searchInput.on('keyup change', this.onchange.bind(this));
        },

        setNoResults: function () {
            console.log('no results');
            ga('send', {
              hitType: 'event',
              eventCategory: 'Search',
              eventAction: 'noResults',
              eventLabel: this.text
            });
            this.container.addClass(this.options.noResultsClass);
        },
        resetNoResults: function () {
            this.container.removeClass(this.options.noResultsClass);
        },
        resetSearch: function () {

            this.searchInput.val('');
            this.resultsContainer.html('');
        },

        onchange: function (e) {
            this.resetNoResults();
            if (e.keyCode == 27) {
                this.resetSearch();
            }

            this.text = this.searchInput.val().toString().toLowerCase();
            var results = datafilter.filter(this.text);

            if (results.length > 0) {
                if (results.length < this.options.showIfLessThan || this.text.length > this.options.showIfSearchLonger || e.keyCode == 13) {
                    this.displayResults(results);
                } 
            } else if (results.length === 0) {
                this.setNoResults();
            }
        },

        focusAlways: function () {
            var theinput = this.searchInput;
            setInterval(function () { theinput.focus(); }, 100);
        },

        displayResults: function (results) {
            this.resultsContainer.html('');
            results.forEach(this.addResult.bind(this));
            ga('send', {
              hitType: 'event',
              eventCategory: 'Search',
              eventAction: 'displayResults',
              eventLabel: this.text
            });
        },

        addResult: function (result) {
            var html = this.options.template
                .replace(/#url#/g, result[0])
                .replace(/#tags#/g, result[1]);

            $('<div>').html(html).find('>*').appendTo(this.resultsContainer);
        }
    };    

    $(document).ready(function () {

        var instance = new app();
    });

})(jQuery);