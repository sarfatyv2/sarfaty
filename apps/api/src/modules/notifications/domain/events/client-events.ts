export class ClientCreatedEvent {
  static readonly EVENT_NAME = 'client.created';

  constructor(
    public readonly clientId: string,
    public readonly companyName: string,
    public readonly actorId: string,
    public readonly actorName: string,
    public readonly teamId: string | null,
  ) {}
}

export class ClientSubmittedEvent {
  static readonly EVENT_NAME = 'client.submitted';

  constructor(
    public readonly clientId: string,
    public readonly companyName: string,
    public readonly actorId: string,
    public readonly actorName: string,
  ) {}
}

export class PartnerCompanyDetectedEvent {
  static readonly EVENT_NAME = 'client.partner_company.detected';

  constructor(
    public readonly clientId: string,
    public readonly authorizedPersonId: string,
    public readonly cnpj: string,
    public readonly companyName: string,
  ) {}
}
