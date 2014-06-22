import "util";

/**
 * Color object that consistently returns one of six different colors 
 * for a given identifier.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.colors
 */
st.util.colors = function () {
    var colors = {
        0: "red",
        1: "blue",
        2: "green",
        3: "orange",
        4: "yellow",
        5: "black"
    },

    index = 0,      // running index
    mapping = {},   // stores the id - color mappings

    /**
     * Gets the color for the identifier or - if id is unassigned - returns
     * a new color from the color hash.
     * 
     * @method get
     * @param {int} id - the identifier
     * @returns the color string for the identifier
     */
    get = function (id) {
        if (mapping[id]) {
            return mapping[id];
        }
        mapping[id] = next();
        return mapping[id];
    },

    /**
     * Returns the color string based on the running index. Resets the
     * index if it exceeds the color hash.
     * 
     * @method next
     * @returns the color string
     */
    next = function () {
        if (index === Object.keys(colors).length) {
            index = 0;
        }
        return colors[index++];
    };

    // reference visible (public) functions as properties
    return {
        get: get
    };
};