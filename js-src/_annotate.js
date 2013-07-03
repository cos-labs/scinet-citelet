/*
 * @module Annotate
 * @author jmcarp
 */

var Annotate = (function() {

    /*
     *
     */
    function shallow_equals(obj1, obj2) {

        for (key in obj2) {
            if (typeof(obj1[key]) === 'undefined')
                return false;
        }

        for (key in obj1) {
            if (obj1[key] !== obj2[key])
                return false
        }

        return true;

    }

    /*
     *
     */
    function Annotation(name, context, properties, meta) {

        // Memorize name
        this.name = name;

        // Memorize arguments || default values
        this.context = context || '';
        this.properties = properties || {};
        this.meta = meta || {};

    }

    Annotation.prototype.equals = function(other) {
        return this.name == other.name &&
            shallow_equals(this.properties, other.properties)
    }

    /*
     *
     *
     */
    function Annotator(name) {

        // Memorize name
        this.name = name;

        // Add to Annotator registry
        Annotator.registry[name] = this;

    }

    // Initialize Annotator registry
    Annotator.registry = {};

    /*
     *
     */
    function ArbitAnnotator(name, fun) {

        // Memorize function
        this.annotate = fun;

        // Call superclass constructor
        Annotator.call(this, name);

    }
    ArbitAnnotator.prototype = new Annotator;
    ArbitAnnotator.constructor = ArbitAnnotator;

    /*
     *
     */
    function RegexAnnotator(name, patterns, groups) {

        // Memorize arguments
        this.patterns = patterns;
        this.groups = groups || [];

        // Call superclass constructor
        Annotator.call(this, name);

    }
    RegexAnnotator.prototype = new Annotator;
    RegexAnnotator.constructor = RegexAnnotator;

    RegexAnnotator.prototype.annotate = function() {

        var annotations = [];
        var text = $(document.body).text();

        for (var ptnidx = 0; ptnidx < this.patterns.length; ptnidx++) {

            // Get pattern
            var pattern = this.patterns[ptnidx];

            // Loop over matches
            while ((match = pattern.exec(text)) !== null) {

                // Initialize properties
                properties = {};

                // Check for pseudo-named groups
                for (var groupidx = 0; groupidx < this.groups.length; groupidx++) {

                    //
                    var matchidx = groupidx + 1,
                        matchval = match[matchidx];

                    // Store value in properties if not undefined
                    if (typeof(matchval) !== 'undefined') {
                        properties[this.groups[groupidx]] = matchval;
                    }

                }

                // Get matching context
                var start = match.index,
                    stop = start + match[0].length,
                    context = text.slice(start, stop);

                // Get information about matching pattern
                var meta = {
                    pattern : {
                        source : pattern.source,
                        global : pattern.global,
                        ignoreCase : pattern.ignoreCase,
                        multiline : pattern.multiline,
                    }
                };

                // Create annotation
                var annotation = new Annotation(this.name, context, properties, meta);

                var push = true;
                for (var annidx = 0; annidx < annotations.length; annidx++) {
                    if (annotation.equals(annotations[annidx])) {
                        push = false;
                        break;
                    }
                }
                if (push) annotations.push(annotation);

                // Quit if no global
                // Avoids infinite while loop
                if (!pattern.global) break;

                // Quit if no groups
                // Patterns without groups are boolean
                if (!this.groups) break;

            }

        }

        // Return list of annotations
        return annotations;

    }

    // Expose public fields
    return {
        Annotation : Annotation,
        ArbitAnnotator : ArbitAnnotator,
        RegexAnnotator : RegexAnnotator,
    }

})();