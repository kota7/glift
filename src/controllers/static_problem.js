(function() {
/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 */
glift.controllers.staticProblem = function(rawOptions) {
  var options = glift.controllers.processOptions(rawOptions),
      controllers = glift.controllers,
      baseController = glift.util.beget(controllers.base()),
      newController = glift.util.setMethods(baseController, methods),
      // At this point, options have already been processed
      _ = newController.initOptions(options);
  return newController;
};

var methods = {
  /**
   * Reload the problems.
   *
   * TODO(kashomon): Remove this?
   */
  reload: function() {
    this.initialize();
  },

  /**
   * Add a stone to the board.  Since this is a problem, we check for
   * 'correctness', which we check whether all child nodes are labeled (in some
   * fashion) as correct.
   *
   * Note: color must be one of enums.states (either BLACK or WHITE).
   *
   * TODO: Refactor this into something less ridiculous -- i.e., shorter and
   * easier to understand.
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults,
        CORRECT = problemResults.CORRECT,
        INCORRECT = problemResults.INCORRECT,
        INDETERMINATE = problemResults.INDETERMINATE,
        FAILURE = problemResults.FAILURE;

    // Reminder -- the goban returns:
    //  {
    //    successful: <boolean>
    //    captures: [ points]
    //  }
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { result: FAILURE };
    }

    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT. However, we still add the move down the movetree
    if (nextVarNum === glift.util.none) {
      this.movetree.addNode();
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      var outData = glift.rules.intersections.getFullBoardData(
          this.movetree, this.goban);
      outData.result = INCORRECT;
      return outData;
    } else {
      this.movetree.moveDown(nextVarNum);
      var correctness = this.movetree.isCorrectPosition();

      if (correctness === CORRECT || correctness == INCORRECT) {
        // TODO(kashomon): Only retrieve the intersections that have changed.
        var outData = glift.rules.intersections.getFullBoardData(
            this.movetree, this.goban);
        outData.result = correctness;
        return outData;
      }

      else if (correctness === INDETERMINATE) {
        var randNext = glift.math.getRandomInt(
            0, this.movetree.node().numChildren() - 1);
        // We're playing for the opposite player, at this point (usu. white).
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.properties().getMove();
        this.goban.addStone(nextMove.point, nextMove.color);
        var outData = glift.rules.intersections.getFullBoardData(
            this.movetree, this.goban);
        outData.result = INDETERMINATE;
        return outData;
      }
      else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};

})();
