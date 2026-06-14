import { getDb } from './index';
import { v4 as uuidv4 } from 'uuid';

type Row = Record<string, any>;

interface ParseResult {
  topLevel: string[];
  joins: JoinDef[];
}

interface JoinDef {
  alias: string;
  table: string;
  columns: string[];
  nestedJoins: JoinDef[];
}

function parseSelect(selectStr: string): ParseResult {
  const topLevel: string[] = [];
  const joins: JoinDef[] = [];
  let remaining = selectStr.trim();

  while (remaining.length > 0) {
    remaining = remaining.replace(/^\s*,\s*/, '');
    if (!remaining) break;

    if (remaining.startsWith('*')) {
      topLevel.push('*');
      remaining = remaining.slice(1).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    // Match either "alias:Table(cols)" or "Table(cols)" with nested parens
    const parenMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)\(((?:[^()]+|\([^()]*\))*)\)/);
    if (parenMatch) {
      const [, alias, table, colsRaw] = parenMatch;
      const nested = parseNestedColumns(colsRaw);
      joins.push({ alias, table, columns: nested.columns, nestedJoins: nested.joins });
      remaining = remaining.slice(parenMatch[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    const parenMatch2 = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\(((?:[^()]+|\([^()]*\))*)\)/);
    if (parenMatch2) {
      const [, table, colsRaw] = parenMatch2;
      const nested = parseNestedColumns(colsRaw);
      joins.push({ alias: table, table, columns: nested.columns, nestedJoins: nested.joins });
      remaining = remaining.slice(parenMatch2[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    const colMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (colMatch) {
      topLevel.push(colMatch[1]);
      remaining = remaining.slice(colMatch[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    break;
  }

  return { topLevel, joins };
}

function parseNestedColumns(colsRaw: string): { columns: string[]; joins: JoinDef[] } {
  const columns: string[] = [];
  const joins: JoinDef[] = [];
  let remaining = colsRaw.trim();

  while (remaining.length > 0) {
    remaining = remaining.replace(/^\s*,\s*/, '');
    if (!remaining) break;

    if (remaining.startsWith('*')) {
      columns.push('*');
      remaining = remaining.slice(1).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    const parenMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)\(((?:[^()]+|\([^()]*\))*)\)/);
    if (parenMatch) {
      const [, alias, table, innerColsRaw] = parenMatch;
      const inner = parseNestedColumns(innerColsRaw);
      joins.push({ alias, table, columns: inner.columns, nestedJoins: inner.joins });
      remaining = remaining.slice(parenMatch[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    const parenMatch2 = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\(((?:[^()]+|\([^()]*\))*)\)/);
    if (parenMatch2) {
      const [, table, innerColsRaw] = parenMatch2;
      const inner = parseNestedColumns(innerColsRaw);
      joins.push({ alias: table, table, columns: inner.columns, nestedJoins: inner.joins });
      remaining = remaining.slice(parenMatch2[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    const colMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (colMatch) {
      columns.push(colMatch[1]);
      remaining = remaining.slice(colMatch[0].length).trim();
      if (remaining.startsWith(',')) remaining = remaining.slice(1).trim();
      continue;
    }

    break;
  }

  return { columns, joins };
}

const FK_MAP: Record<string, { table: string; fk: string; ref: string }> = {
  Folder: { table: 'Folder', fk: 'folderId', ref: 'id' },
  User: { table: 'User', fk: 'userId', ref: 'id' },
  Subscription: { table: 'Subscription', fk: 'userId', ref: 'id' },
  Workspace: { table: 'Workspace', fk: 'workspaceId', ref: 'id' },
  Member: { table: 'Member', fk: 'workspaceId', ref: 'id' },
  Video: { table: 'Video', fk: 'videoId', ref: 'id' },
  Comment: { table: 'Comment', fk: 'videoId', ref: 'id' },
  Invite: { table: 'Invite', fk: 'id', ref: 'id' },
  Notification: { table: 'Notification', fk: 'userId', ref: 'id' },
  Trial: { table: 'Trial', fk: 'userId', ref: 'id' },
};

function getJoinInfo(table: string, parentTable: string): { fk: string; ref: string } | null {
  const map: Record<string, Record<string, { fk: string; ref: string }>> = {
    User: { Subscription: { fk: 'userId', ref: 'id' }, Workspace: { fk: 'userId', ref: 'id' }, Video: { fk: 'userId', ref: 'id' }, Member: { fk: 'userId', ref: 'id' }, Notification: { fk: 'userId', ref: 'id' }, Comment: { fk: 'userId', ref: 'id' }, Trial: { fk: 'userId', ref: 'id' }, Folder: { fk: 'userId', ref: 'id' } },
    Workspace: { Folder: { fk: 'workspaceId', ref: 'id' }, Video: { fk: 'workspaceId', ref: 'id' }, Member: { fk: 'workspaceId', ref: 'id' }, Invite: { fk: 'workspaceId', ref: 'id' } },
    Folder: { Video: { fk: 'folderId', ref: 'id' } },
    Video: { Comment: { fk: 'videoId', ref: 'id' } },
    Invite: { Notification: { fk: 'inviteId', ref: 'id' } },
    Member: { Workspace: { fk: 'workspaceId', ref: 'id' }, User: { fk: 'userId', ref: 'id' } },
  };
  return map[parentTable]?.[table] || null;
}

function allColumns(table: string): string[] {
  const cols: Record<string, string[]> = {
    User: ['id', 'supabaseId', 'email', 'firstName', 'lastName', 'image', 'createdAt'],
    Workspace: ['id', 'name', 'type', 'userId', 'videoCount', 'createdAt'],
    Member: ['id', 'userId', 'workspaceId', 'createdAt'],
    Subscription: ['id', 'plan', 'customerId', 'userId', 'createdAt'],
    Folder: ['id', 'name', 'workspaceId', 'userId', 'videoCount', 'createdAt'],
    Video: ['id', 'title', 'description', 'source', 'processing', 'views', 'isPublic', 'transcript', 'summary', 'workspaceId', 'folderId', 'userId', 'planAtCreation', 'createdAt'],
    Invite: ['id', 'workspaceId', 'senderId', 'receiverId', 'email', 'content', 'accepted', 'createdAt'],
    Comment: ['id', 'comment', 'commentId', 'reply', 'videoId', 'userId', 'createdAt'],
    Notification: ['id', 'userId', 'content', 'inviteId', 'createdAt'],
    Trial: ['id', 'userId', 'trial', 'createdAt'],
  };
  return cols[table] || ['id'];
}

export class LocalQuery {
  private table: string;
  private selectStr: string = '*';
  private filters: { type: string; col: string; val: any; op?: string }[] = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitVal: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private isCount: boolean = false;
  private countExact: boolean = false;
  private insertObj: any = null;
  private updateObj: any = null;
  private deleteMode: boolean = false;
  private upsertObj: any = null;
  private upsertConflict: string | null = null;
  private parsed: ParseResult | null = null;
  private isReturning: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string, options?: { count?: 'exact'; head?: boolean }): this {
    this.selectStr = columns;
    if (options?.count === 'exact' || options?.head) {
      this.isCount = true;
      this.countExact = true;
    }
    this.parsed = parseSelect(columns);
    return this;
  }

  eq(col: string, val: any): this { this.filters.push({ type: 'eq', col, val }); return this; }
  neq(col: string, val: any): this { this.filters.push({ type: 'neq', col, val }); return this; }
  gt(col: string, val: any): this { this.filters.push({ type: 'gt', col, val }); return this; }
  gte(col: string, val: any): this { this.filters.push({ type: 'gte', col, val }); return this; }
  lt(col: string, val: any): this { this.filters.push({ type: 'lt', col, val }); return this; }
  lte(col: string, val: any): this { this.filters.push({ type: 'lte', col, val }); return this; }
  like(col: string, val: any): this { this.filters.push({ type: 'like', col, val }); return this; }
  ilike(col: string, val: any): this { this.filters.push({ type: 'ilike', col, val }); return this; }
  is(col: string, val: any): this { this.filters.push({ type: 'is', col, val }); return this; }
  in(col: string, val: any[]): this { this.filters.push({ type: 'in', col, val }); return this; }
  not(col: string, op: string, val: any): this { this.filters.push({ type: 'not', col, op: op, val }); return this; }

  or(filters: string): this {
    this.filters.push({ type: 'or', col: filters, val: undefined });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number): this { this.limitVal = n; return this; }

  single(): this & Promise<{ data: any; error: any }> {
    this.isSingle = true;
    return this.execute() as any;
  }

  maybeSingle(): this & Promise<{ data: any; error: any }> {
    this.isMaybeSingle = true;
    return this.execute() as any;
  }

  insert(obj: any): LocalMutation { return new LocalMutation(this.table, obj, 'insert'); }
  update(obj: any): this { this.updateObj = obj; return this; }
  delete(): this { this.deleteMode = true; return this; }
  upsert(obj: any, options?: { onConflict?: string }): LocalMutation {
    return new LocalMutation(this.table, obj, 'upsert', options?.onConflict);
  }

  private buildWhere(params: any[]): string {
    const clauses: string[] = [];
    for (const f of this.filters) {
      if (f.type === 'eq') {
        clauses.push(`"${f.col}" = ?`);
        params.push(f.val);
      } else if (f.type === 'neq') {
        clauses.push(`"${f.col}" != ?`);
        params.push(f.val);
      } else if (f.type === 'gt') {
        clauses.push(`"${f.col}" > ?`);
        params.push(f.val);
      } else if (f.type === 'gte') {
        clauses.push(`"${f.col}" >= ?`);
        params.push(f.val);
      } else if (f.type === 'lt') {
        clauses.push(`"${f.col}" < ?`);
        params.push(f.val);
      } else if (f.type === 'lte') {
        clauses.push(`"${f.col}" <= ?`);
        params.push(f.val);
      } else if (f.type === 'like') {
        clauses.push(`"${f.col}" LIKE ?`);
        params.push(f.val);
      } else if (f.type === 'ilike') {
        clauses.push(`LOWER("${f.col}") LIKE LOWER(?)`);
        params.push(f.val);
      } else if (f.type === 'is') {
        if (f.val === null) {
          clauses.push(`"${f.col}" IS NULL`);
        } else {
          clauses.push(`"${f.col}" IS ?`);
          params.push(f.val);
        }
      } else if (f.type === 'in') {
        const placeholders = (f.val as any[]).map(() => '?').join(',');
        clauses.push(`"${f.col}" IN (${placeholders})`);
        params.push(...(f.val as any[]));
      } else if (f.type === 'not') {
        if (f.op === 'is' && f.val === null) {
          clauses.push(`"${f.col}" IS NOT NULL`);
        } else {
          clauses.push(`NOT ("${f.col}" ${f.op} ?)`);
          params.push(f.val);
        }
      } else if (f.type === 'or') {
        const orStr: string = f.col;
        const orClauses = orStr.split(',').map((part: string) => {
          part = part.trim();
          const match = part.match(/(\w+)\.(\w+)\.%(.+)%/);
          if (match) {
            return `LOWER("${match[1]}") LIKE LOWER('%${match[3]}%')`;
          }
          const match2 = part.match(/(\w+)\.ilike\.%(.+)%/);
          if (match2) {
            return `LOWER("${match2[1]}") LIKE LOWER('%${match2[2]}%')`;
          }
          const match3 = part.match(/(\w+)\.ilike\.(.+)/);
          if (match3) {
            return `LOWER("${match3[1]}") LIKE LOWER(?)`;
          }
          const match4 = part.match(/(\w+)\.eq\.(.+)/);
          if (match4) {
            return `"${match4[1]}" = ?`;
          }
          return part;
        });
        clauses.push(`(${orClauses.join(' OR ')})`);
      }
    }
    return clauses.length > 0 ? clauses.join(' AND ') : '1=1';
  }

  private shapeResult(rows: Row[], parsed: ParseResult): Row[] {
    return rows.map(row => {
      const result: Row = { ...row };
      for (const join of parsed.joins) {
        const fkInfo = getJoinInfo(join.table, this.table);
        if (fkInfo && row[join.table]) {
          result[join.alias] = row[join.table];
        }
        delete result[join.table];

        if (join.nestedJoins.length > 0 && result[join.alias]) {
          const nestedRows = [result[join.alias]];
          const shaped = this.shapeResult(nestedRows, { topLevel: join.columns, joins: join.nestedJoins });
          result[join.alias] = shaped[0];
        }
      }
      return result;
    });
  }

  async execute(): Promise<{ data: any; error: any; count?: any }> {
    try {
      const db = getDb();
      const params: any[] = [];

      if (this.deleteMode) {
        const where = this.buildWhere(params);
        const sql = `DELETE FROM "${this.table}" WHERE ${where}`;
        db.prepare(sql).run(...params);
        return { data: null, error: null };
      }

      if (this.updateObj) {
        const setClauses = Object.keys(this.updateObj).map(k => `"${k}" = ?`).join(', ');
        const setValues = Object.keys(this.updateObj).map(k => {
          const val = this.updateObj[k];
          return val === undefined ? null : val;
        });
        const where = this.buildWhere(params);
        const sql = `UPDATE "${this.table}" SET ${setClauses} WHERE ${where}`;
        db.prepare(sql).run(...setValues, ...params);
        return { data: null, error: null };
      }

      if (this.isCount) {
        const where = this.buildWhere(params);
        const sql = `SELECT COUNT(*) as cnt FROM "${this.table}" WHERE ${where}`;
        const row = db.prepare(sql).get(...params) as any;
        return { data: null, count: row?.cnt || 0, error: null };
      }

      const parsed = this.parsed || parseSelect(this.selectStr);

      let topCols = '*';
      if (!parsed.topLevel.includes('*')) {
        topCols = parsed.topLevel.map(c => `"${c}"`).join(', ');
      }

      if (topCols === '*') {
        topCols = allColumns(this.table).map(c => `a."${c}"`).join(', ');
      } else {
        topCols = parsed.topLevel.map(c => `a."${c}"`).join(', ');
      }

      let sql = `SELECT ${topCols}`;
      const joinSelects: string[] = [];

      for (const join of parsed.joins) {
        const fkInfo = getJoinInfo(join.table, this.table);
        if (fkInfo) {
          const joinCols = join.columns.includes('*')
            ? allColumns(join.table).map(c => `"${join.table}"."${c}"`)
            : join.columns.map(c => `"${join.table}"."${c}"`);
          joinSelects.push(joinCols.map(c => `${c} as "${join.table}__${c.replace(`"${join.table}".`, '')}"`).join(', '));
          sql += ` LEFT JOIN "${join.table}" ON "${join.table}"."${fkInfo.fk}" = a."${fkInfo.ref}"` + 
                 (this.table === 'Member' && join.table === 'User' ? ' OR 1=0' : ''); // dummy
        }
      }

      if (parsed.topLevel.includes('*') && parsed.joins.length === 0) {
        sql = `SELECT a.* FROM "${this.table}" a`;
      } else if (!parsed.topLevel.includes('*') && parsed.joins.length > 0) {
        sql = `SELECT ${topCols}${joinSelects.length > 0 ? ', ' + joinSelects.join(', ') : ''} FROM "${this.table}" a`;
      } else if (parsed.topLevel.includes('*') && parsed.joins.length > 0) {
        const allTopCols = allColumns(this.table).map(c => `a."${c}"`).join(', ');
        sql = `SELECT ${allTopCols}${joinSelects.length > 0 ? ', ' + joinSelects.join(', ') : ''} FROM "${this.table}" a`;
      } else {
        sql = `SELECT ${topCols} FROM "${this.table}" a`;
      }

      const where = this.buildWhere(params);
      sql += ` WHERE ${where}`;

      if (this.orderCol) {
        sql += ` ORDER BY "${this.orderCol}" ${this.orderAsc ? 'ASC' : 'DESC'}`;
      }

      if (this.limitVal) {
        sql += ` LIMIT ${this.limitVal}`;
      }
      if (this.isSingle || this.isMaybeSingle) {
        sql += ' LIMIT 1';
      }

      const rows = db.prepare(sql).all(...params) as any[];

      const processed = rows.map((row: any) => {
        const obj: any = {};
        for (const key of Object.keys(row)) {
          const joinMatch = key.match(/^(.+)__(.+)$/);
          if (joinMatch) {
            const tableName = joinMatch[1];
            const colName = joinMatch[2];
            if (!obj[tableName]) obj[tableName] = {};
            obj[tableName][colName] = row[key];
          } else {
            obj[key] = row[key];
          }
        }

        for (const join of parsed.joins) {
          if (obj[join.table]) {
            obj[join.alias] = obj[join.table];
            delete obj[join.table];
          }
        }

        for (const join of parsed.joins) {
          if (join.nestedJoins.length > 0 && obj[join.alias]) {
            for (const nested of join.nestedJoins) {
              const nfkInfo = getJoinInfo(nested.table, join.table);
              if (nfkInfo && obj[join.alias][nested.table]) {
                obj[join.alias][nested.alias] = obj[join.alias][nested.table];
                delete obj[join.alias][nested.table];
              }
            }
          }
        }

        return obj;
      });

      if (this.isSingle) {
        return { data: processed[0] || null, error: processed.length === 0 ? { message: 'No rows found', code: 'PGRST116' } : null };
      }
      if (this.isMaybeSingle) {
        return { data: processed[0] || null, error: null };
      }

      return { data: processed, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

export class LocalMutation {
  private table: string;
  private obj: any;
  private mode: string;
  private conflict: string | null;
  private returnCols: string[] = [];
  private isSingle: boolean = false;

  constructor(table: string, obj: any, mode: string, conflict?: string | null) {
    this.table = table;
    this.obj = obj;
    this.mode = mode;
    this.conflict = conflict ?? null;
  }

  select(columns: string): this {
    const parsed = parseSelect(columns);
    this.returnCols = parsed.topLevel;
    return this;
  }

  single(): Promise<{ data: any; error: any }> {
    this.isSingle = true;
    return this.execute();
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      const db = getDb();
      const now = new Date().toISOString();

      if (this.mode === 'insert') {
        const obj = { ...this.obj };
        if (!obj.id) obj.id = uuidv4();
        if (!obj.createdAt) obj.createdAt = now;

        const cols = Object.keys(obj);
        const vals = cols.map(c => {
          const v = obj[c];
          if (v === undefined) return null;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return v;
        });
        const placeholders = vals.map(() => '?').join(', ');
        const quotedCols = cols.map(c => `"${c}"`).join(', ');

        db.prepare(`INSERT INTO "${this.table}" (${quotedCols}) VALUES (${placeholders})`).run(...vals);

        if (!this.isSingle) {
          return { data: null, error: null };
        }

        const id = obj.id;
        const allCols = allColumns(this.table).map(c => `"${c}"`).join(', ');
        const row = db.prepare(`SELECT ${allCols} FROM "${this.table}" WHERE "id" = ?`).get(id) as any;
        return { data: row || obj, error: null };
      }

      if (this.mode === 'upsert') {
        const obj = { ...this.obj };
        if (!obj.id) obj.id = uuidv4();

        const conflictCols = this.conflict ? this.conflict.split(',').map((c: string) => c.trim()) : ['id'];

        const whereClauses = conflictCols.map((c: string) => `"${c}" = ?`).join(' AND ');
        const whereVals = conflictCols.map((c: string) => obj[c]);

        const existing = db.prepare(`SELECT id FROM "${this.table}" WHERE ${whereClauses}`).get(...whereVals) as any;

        if (existing) {
          const setClauses = Object.keys(obj)
            .filter(k => !conflictCols.includes(k))
            .map(k => `"${k}" = ?`)
            .join(', ');
          const setVals = Object.keys(obj)
            .filter(k => !conflictCols.includes(k))
            .map(k => {
              const v = obj[k];
              if (typeof v === 'boolean') return v ? 1 : 0;
              return v;
            });

          if (setClauses) {
            db.prepare(`UPDATE "${this.table}" SET ${setClauses} WHERE ${whereClauses}`).run(...setVals, ...whereVals);
          }
          obj.id = existing.id;
        } else {
          if (!obj.createdAt) obj.createdAt = now;
          const cols = Object.keys(obj);
          const vals = cols.map(c => {
            const v = obj[c];
            if (v === undefined) return null;
            if (typeof v === 'boolean') return v ? 1 : 0;
            return v;
          });
          const placeholders = vals.map(() => '?').join(', ');
          db.prepare(`INSERT INTO "${this.table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`).run(...vals);
        }

        return { data: null, error: null };
      }

      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

function createQuery(table: string): LocalQuery {
  return new LocalQuery(table);
}

export function createClient() {
  return {
    from: (table: string) => createQuery(table),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
}
