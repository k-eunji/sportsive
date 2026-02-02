// src/types/common.ts
export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

export type Timestamp = string | number | Date;
