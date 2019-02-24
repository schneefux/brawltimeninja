export interface Response<T> {
  status: string;
  meta: {
    count: number;
  };
  data: T;
}

export interface PlayerIdentifier {
  nickname: string;
  account_id: number;
}
