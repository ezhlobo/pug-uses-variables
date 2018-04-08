// @flow

type Unit = string

function addUniqueItemToArray(array: Array<Unit>, item: Unit): Array<Unit> {
  return array.indexOf(item) === -1 ? array.concat(item) : array
}

export default function pushUniqueVariable(array: Array<Unit>, values: Array<Unit>): Array<Unit> {
  return values.reduce(addUniqueItemToArray, array)
}
