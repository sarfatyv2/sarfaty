import { UpminerAdapter } from './upminer.adapter';

vi.mock('../../../../config/env', () => ({
  env: {
    UPMINER_CLIENT_ID: 'test-client-id',
    UPMINER_CLIENT_SECRET: 'test-secret',
    UPMINER_BASE_URL: 'https://upapi-orchestrator.uplexis.com',
  },
}));

const mockAuthResponse = {
  access_token: 'mock-token-xyz',
  expires_in: 3600,
  token_type: 'Bearer',
};

describe('UpminerAdapter', () => {
  let adapter: UpminerAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new UpminerAdapter();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const mockAuthFetch = () =>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAuthResponse),
    });

  describe('getAuthToken', () => {
    it('should obtain token on first call', async () => {
      mockAuthFetch();

      const token = await adapter.getAuthToken();

      expect(token).toBe('mock-token-xyz');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/oauth/token');
      expect(init.method).toBe('POST');

      const body = JSON.parse(init.body as string);
      expect(body.grant_type).toBe('client_credentials');
      expect(body.client_id).toBe('test-client-id');
      expect(body.scope).toBe('*');
    });

    it('should reuse cached token on subsequent calls', async () => {
      mockAuthFetch();

      await adapter.getAuthToken();
      await adapter.getAuthToken();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should refresh token after invalidation', async () => {
      mockAuthFetch();
      mockAuthFetch();

      await adapter.getAuthToken();
      adapter.invalidateToken();
      await adapter.getAuthToken();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw when UPMINER_CLIENT_ID is not configured', async () => {
      const adapterWithoutConfig = new UpminerAdapter();
      (adapterWithoutConfig as any).getClientId = () => '';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('{"error":"Unauthorized"}'),
      });

      await expect(adapterWithoutConfig.getAuthToken()).rejects.toThrow();
    });

    it('should throw on 401 auth response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('{"error":"Unauthorized"}'),
      });

      await expect(adapter.getAuthToken()).rejects.toThrow('upMiner OAuth failed: 401');
    });
  });

  describe('createBatch', () => {
    it('should POST to /apps/upminer/batches and return batchID', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ batchID: 42 }),
      });

      const result = await adapter.createBatch({
        inputs: ['12345678000190'],
        input_type: 2,
        search_profile_id: 100,
        break_batches: false,
      });

      expect(result.batchID).toBe(42);

      const [url, init] = mockFetch.mock.calls[1] as [string, RequestInit];
      expect(url).toContain('/apps/upminer/batches');
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer mock-token-xyz');

      const body = JSON.parse(init.body as string);
      expect(body.inputs).toEqual(['12345678000190']);
      expect(body.input_type).toBe(2);
    });

    it('should throw on API error response', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve('{"message":"Invalid profile"}'),
      });

      await expect(
        adapter.createBatch({ inputs: ['123'], input_type: 2, search_profile_id: 0, break_batches: false }),
      ).rejects.toThrow('422');
    });
  });

  describe('addBatchToQueue', () => {
    it('should GET /apps/upminer/batches/{batchID}/add-queue', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Batch added to queue' }),
      });

      const result = await adapter.addBatchToQueue(99);

      expect(result.message).toBe('Batch added to queue');

      const [url] = mockFetch.mock.calls[1] as [string];
      expect(url).toContain('/apps/upminer/batches/99/add-queue');
    });
  });

  describe('getBatchStatus', () => {
    it('should GET /apps/upminer/batches/{batchID}/status', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([{ batch_id: 99, in_queue: false, status: 'processed', parent_batch_id: null }]),
      });

      const result = await adapter.getBatchStatus(99);

      expect(result[0]?.status).toBe('processed');
      expect(result[0]?.batch_id).toBe(99);
    });
  });

  describe('getBatchDossiers', () => {
    it('should GET /apps/upminer/batches/{batchID}/dossiers', async () => {
      const mockDossiers = {
        id: 99,
        status: 'processed',
        input_type: 2,
        in_queue: false,
        has_workflow: false,
        has_parent_dossier: false,
        user_id: 1,
        dossiers: [
          {
            id: 555,
            criterion: { input: '12345678000190', name: 'TEST COMPANY' },
            status: 'processed',
            state: 'done',
            has_upflag: false,
            monitoring: { id: null, diffs: null },
            workflow: { status: false },
            children_batches: [],
            created_at: '2024-01-01T00:00:00Z',
            processed_at: '2024-01-01T00:05:00Z',
          },
        ],
      };

      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDossiers),
      });

      const result = await adapter.getBatchDossiers(99);

      expect(result.dossiers).toHaveLength(1);
      expect(result.dossiers[0]?.criterion.input).toBe('12345678000190');
    });
  });

  describe('getDossier', () => {
    it('should GET /apps/upminer/dossiers/{dossierID}', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '555',
            type: 2,
            status: 'processed',
            batch: { id: 99, status: 'processed' },
            user: { id: 1, name: 'Test User' },
            search_profile_name: 'Default',
            criterion: { input: '12345678000190', name: 'TEST CO' },
            homonyms: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:05:00Z',
            workflow: {
              name: '',
              levels: '',
              created_at: '',
              approvers: [],
              responsible: '',
              final_status: '',
              final_status_date_analysis: '',
              automatic_approval: false,
            },
            sources: { groups: [], items: [] },
            has_parent: false,
          }),
      });

      const result = await adapter.getDossier(555);

      expect(result.id).toBe('555');
      expect(result.criterion.input).toBe('12345678000190');
    });
  });

  describe('checkDuplicates', () => {
    it('should POST to /apps/upminer/batches/is-duplicate', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            duplicity_days: 30,
            total_batches: 0,
            batches: [],
            upflags: [],
          }),
      });

      const result = await adapter.checkDuplicates({ criterions: ['12345678000190'] });

      expect(result.total_batches).toBe(0);
      const [url] = mockFetch.mock.calls[1] as [string];
      expect(url).toContain('is-duplicate');
    });
  });

  describe('listProfiles', () => {
    it('should GET /apps/upminer/batches/profile/list', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Default', version: 1, profile_type: 1 },
            { id: 2, name: 'Extended', version: 1, profile_type: 2 },
          ]),
      });

      const result = await adapter.listProfiles();

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('Default');
    });
  });

  describe('requestDossierPdf', () => {
    it('should POST to /apps/upminer/dossiers/{dossierID}/pdf', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id_processo: 'proc-abc-123' }),
      });

      const result = await adapter.requestDossierPdf(555);

      expect(result.id_processo).toBe('proc-abc-123');
      const [url] = mockFetch.mock.calls[1] as [string];
      expect(url).toContain('/dossiers/555/pdf');
    });

    it('should include notification_url in body when provided', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id_processo: 'proc-abc-456' }),
      });

      await adapter.requestDossierPdf(555, { notification_url: 'https://webhook.example.com' });

      const [, init] = mockFetch.mock.calls[1] as [string, RequestInit];
      const body = JSON.parse(init.body as string);
      expect(body.notification_url).toBe('https://webhook.example.com');
    });
  });

  describe('getDossierPdf', () => {
    it('should GET /apps/upminer/dossiers/{dossierID}/pdf/{processID}', async () => {
      mockAuthFetch();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'proc-abc-123',
            status: 'processing',
            url: null,
            created_at: '2024-01-01T00:00:00Z',
            end_at: null,
          }),
      });

      const result = await adapter.getDossierPdf(555, 'proc-abc-123');

      expect(result.status).toBe('processing');
      expect(result.url).toBeNull();
      const [url] = mockFetch.mock.calls[1] as [string];
      expect(url).toContain('/dossiers/555/pdf/proc-abc-123');
    });
  });

  describe('fetchWithRetry', () => {
    it('should retry on 500 and succeed on second attempt', async () => {
      mockAuthFetch();
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Server Error') })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ batchID: 1 }) });

      const result = await adapter.createBatch({
        inputs: ['12345678000190'],
        input_type: 2,
        search_profile_id: 1,
        break_batches: false,
      });

      expect(result.batchID).toBe(1);
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 auth + 2 attempts
    });

    it('should throw after exhausting all retries on persistent 500', async () => {
      mockAuthFetch();
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Error') })
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Error') })
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Error') });

      await expect(
        adapter.createBatch({ inputs: ['123'], input_type: 2, search_profile_id: 1, break_batches: false }),
      ).rejects.toThrow('upminer.createBatch');
    });
  });
});
