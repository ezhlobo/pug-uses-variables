// @flow

type SourceLocationUnit = {
  line: number,
  column: number,
}

export type SourceLocation = {
  start: SourceLocationUnit,
  end: SourceLocationUnit,
}

export type VariableName = string

export type Variable = {
  value: VariableName,
  loc: Location,
}

export type VariableList = Array<Variable>

export type Token = {
  loc: SourceLocation,
  type: string,

  val: string,
  name: string,
  key: string,
  code: string,
}
