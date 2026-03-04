import { CreditController } from './credit.controller';

describe('CreditController — getComplianceResults', () => {
  let controller: CreditController;
  let mockGetComplianceResultsUseCase: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockGetComplianceResultsUseCase = { execute: vi.fn() };
    controller = new CreditController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockGetComplianceResultsUseCase as any,
    );
  });

  it('should return { data: result } from use case', async () => {
    const mockResult = { overallRisk: 'CLEAR', cgu: {}, pep: [], pgfn: null };
    mockGetComplianceResultsUseCase.execute.mockResolvedValue(mockResult);

    const response = await controller.getComplianceResults('client-123');

    expect(response).toEqual({ data: mockResult });
  });

  it('should pass clientId to use case', async () => {
    mockGetComplianceResultsUseCase.execute.mockResolvedValue({});

    await controller.getComplianceResults('client-abc');

    expect(mockGetComplianceResultsUseCase.execute).toHaveBeenCalledWith('client-abc');
  });

  it('should propagate use case errors', async () => {
    mockGetComplianceResultsUseCase.execute.mockRejectedValue(new Error('Not found'));

    await expect(controller.getComplianceResults('client-x')).rejects.toThrow('Not found');
  });
});
