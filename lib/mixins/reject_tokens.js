/*
Example:

widgets.mixins.rejectTokens([ 'comment' ])
*/
var _ = require('lodash');


module.exports = function(types) {
    return {
        filterMatch: function(range, props) {
            var token = this.editor.getTokenAt({ ch: range.from.ch + 1, line: range.from.line });

            if (!token || !token.type) {
                return true;
            }

            return _.every(token.type.split(' '), function(type){
                return !_.contains(types, type);
            });
        }
    };
};
