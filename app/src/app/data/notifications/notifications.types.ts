export type Notification = Readonly<{
  id: string;
  notification: string;
  autoDismissInMs: number;
}>;

export type State = Readonly<{
  errors: ReadonlyArray<Notification>;
  notices: ReadonlyArray<Notification>;
  success: ReadonlyArray<Notification>;
}>;
