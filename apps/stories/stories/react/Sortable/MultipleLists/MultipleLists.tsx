import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {flushSync} from 'react-dom';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {supportsViewTransition} from '@dnd-kit/dom/utilities';

import {
  Actions,
  Container,
  Item,
  Handle,
  Remove,
} from '../../components/index.ts';
import {createRange} from '../../../utilities/createRange.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';

interface Props {
  debug?: boolean;
  grid?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  scrollable?: boolean;
  vertical?: boolean;
}

export function MultipleLists({
  debug,
  defaultItems,
  grid,
  itemCount,
  columnStyle,
  scrollable,
  vertical,
}: Props) {
  const [items, setItems] = useState(
    defaultItems ?? {
      A: createRange(itemCount).map((id) => `A${id}`),
      B: createRange(itemCount).map((id) => `B${id}`),
      C: createRange(itemCount).map((id) => `C${id}`),
      D: [],
    }
  );
  const [columns, setColumns] = useState(Object.keys(items));
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (!source || !target || source.id === target.id) {
          return;
        }

        if (source.type === 'column') {
          setColumns((columns) => move(columns, source, target));
          return;
        }

        setItems((items) => move(items, source, target));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
        }
      }}
    >
      <div
        style={{
          display: grid ? 'grid' : 'flex',
          width: grid ? '60%' : undefined,
          gridTemplateColumns: grid ? '1fr 1fr' : undefined,
          alignItems: vertical ? 'center' : undefined,
          margin: grid ? '0 auto' : undefined,
          flexDirection: vertical ? 'column' : 'row',
          gap: 20,
        }}
      >
        {columns.map((column, columnIndex) => {
          const rows = items[column];
          const children =
            rows.length > 0
              ? rows.map((id, index) => (
                  <SortableItem
                    key={id}
                    id={id}
                    column={column}
                    index={index}
                    onRemove={handleRemoveItem}
                    style={grid ? {height: 100} : undefined}
                  />
                ))
              : null;

          return (
            <SortableColumn
              key={column}
              id={column}
              index={columnIndex}
              columns={grid ? 2 : 1}
              scrollable={scrollable}
              style={columnStyle}
            >
              {children}
            </SortableColumn>
          );
        })}
      </div>
    </DragDropProvider>
  );

  function handleRemoveItem(id: string, column: string) {
    const remove = () =>
      setItems((items) => ({
        ...items,
        [column]: items[column].filter((item) => item !== id),
      }));

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(remove));
    } else {
      remove();
    }
  }
}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: React.CSSProperties;
  onRemove?: (id: string, column: string) => void;
}

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

function SortableItem({
  id,
  column,
  index,
  style,
  onRemove,
}: PropsWithChildren<SortableItemProps>) {
  const {handleRef, ref, isDragSource} = useSortable({
    id,
    group: column,
    accept: 'item',
    type: 'item',
    feedback: 'clone',
    index,
  });

  return (
    <Item
      ref={ref}
      actions={
        <Actions>
          {onRemove && !isDragSource ? (
            <Remove onClick={() => onRemove(id, column)} />
          ) : null}
          <Handle ref={handleRef} />
        </Actions>
      }
      accentColor={COLORS[column]}
      shadow={isDragSource}
      style={style}
      transitionId={`sortable-${column}-${id}`}
    >
      {id}
    </Item>
  );
}

interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

function SortableColumn({
  children,
  columns,
  id,
  index,
  scrollable,
  style,
}: PropsWithChildren<SortableColumnProps>) {
  const {handleRef, isDragSource, ref} = useSortable({
    id,
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index,
  });

  return (
    <Container
      ref={ref}
      label={`${id}`}
      actions={
        <Actions>
          <Handle ref={handleRef} />
        </Actions>
      }
      columns={columns}
      shadow={isDragSource}
      scrollable={scrollable}
      transitionId={`sortable-column-${id}`}
      style={style}
    >
      {children}
    </Container>
  );
}
