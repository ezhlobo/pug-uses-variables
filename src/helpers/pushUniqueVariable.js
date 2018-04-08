function addUniqueItemToArray(array, item) {
  return array.indexOf(item) === -1 ? array.concat(item) : array
}

export default function pushUniqueVariable(array, ...values) {
  return values.reduce(addUniqueItemToArray, array)
}
