
/*
Example:

widgets.mixins.re(/\$\$([^$]+)\$\$/g, function(match) {
    return {
        props: {
            text: match[1]
        }
    };
})
*/


module.exports = function(re, fn) {
    return {
        find: function(text) {
            var matches = [], found;

            re.lastIndex = 0;

            while ((found = re.exec(text)) && found) {
                var token = fn(found);
                if (!token) continue;
                token.start = token.start || 0;

                matches.push({
                    start: found.index + token.start,
                    end: found.index + found[0].length,
                    props: token.props
                });
            }

            return matches;
        }
    };
};
