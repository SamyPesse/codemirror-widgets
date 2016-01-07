/*
Example:

widgets.mixins.rejectTokens([ 'comment' ])
*/
var _ = require('lodash');


module.exports = function(types) {
    return {
        filterMatch: function(range, props) {
            var token = this.editor.getTokenAt(range.from);

            if (!token || !token.type) {
                return true;
            }

            return !_.some(token.type.split(' '), function(type){
                return _.contains(types, token.type);
            });
        }
    };
};
