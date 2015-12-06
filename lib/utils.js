var _ = require('lodash');

// Compose a prototype and a mixin
function composeMixin(proto, mixins, opts) {
    opts = _.defaults(opts || {}, {
        // List of methods that are composables
        composables: []
    });

    _.each(mixins, function(method, key) {
        var isComposable = _.contains(opts.composables, key);

        if (!isComposable || !proto[key]) {
            proto[key] = method;
        } else {
            var precedent = proto[key];
            proto[key] = function() {
                precedent.apply(this, arguments);
                method();
            };
        }
    });

    return proto;
}


module.exports = {
    composeMixin: composeMixin
};
