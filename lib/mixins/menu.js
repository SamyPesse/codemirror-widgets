var _ = require('lodash');

module.exports = function(opts) {
    opts = _.defaults(opts || {}, {
        entries: [
            {
                label: 'Edit',
                click: function(w) {
                    w.enter();
                }
            }
        ]
    });

    return {

    };
};