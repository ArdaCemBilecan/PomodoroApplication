// Type declarations for modules without type definitions

declare module '@capacitor-community/sqlite' {
  export const CapacitorSQLite: {
    createConnection(options: {
      database: string;
      version: number;
      encrypted: boolean;
      mode: string;
    }): Promise<unknown>;
    open(options: { database: string }): Promise<void>;
    execute(options: { database: string; statements: string }): Promise<{ changes?: { changes: number } }>;
    run(options: {
      database: string;
      statement: string;
      values: unknown[];
    }): Promise<{ changes?: { changes: number; lastId: number } }>;
    query(options: {
      database: string;
      statement: string;
      values: unknown[];
    }): Promise<{ values?: Record<string, unknown>[] }>;
  };
}
