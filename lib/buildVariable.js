const buildVariable = (name, startCoord, endCoord) => ({
  value: name,
  loc: {
    start: {
      line: startCoord[0],
      column: startCoord[1],
    },
    end: {
      line: endCoord[0],
      column: endCoord[1],
    },
  },
})

module.exports = buildVariable
