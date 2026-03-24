const fs = require('fs');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const DEFAULT_PRODUCTS = [
  {
    productId: 'prod_ps4',
    name: 'PlayStation 4',
    description:
      'Consola PS4 Slim de 1 TB ideal para catalogo legacy y juegos de generacion anterior.',
    features: [
      '1 TB de almacenamiento',
      'Edicion Slim',
      'Catalogo legacy de PS4',
    ],
    priceInCents: 139989000,
    currency: 'COP',
    stock: 8,
  },
  {
    productId: 'prod_ps5',
    name: 'PlayStation 5',
    description:
      'Consola PS5 de nueva generacion con almacenamiento de 1 TB y soporte para juego en 4K.',
    features: ['1 TB SSD', 'Soporte para 4K', 'DualSense incluido'],
    priceInCents: 299900000,
    currency: 'COP',
    stock: 6,
  },
  {
    productId: 'prod_xbox_series_x',
    name: 'Xbox Series X',
    description:
      'Consola Xbox Series X de 1 TB para juego en 4K con alto rendimiento.',
    features: ['1 TB SSD', 'Rendimiento 4K', 'Ray tracing'],
    priceInCents: 309990000,
    currency: 'COP',
    stock: 5,
  },
  {
    productId: 'prod_xbox_series_s',
    name: 'Xbox Series S',
    description:
      'Consola Xbox Series S compacta con 512 GB y excelente relacion costo-rendimiento.',
    features: ['512 GB SSD', 'Formato compacto', 'Excelente costo-rendimiento'],
    priceInCents: 194990000,
    currency: 'COP',
    stock: 9,
  },
  {
    productId: 'prod_nintendo_switch',
    name: 'Nintendo Switch',
    description:
      'Consola hibrida Nintendo Switch con Joy-Con y bundle digital de Mario Kart 8.',
    features: ['Modo portatil y dock', 'Joy-Con incluidos', 'Bundle digital'],
    priceInCents: 159900000,
    currency: 'COP',
    stock: 12,
  },
  {
    productId: 'prod_nintendo_switch_2',
    name: 'Nintendo Switch 2',
    description:
      'Nueva Nintendo Switch 2 con mejoras de rendimiento y precio oficial sugerido en Colombia.',
    features: ['Nueva generacion', 'Mejoras de rendimiento', 'Portatil + dock'],
    priceInCents: 285990000,
    currency: 'COP',
    stock: 7,
  },
];

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function readArg(name) {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function deleteExistingProducts(documentClient, tableName) {
  let lastEvaluatedKey;
  let deleted = 0;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: 'productId',
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    const items = response.Items ?? [];

    for (const item of items) {
      if (!item.productId) {
        continue;
      }

      await documentClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            productId: item.productId,
          },
        }),
      );

      deleted += 1;
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return deleted;
}

async function main() {
  loadEnvFile();

  const region = readArg('region') ?? process.env.AWS_REGION ?? 'us-east-1';
  const tableName =
    readArg('table-name') ??
    process.env.DYNAMODB_TABLE_PRODUCTS ??
    'checkout-onboarding-api-dev-products';
  const dryRun = hasFlag('dry-run');
  const replaceExisting = hasFlag('replace-existing');

  if (!tableName) {
    throw new Error(
      'Missing DynamoDB products table. Use --table-name or DYNAMODB_TABLE_PRODUCTS.',
    );
  }

  const client = new DynamoDBClient({ region });
  const documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          region,
          tableName,
          replaceExisting,
          products: DEFAULT_PRODUCTS,
        },
        null,
        2,
      ),
    );

    return;
  }

  let inserted = 0;
  let skipped = 0;
  let deleted = 0;

  if (replaceExisting) {
    deleted = await deleteExistingProducts(documentClient, tableName);
  }

  for (const product of DEFAULT_PRODUCTS) {
    try {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: product,
          ConditionExpression: 'attribute_not_exists(productId)',
        }),
      );

      inserted += 1;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        skipped += 1;
        continue;
      }

      throw error;
    }
  }

  console.log(
    `Seed completed for ${tableName} (${region}). Deleted existing: ${deleted}. Inserted: ${inserted}. Skipped existing: ${skipped}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
