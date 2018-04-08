export function buildVariable(name, startCoord, endCoord) {
  return {
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
  }
}

export function findVariable(name, location, source) {
  const line = location.start.line
  const valueStartsAt = location.start.column
  const columnStart = valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)
  const columnEnd = columnStart + name.length

  return buildVariable(name, [line, columnStart], [line, columnEnd])
}
