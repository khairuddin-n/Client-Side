import { describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api/http.js';
import { fetchAllCards } from '@/features/card/api/card.api.js';

describe('account API contract', () => {
  it('uses the backend savings account list to load complete account metadata in one request', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        accountList: [
          {
            account_number: '123',
            account_name: 'Nasabah',
            product_name: 'Tabungan',
            effective_balance_total: 25000,
          },
        ],
      },
    });
    expect(await fetchAllCards()).toEqual([
      expect.objectContaining({
        account_number: '123',
        account_holder_name: 'Nasabah',
        type: 'Tabungan',
        effective_balance: 25000,
      }),
    ]);
    expect(api.post).toHaveBeenCalledExactlyOnceWith('/api/v1/savings', {});
  });
  it('does not replace an invalid backend response with fake accounts', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({ data: { data: {} } });
    await expect(fetchAllCards()).rejects.toThrow(
      'Respons rekening tidak valid.',
    );
  });
});
