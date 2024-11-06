import { UniqueIdentifier } from '@dnd-kit/core';

export type BoardSectionType<T> = {
  [name: string]: T[];
};

export interface DDType {
  id: UniqueIdentifier
}

export interface DDCategory<T>{
  value: T;
  label: string;
}