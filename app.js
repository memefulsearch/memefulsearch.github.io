(function ($) {
"strict"

    var default_options = {
        selector: '#app-root',
        resultsSelector: '.results',
        searchButtonSelector: 'button.btn#go-search',
        inputSelector: 'input[type=text]#search-field',
		helpSelector: 'div.alert#help',
        errorFeedbackSelector: '.invalid-feedback',
        noResultsClass: 'is-invalid',
        showIfLessThan: 30,
        showIfSearchLonger: 5,
        template:
		'<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch result-card">' +
            '<div class="card">' +
                '<img class="card-img-top" src="#url#" title="#tags#" alt="#tags#">' +
                '<div class="card-body">' +
                    '<a href="#url#" target="_new" onclick="return app.copy(this, \'#url#\');" class="btn btn-light col-12">' +
                        'Copy URL' +
                    '</a>' +
			        '<p class="card-text" style="margin-top: 15px;"><small class="text-muted">#tags#</small></p>'+
                '</>' +
            '</div>' +
        '</div>',
        copyContainerSelector: '.copy-container',
        copiedClass: 'bg-success text-white',
        showCopyClass: 'show',
        absoluteMinimumSearchChars: 2,
        absoluteMinimumSearchResults: 50
    };

    mobileAndTabletcheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };

    var datafilter = {
        data: data,
        synonyms: synonyms,

        filter: function (text) {
            var results = [];
            this.data.forEach(function (entry) {
                var tags = entry[1];
                var re = [text, text.replace(/\s+/g, '')];

                for (var i = 0; i < re.length; i++) {
                    if (tags.match(re[i])) {
                        results.push(entry);
                        break;
                    }
                }
            });

            return results;
        },

        processSynonyms: function () {
            var that = this;
            this.synonyms.forEach(function (synonym) {
                that.data.forEach(function (item, idx) {
                    if (synonym[1].test(item[1])) {
                        that.data[idx][1] += ', ' + synonym[0];
                    }
                });
            });
        }
    };

    function app(options) {
        this.options = $.extend({}, default_options, options);

        this.initUI();
        this.loadHelp();
        //this.focusAlways();
        this.searchInput.focus();
    }

    app.prototype = {
        initUI: function () {
            this.container = $(this.options.selector);
            this.errorFeedback = $(this.options.errorFeedbackSelector);
            this.searchButton = $(this.options.searchButtonSelector);
            this.searchInput = this.container.find(this.options.inputSelector);
            this.resultsContainer = this.container.find(this.options.resultsSelector);
            this.searchInput.on('keyup change', this.loadResults.bind(this, this.searchInput));
			this.searchButton.on('click', this.loadResults.bind(this, this.searchInput));
			this.copyContainer = $(this.options.copyContainerSelector);
            this.copyInput = this.copyContainer.find('input');
            this.copyInput.blur(this.hideCopyScreen.bind(this));
            this.copyInput.keyup(this.hideCopyScreen.bind(this));
            this.isMobile = mobileAndTabletcheck();
            this.help = $(this.options.helpSelector);
            datafilter.processSynonyms();
        },

        loadResults: function(searchInput, e){
			this.resetNoResults();
			if (e.keyCode == 27) {
				this.resetSearch();
			}
			this.text = searchInput.val().toString().toLowerCase();
			var results = datafilter.filter(this.text);

			if (results.length > 0 && (
				this.text.length > this.options.absoluteMinimumSearchChars
				|| results.length < this.options.absoluteMinimumSearchResults
			)) {
				if (results.length < this.options.showIfLessThan || this.text.length > this.options.showIfSearchLonger || e.keyCode == 13 || e.type == 'click') {
					this.displayResults(results);
				}
			} else if (results.length === 0) {
				this.setNoResults();
			}
        },
		loadHelp: function(){
        	this.help.html('<i class="fa fa-fw fa-info-circle"></i> Search will automatically show results if there is either less than '+ this.options.showIfLessThan +' memes found, or if searched text is longer than '+ this.options.showIfSearchLonger +' characters... or if you just press Enter/Button!');
		},
        setNoResults: function () {
            console.log('no results');
            ga('send', {
              hitType: 'event',
              eventCategory: 'Search',
              eventAction: 'noResults',
              eventLabel: this.text
            });
            this.errorFeedback.html('No meme found for this phrase :(');
            this.searchInput.addClass(this.options.noResultsClass);
			this.resultsContainer.html('');
        },
        resetNoResults: function () {
            this.searchInput.removeClass(this.options.noResultsClass);
        },
        resetSearch: function () {
            this.searchInput.val('');
            this.resultsContainer.html('');
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

            this.searchInput.blur();
            this.searchInput.focus();
        },

        addResult: function (result) {
            var html = this.options.template
                .replace(/#url#/g, result[0])
                .replace(/#tags#/g, result[1]);

            $('<div>').html(html).find('>*').appendTo(this.resultsContainer);
        },

        copy: function (target, url) {
            var isnative = "NO";

            this.copyContainer.addClass(this.options.showCopyClass);
            this.copyInput.val(url).focus().select();
            if (this.copyNative()) {
                this.hideCopyScreen();
                target = $(target);
                target.addClass(this.options.copiedClass);
                setTimeout(target.removeClass.bind(target, this.options.copiedClass), 800);
                isnative = "YES";
            }

            ga('send', {
              hitType: 'event',
              eventCategory: 'Copy',
              eventAction: isnative,
              eventLabel: this.text
            });
            return false;
        },

        hideCopyScreen: function () {
            this.copyContainer.removeClass(this.options.showCopyClass);
            // if (!this.isMobile) {
            //     this.searchInput.focus();
            // }
        },

        copyNative: function (text) {
            return document.execCommand("copy");
        }
    };

    $(document).ready(function () {

        var instance = new app();
        window.app = instance;
    });

})(jQuery);