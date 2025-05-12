declare namespace Express {
  interface Request {
    account: HydratedDocument<IAccount>
  }
}
