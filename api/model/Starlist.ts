export interface StarlistBrawler {
  id: number;
  avatarId: number;
  name: string;
  hash: string;
  path: string;
  released: boolean;
  version: number;
  link: string; // starlist detail page
  imageUrl: string; // avatar with border
  imageUrl2: string; // avatar without border
  class: string;
  rarity: string;
  unlock: number; // trophies
  description: string;
  starPowers: {
    id: number;
    name: string;
    path: string;
    description: string;
    imageUrl: string;
    released: boolean;
  }[];
  videos: {
    type: number;
    name: string;
    description: string;
    duration: string;
    videoUrl: string;
    previewUrl: string;
    uploadDate: string;
  }[];
}

export interface StarlistMap {
  id: number;
  new: boolean;
  disabled: boolean;
  name: string;
  hash: string;
  version: number;
  link: string; // starlist detail page
  imageUrl: string;
  credit: string;
  environment: {
    id: number;
    name: string;
    hash: string;
    path: string;
    version: number;
    imageUrl: string;
  };
  gameMode: {
    id: number;
    name: string;
    hash: string;
    version: number;
    link: string; // starlist detail page
    imageUrl: string;
  };
}
