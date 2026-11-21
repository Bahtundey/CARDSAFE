import fs from 'fs';
import path from 'path';
import { parse, DocumentNode } from 'graphql';

// Order matters: base `type Query` (user.graphql) must precede `extend type Query`
// (media.graphql) when the definitions are concatenated.
const TYPE_DEF_FILES = [
  'scalars.graphql',
  'user.graphql',
  'auth.graphql',
  'media.graphql',
  'brand.graphql',
  'rate.graphql',
  'trade.graphql',
  'wallet.graphql',
  'withdrawal.graphql',
  'kyc.graphql',
  'notification.graphql',
  'admin.graphql',
];

const typeDefsDir = path.join(__dirname, 'typeDefs');

function loadTypeDefs(): DocumentNode {
  const source = TYPE_DEF_FILES.map((file) =>
    fs.readFileSync(path.join(typeDefsDir, file), 'utf8')
  ).join('\n');

  return parse(source);
}

export const typeDefs: DocumentNode = loadTypeDefs();
