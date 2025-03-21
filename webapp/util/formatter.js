sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (date) {
            if (!date) {
                return "";
            }
            // Create a date instance (if not already a Date object)
            var oDate = new Date(date);
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormat.format(oDate);
        },

        /**
         * Formatter for highlighting matched search terms.
         * 'sText' is the original text, 'sSearchTerm' is the term to highlight.
         */
        highlightSearch: function (sText, sSearchTerm) {
            if (!sSearchTerm || !sText) {
                return sText;
            }
            // Escape special characters in search term if needed.
            var re = new RegExp("(" + sSearchTerm + ")", "gi");
            return sText.replace(re, "<span style='background-color: yellow'>$1</span>");
        },
        /**
         * Concatenates an array of OrderIDs into a single string.
         * @param {Array} aOrderIDs - Array of OrderID values.
         * @returns {String} Comma-separated OrderIDs.
         */
        concatOrderIDs: function (aOrderIDs) {
            if (!aOrderIDs || !Array.isArray(aOrderIDs)) {
                return "";
            }
            return aOrderIDs.join(", ");
        }
    };
});
