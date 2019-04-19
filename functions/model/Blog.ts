export default interface Blog {
  guides?: Post[];
}

export interface Post {
  title: string;
  content: string;
}
