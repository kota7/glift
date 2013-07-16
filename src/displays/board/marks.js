/**
 * Create the marks.  For layering purposes, dummy marks are created on each
 * intersection at go board creating time.
 *
 * For weird symbols, see:
 * http://www.alanwood.net/unicode/geometric_shapes.html
 */
glift.displays.board.createMarks = function(divId, svg, boardPoints, theme) {
  var markMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var MARK = glift.enums.svgElements.MARK;
  svg.selectAll(MARK).data(boardPoints.data())
    .enter().append("text")
      .text('\u25A2') // square
      .attr('x', function(pt) { return pt.coordPt.x() })
      .attr('y', function(pt) { return pt.coordPt.y() })
      .attr('dy', '.35em') // for vertical centering
      .attr('fill', theme.marks.fill)
      .attr('text-anchor', 'middle')
      .attr('height', boardPoints.spacing)
      .attr('stroke', theme.marks.stroke)
      .attr('opacity', 0)
      .attr('id', function(pt) {
        var id = svgutil.elementId(divId, MARK, pt.intPt);
        markMapping[pt.intPt.hash()] = id;
        return id;
      });
  return markMapping;
};