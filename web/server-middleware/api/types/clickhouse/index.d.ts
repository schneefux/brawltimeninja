/// <reference types="node" />

declare module 'clickhouse' {
  import {Stream} from 'stream';

  interface Response<T> {
    meta: {}
    data: T[]
    totals: {}
    rows: {}
    statistics: {}
  }
  interface Options extends Record<string, string|boolean|number|any> {
    debug: boolean
    url: string
    host: string
    port: number
    protocol: string
    database: string
    username: string
    password: string
    basicAuth: {
      username: string
      password: string
    }
    config: {
      database: string
      session_timeout: number
      output_format_json_quote_64bit_integers: number
      enable_http_compression: number
      session_id: string
    }
    format: 'json'|'tsv'|'csv'
    isUseGzip: boolean
    isSessionPerQuery: boolean
  }
  type execCallback = <T>(error: Error|null, rows?: Response<T>['data']|Response<T>|{r: 1}) => void;

  type Value = string|number|object|boolean|any;

  export class ClickHouse {
    constructor(opts: Options);

    query<T>(query: String, callback: execCallback<T>): void;
    query<U, T>(query: String, data: string[]|U[]|U, callback: execCallback<T>): void;
    query<U, T>(query: String, data: string[]|U[]|U, options: Options, callback: execCallback<T>): void;

    query<U, T>(query: String, data: string[]|U[]|U, options?: Options): QueryCursor<T>;

    insert<T>(query: String, data: string[]): QueryCursor<T>;
    insert<T>(query: String, data: Value[]): QueryCursor<T>;

    sessionId: string;
  }

  export class WriteStream<T extends Value> extends Stream.Transform {
    writeRow(data: T[]): Promise<void>;
    exec(): Promise<Response<T>['data']|Response<T>|{r: 1}>;
  }

  class QueryCursor<T> {
    toPromise(): Promise<Response<T>>;
    exec(callback: callbackExec<T>): void;
    stream(): Stream & WriteStream<T>;
  }
}
