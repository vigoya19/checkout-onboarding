export class Customer {
  constructor(
    readonly customerId: string,
    readonly fullName: string,
    readonly email: string,
    readonly phone: string,
    readonly createdAt: string,
  ) {}
}
