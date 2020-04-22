export type State = Readonly<{
  errors: ReadonlyArray<string>;
  notices: ReadonlyArray<string>;
  success: ReadonlyArray<string>;
}>;
