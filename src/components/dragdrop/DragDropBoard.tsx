import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  defaultDropAnimation,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import BoardSection from './BoardSection';
import DDItem from './DDItem';
import { BoardSectionType, DDCategory, DDType } from './types';
import { findBoardSectionContainer } from './utils/board';

type DragDropBoardProps<T extends DDType> = {
  categories: DDCategory<string>[];
  items: T[];
  onChange: Function;
  isCategory: (item: T, category: DDCategory<any>) => boolean;
  cardRenderer?: (item: T) => ReactNode;
};

const DragDropBoard = <T extends DDType,>({ items, onChange, categories, isCategory, cardRenderer }: DragDropBoardProps<T>) => {
  const [boardSections, setBoardSections] = useState<BoardSectionType<T>>();

  useEffect(() => {
    const initialBoardSections = initializeBoard(items);
    setBoardSections(initialBoardSections);
  }, [items]);


  const [activeItemId, setActiveItemId] = useState<null | number>(null);

  const [changes, setChanges] = useState<Map<string, unknown>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Enable sort function when dragging 5px   💡 here!!!
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveItemId(active.id as number);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // Find the containers
    const activeContainer = findBoardSectionContainer(boardSections!, active.id);
    const overContainer = findBoardSectionContainer(boardSections!, over?.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }


    setBoardSections((boardSection) => {
      const activeItems = boardSection![activeContainer];
      const overItems = boardSection![overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id !== over?.id);

      return {
        ...boardSection,
        [activeContainer]: [
          ...boardSection![activeContainer].filter(
            (item) => item.id !== active.id
          ),
        ],
        [overContainer]: [
          ...boardSection![overContainer].slice(0, overIndex),
          boardSections![activeContainer][activeIndex],
          ...boardSection![overContainer].slice(
            overIndex,
            boardSection![overContainer].length
          ),
        ],
      };
    });
  };

  // We might have to expose this, so that handling order is possible.
  const handleDragEnd = ({ active, over }: DragEndEvent) => {

    const activeContainer = findBoardSectionContainer(
      boardSections!,
      active.id as number
    );
    const overContainer = findBoardSectionContainer(
      boardSections!,
      over?.id as number
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = boardSections![activeContainer].findIndex(
      (item: T) => item.id === active.id
    );
    const overIndex = boardSections![overContainer].findIndex(
      (item: T) => item.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setBoardSections((boardSection) => ({
        ...boardSection,
        [overContainer]: arrayMove(
          boardSection![overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    changes.set("containerId", active.data.current?.sortable.containerId);
    setChanges({ ...changes });

    // sends the changes back to be persisted outside drag and drop component
    onChange(changes, item);
    setChanges(new Map());

    setActiveItemId(null);
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  const getItemById = (items: T[], id: number) => {
    return items.find((item) => item.id === id);
  };

  const item = activeItemId ? getItemById(items, activeItemId) : null;

  const initializeBoard = (items: T[]) => {
    const boardSections: BoardSectionType<T> = {};

    categories.forEach((category) => {
      boardSections[category.value] = getItemsByCategory(
        items,
        category
      );
    });

    return boardSections;
  };

  const getItemsByCategory = (items: T[], category: DDCategory<any>) => {
    return items.filter(t => isCategory(t, category));
  };

  const columnWidth = 1 / categories.length;
  return (boardSections &&
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {categories.map((cat) => <TableCell sx={{ border: 1, width: columnWidth }}>{cat.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {categories.map((cat) =>
              <TableCell sx={{ verticalAlign: 'top', padding: 0, border: 1, backgroundColor: '#eee', }} >
                <BoardSection id={cat.value}
                  items={boardSections[cat.value]}
                  cardRenderer={cardRenderer} />
              </TableCell>
            )}
          </TableRow>
        </TableBody>
        <DragOverlay dropAnimation={dropAnimation}>
          {item ?
            cardRenderer ? cardRenderer(item) : <DDItem item={item} />
            : null}
        </DragOverlay>
      </Table>
    </DndContext>
  );
};

export default DragDropBoard;
