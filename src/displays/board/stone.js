(function(){

/**
 * Create a Stone.
 *
 * This constructor is different than all the other constructors in this
 * diroctory.  Not sure if this is a problem or not.
 */
glift.displays.board.createStone = function(
    paper, intersection, coordinate, spacing, subtheme) {
  return new Stone(paper, intersection, coordinate, spacing, subtheme);
}

var Stone = function(paper, intersection, coordinate, spacing, subtheme) {
  this.paper = paper;
  // intersection: The standard point on the board, (1-indexed). So, on a 19x19
  // board, this will be a point where x,y are between 1 and 19 inclusive.
  this.intersection = intersection;
  // coordinate: the center of the stone, in pixels.
  this.coordinate = coordinate;
  this.subtheme = subtheme;

  this.spacing = spacing;
  // TODO(kashomon): Change the magic #s to variables or remove
  // The .2 fudge factor is used to account for line width.
  this.radius = spacing / 2 - .2

  // The purpose of colorState is to provide a way to recreate the GoBoard.
  this.colorState = undefined; // set with setColor(...)

  // Set via draw
  this.circle = undefined;
  this.button = undefined
  this.bbox = undefined;
};

// TODO(kashomon): Break out into its own file.
Stone.prototype = {
  draw: function() {
    this.destroy();
    var subtheme = this.subtheme, // i.e., THEME.stones
        paper = this.paper,
        r = this.radius,
        coord = this.coordinate,
        intersection = this.intersection,
        point = glift.util.point,
        that = this; // Avoid lexical 'this' binding problems.
    if (this.key !== "EMPTY" && subtheme['shadows'] !== undefined) {
      this.shadow = paper.circle(coord.x(), coord.y(), r);
      this.shadow.attr(subtheme.shadows);
      var tAmt = r / 5.0; // translateAmount
      this.shadow.attr({transform:"T" + tAmt + "," + tAmt});
      this.shadow.blur(1);
      this.shadow.attr({opacity: 0});
    }
    this.circle = paper.circle(coord.x(), coord.y(), r);
    var bbox = glift.displays.bbox(point(coord.x() - r, coord.y() - r),
        2 * r, 2 * r);
    this.button = glift.displays.raphael.button(
        paper, intersection, this.circle, bbox);
    this.button.toFront();
    this.setColor("EMPTY");
    return this;
  },

  // Clone the button handlers.  This is useful for recreating the board.  At
  // that point, we recreate each stone with the same handlers as before.
  cloneButtonHandlers: function(stone) {
    this.button.cloneHandlers(stone.button);
  },

  // Set the color of the stone by retrieving the "key" from the stones
  // sub object.
  setColor: function(key) {
    if (this.circle === undefined) {
      throw "Circle was not initialized, so cannot set color";
    }
    if (!(key in this.subtheme)) {
      glift.util.logz("Key " + key + " not found in theme");
    }
    this.circle.attr(this.subtheme[key]);

    if (key !== "EMPTY" && !key.match("_HOVER") && this.shadow !== undefined ) {
      this.shadow.attr({opacity: 1});
    } else if (key === "EMPTY" && !key.match("_HOVER")
        && this.shadow !== undefined) {
      this.shadow.attr({opacity: 0});
    }

    this.colorState = key;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.button && this.button.destroy();
    this.circle && this.circle.remove();
    this.shadow && this.shadow.remove();
    this.mark && this.mark.remove();
    return this;
  },

  addMark: function(type, label) {
    this.mark = glift.displays.raphael.mark(
        this.paper, type, this.coordinate, {fill: 'blue'}, this.spacing, label);
    this.button.toFront();
    return this;
  },

  clearMark: function() {
    this.mark && this.mark.remove();
  }
};
})();
