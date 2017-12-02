function addUniqueItemToArray(array, item) {
  return array.indexOf(item) === -1 ? array.concat(item) : array
}

module.exports = function pushTo(array, ...values) {
  return values.reduce(addUniqueItemToArray, array)
}
