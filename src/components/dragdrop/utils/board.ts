import { UniqueIdentifier } from '@dnd-kit/core';
import { BoardSectionType, DDType } from '../types';

export const findBoardSectionContainer = <T extends DDType,>(
  boardSections: BoardSectionType<T>,
  id: UniqueIdentifier | undefined
) => {
  if (id) {
    if (id in boardSections) {
      return id;
    }

    const container = Object.keys(boardSections).find((key) =>
      boardSections[key].find((item) => item.id === id)
    );
    return container;
  }
  return undefined;
};