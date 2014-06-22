import "util";

/**
 * Helper function to resolve the order of domain extrema based on the 
 * direction of the scale, e.g. for inverted axes the min and max values 
 * need to be inverted.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.domain
 * @param {object} scale - a d3 scale
 * @param {number[]} array - an array of length two with a min/max pair
 * @returns the sorted array
 */
st.util.domain = function (scale, array) {
    var domain = scale.domain();
    if (domain[0] > domain[1]) {
        return [
            array[1],
            array[0]
        ];
    }
    return [
        array[0],
        array[1]
    ];
};