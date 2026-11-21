/**
 * One-time data migration for the Batch 3 financial schema.
 * - Wallet: enforce `availableBalance = balance - pendingBalance`.
 * - Transaction: map legacy CREDIT/DEBIT types to the new enum and backfill
 *   reference/status/balanceBefore.
 */
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Wallet, Transaction } from '../src/models';
import { generateReference } from '../src/utils/ref';

async function migrate(): Promise<void> {
  await connectDatabase();

  // Enforce the wallet invariant at the DB level (bypasses Mongoose defaults).
  const walletRes = await Wallet.updateMany({}, [
    {
      $set: {
        availableBalance: { $subtract: ['$balance', { $ifNull: ['$pendingBalance', 0] }] },
        pendingBalance: { $ifNull: ['$pendingBalance', 0] },
      },
    },
  ]);
  console.log(`[migrate] Wallets updated: ${walletRes.modifiedCount}`);

  const txs = await Transaction.find({ type: { $in: ['CREDIT', 'DEBIT'] } });
  for (const t of txs) {
    const originalType = t.get('type', null, { getters: false });
    const legacyCredit = originalType === 'CREDIT';
    t.type = legacyCredit ? 'TRADE_CREDIT' : 'WITHDRAWAL';
    if (!t.reference) t.reference = generateReference('LEGACY');
    if (!t.status) t.status = 'COMPLETED';
    if (typeof t.balanceBefore !== 'number' || Number.isNaN(t.balanceBefore)) {
      const amount = Math.abs(t.amount);
      t.balanceBefore = legacyCredit ? t.balanceAfter - amount : t.balanceAfter + amount;
    }
    await t.save();
  }
  console.log(`[migrate] Transactions migrated: ${txs.length}`);

  await disconnectDatabase();
  console.log('[migrate] Done.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrate] Failed:', err);
    process.exit(1);
  });
