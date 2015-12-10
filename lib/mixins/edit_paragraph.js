/*
Example:

widgets.mixins.editParagraph()
*/
var _ = require('lodash');
var utils = require('../utils');


module.exports = function() {
    return {
        findEditRange: function(range) {
            var doc = this.doc();
            var nLines = doc.lineCount();

            function findParagraph(start, direction) {
                var line = start.line;
                var content;

                do {
                    line = line + direction;
                    content = doc.getLine(line);

                } while(content && line >= 0 && line <= (nLines -1))

                return line;
            }

            return utils.Range(
                utils.Pos(findParagraph(range.from, -1), 0),
                utils.Pos(findParagraph(range.to, 1), 0)
            );
        }
    };
};
