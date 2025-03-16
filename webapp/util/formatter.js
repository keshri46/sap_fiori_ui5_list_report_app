sap.ui.define([], function() {
    "use strict";
    return {
        /**
         * Highlights the search query in the given text by wrapping it in a span with a yellow background.
         * @param {string} sText - The cell text.
         * @param {string} sQuery - The search query.
         * @returns {string} HTML string with highlighted search query.
         */
        highlight: function(sText, sQuery) {
            if (!sText || !sQuery) {
                return sText;
            }
            // Escape special regex characters in the search query
            var sEscapedQuery = sQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            // Create a case-insensitive regular expression
            var regex = new RegExp('(' + sEscapedQuery + ')', "gi");
            // Replace matches with a span tag to apply yellow background
            return sText.toString().replace(regex, '<span style="background-color:yellow">$1</span>');
        }
    };
});
