vi.mock('../../../../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

vi.mock('../../../../database/schema', () => ({
  clients: { id: 'id', cnpj: 'cnpj', companyName: 'companyName', tradeName: 'tradeName' },
  clientAuthorizedPersons: { clientId: 'clientId', cpf: 'cpf', fullName: 'fullName' },
  clientAddresses: { clientId: 'clientId', isPrimary: 'isPrimary', zipCode: 'zipCode', street: 'street', city: 'city', state: 'state' },
}));

import { ComplianceCheckListener } from './compliance-check.listener';

const CLIENT_ID = 'client-789';

const CLIENT_ROW = {
  cnpj: '12345678000190',
  companyName: 'Acme Corp',
  tradeName: 'Acme',
};

const PERSONS_ROWS = [
  { cpf: '11122233344', fullName: 'Alice Smith' },
  { cpf: '55566677788', fullName: 'Bob Jones' },
];

const ADDRESS_ROW = {
  zipCode: '01001000',
  street: 'Rua A',
  city: 'São Paulo',
  state: 'SP',
};

function createQueryBuilder(result: any[]) {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(result),
  };
}

function createMocks(clientRow: any = CLIENT_ROW, personsRows: any[] = PERSONS_ROWS, addressRow: any = ADDRESS_ROW) {
  const clientBuilder = createQueryBuilder(clientRow ? [clientRow] : []);
  const personsBuilder = createQueryBuilder(personsRows);
  const addressBuilder = createQueryBuilder(addressRow ? [addressRow] : []);

  let callCount = 0;
  const db = {
    select: vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return clientBuilder;
      if (callCount === 2) return personsBuilder;
      return addressBuilder;
    }),
  };

  const syncUseCase = { execute: vi.fn().mockResolvedValue(undefined) };

  const listener = new ComplianceCheckListener(db as any, syncUseCase as any);

  return { listener, db, syncUseCase, builders: { clientBuilder, personsBuilder, addressBuilder } };
}

describe('ComplianceCheckListener', () => {
  it('should call use case with correct data from DB', async () => {
    const { listener, syncUseCase } = createMocks();

    await listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any);

    expect(syncUseCase.execute).toHaveBeenCalledWith({
      clientId: CLIENT_ID,
      cnpj: '12345678000190',
      companyName: 'Acme Corp',
      tradeName: 'Acme',
      cep: '01001000',
      registeredStreet: 'Rua A',
      registeredCity: 'São Paulo',
      registeredState: 'SP',
      authorizedPersons: [
        { cpf: '11122233344', name: 'Alice Smith' },
        { cpf: '55566677788', name: 'Bob Jones' },
      ],
    });
  });

  it('should handle missing client gracefully', async () => {
    const { listener, syncUseCase } = createMocks(null);

    await listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any);

    expect(syncUseCase.execute).not.toHaveBeenCalled();
  });

  it('should handle missing address gracefully', async () => {
    const { listener, syncUseCase } = createMocks(CLIENT_ROW, PERSONS_ROWS, null);

    await listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any);

    expect(syncUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: CLIENT_ID,
        cep: undefined,
        registeredStreet: undefined,
        registeredCity: undefined,
        registeredState: undefined,
      }),
    );
  });

  it('should catch and log errors without throwing', async () => {
    const syncUseCase = { execute: vi.fn().mockRejectedValue(new Error('Boom')) };

    const clientBuilder = createQueryBuilder([CLIENT_ROW]);
    const personsBuilder = createQueryBuilder(PERSONS_ROWS);
    const addressBuilder = createQueryBuilder([ADDRESS_ROW]);

    let callCount = 0;
    const db = {
      select: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return clientBuilder;
        if (callCount === 2) return personsBuilder;
        return addressBuilder;
      }),
    };

    const listener = new ComplianceCheckListener(db as any, syncUseCase as any);

    await expect(listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any)).resolves.toBeUndefined();
  });

  it('should filter out persons without CPF', async () => {
    const personsWithNull = [
      { cpf: '11122233344', fullName: 'Alice' },
      { cpf: null, fullName: 'No CPF Person' },
    ];
    const { listener, syncUseCase } = createMocks(CLIENT_ROW, personsWithNull);

    await listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any);

    const calledPersons = syncUseCase.execute.mock.calls[0][0].authorizedPersons;
    expect(calledPersons).toHaveLength(1);
    expect(calledPersons[0].cpf).toBe('11122233344');
  });

  it('should query DB three times (clients, persons, addresses)', async () => {
    const { listener, db } = createMocks();

    await listener.handleClientSyncEvent({ clientId: CLIENT_ID } as any);

    expect(db.select).toHaveBeenCalledTimes(3);
  });
});
