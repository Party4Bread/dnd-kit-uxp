import {
  configurator,
  Modifier,
  type DragOperation,
  type DragDropManager,
  type Draggable,
  type Droppable,
} from '@dnd-kit/abstract';

interface Options {
  axis: 'x' | 'y';
  value: number;
}

export class AxisModifier extends Modifier<
  DragDropManager<Draggable, Droppable>,
  Options
> {
  apply({transform}: DragOperation) {
    if (!this.options) {
      return transform;
    }

    const {axis, value} = this.options;

    return {
      ...transform,
      [axis]: value,
    };
  }

  static configure = configurator(AxisModifier);
}

export const RestrictToVerticalAxis = AxisModifier.configure({
  axis: 'x',
  value: 0,
});

export const RestrictToHorizontalAxis = AxisModifier.configure({
  axis: 'y',
  value: 0,
});
