function addUniqueItemToArray(array, item) {
  return array.indexOf(item) === -1 ? array.concat(item) : array
}

module.exports = function pushUniqueVariable(array, ...values) {
  return values.reduce(addUniqueItemToArray, array)
}
