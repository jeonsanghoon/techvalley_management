import { Client, type QueryResultRow } from 'pg';
import { postgresUri } from '../../src/infrastructure/database/database.config';

async function queryOne<T extends QueryResultRow>(sql: string, params: unknown[]): Promise<T | null> {
  const client = new Client({ connectionString: postgresUri() });
  await client.connect();
  try {
    const res = await client.query<T>(sql, params);
    return res.rows[0] ?? null;
  } finally {
    await client.end();
  }
}

/** API DTO id(비즈니스 code) → company PK */
export async function companyPkByCode(code: string): Promise<number> {
  const row = await queryOne<{ id: number }>('SELECT id FROM company WHERE code = $1', [code]);
  if (!row) throw new Error(`company not found: ${code}`);
  return row.id;
}

/** ticket_no → service_ticket snowflake PK */
export async function serviceTicketPkByTicketNo(ticketNo: string): Promise<string> {
  const row = await queryOne<{ id: string }>(
    'SELECT id::text AS id FROM service_ticket WHERE ticket_no = $1',
    [ticketNo],
  );
  if (!row) throw new Error(`service ticket not found: ${ticketNo}`);
  return row.id;
}

/** order_no → parts_order snowflake PK */
export async function partsOrderPkByOrderNo(orderNo: string): Promise<string> {
  const row = await queryOne<{ id: string }>(
    'SELECT id::text AS id FROM parts_order WHERE order_no = $1',
    [orderNo],
  );
  if (!row) throw new Error(`parts order not found: ${orderNo}`);
  return row.id;
}

/** channel_code → notification_channel_setting snowflake PK */
export async function notificationChannelPkByCode(channelCode: string): Promise<string> {
  const row = await queryOne<{ id: string }>(
    'SELECT id::text AS id FROM notification_channel_setting WHERE channel_code = $1',
    [channelCode],
  );
  if (!row) throw new Error(`notification channel not found: ${channelCode}`);
  return row.id;
}

/** main_code + sub_code → common_code PK */
export async function commonCodePk(mainCode: string, subCode: number): Promise<number> {
  const row = await queryOne<{ id: number }>(
    'SELECT id FROM common_code WHERE main_code = $1 AND sub_code = $2',
    [mainCode, subCode],
  );
  if (!row) throw new Error(`common code not found: ${mainCode}/${subCode}`);
  return row.id;
}

/** device_code → site_id (설치 CRUD 등) */
export async function siteIdByDeviceCode(deviceCode: string): Promise<number> {
  const row = await queryOne<{ site_id: number }>(
    'SELECT site_id FROM device WHERE device_code = $1',
    [deviceCode],
  );
  if (!row?.site_id) throw new Error(`device/site not found: ${deviceCode}`);
  return row.site_id;
}
