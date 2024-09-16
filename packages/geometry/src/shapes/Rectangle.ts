import {Point} from '../point';
import {BoundingRectangle} from '../types';

import type {Shape} from './Shape';

export class Rectangle implements Shape {
  constructor(
    public left: number,
    public top: number,
    public width: number,
    public height: number
  ) {}

  public scale = {
    x: 1,
    y: 1,
  };

  public get inverseScale() {
    return {
      x: 1 / this.scale.x,
      y: 1 / this.scale.y,
    };
  }

  public translate(x: number, y: number): Rectangle {
    const {top, left, width, height, scale} = this;
    const newShape = new Rectangle(left + x, top + y, width, height);
    newShape.scale = {...scale};

    return newShape;
  }

  public get boundingRectangle(): BoundingRectangle {
    const {width, height, left, top, right, bottom} = this;

    return {width, height, left, top, right, bottom};
  }

  public get center(): Point {
    const {left, top, right, bottom} = this;

    return new Point((left + right) / 2, (top + bottom) / 2);
  }

  public get area(): number {
    const {width, height} = this;

    return width * height;
  }

  public equals(shape: Shape): boolean {
    if (!(shape instanceof Rectangle)) {
      return false;
    }

    const {left, top, width, height} = this;

    return (
      left === shape.left &&
      top === shape.top &&
      width === shape.width &&
      height === shape.height
    );
  }

  public containsPoint(point: Point): boolean {
    const {top, left, bottom, right} = this;

    return (
      top <= point.y && point.y <= bottom && left <= point.x && point.x <= right
    );
  }

  public intersectionArea(shape: Shape): number {
    if (shape instanceof Rectangle) {
      return rectangleRectangleIntersection(this, shape);
    }

    return 0;
  }

  public intersectionRatio(shape: Shape): number {
    const {area} = this;
    const intersectionArea = this.intersectionArea(shape);
    const intersectionRatio =
      intersectionArea / (shape.area + area - intersectionArea);

    return intersectionRatio;
  }

  public get bottom(): number {
    const {top, height} = this;

    return top + height;
  }

  public get right(): number {
    const {left, width} = this;

    return left + width;
  }

  static from({top, left, width, height}: BoundingRectangle) {
    return new Rectangle(left, top, width, height);
  }

  static intersectionRatio(a: BoundingRectangle, b: BoundingRectangle): number {
    return Rectangle.from(a).intersectionRatio(Rectangle.from(b));
  }
}

function rectangleRectangleIntersection(
  a: BoundingRectangle,
  b: BoundingRectangle
): number {
  const top = Math.max(b.top, a.top);
  const left = Math.max(b.left, a.left);
  const right = Math.min(b.left + b.width, a.left + a.width);
  const bottom = Math.min(b.top + b.height, a.top + a.height);
  const width = right - left;
  const height = bottom - top;

  // Rectangles overlap
  if (left < right && top < bottom) {
    const intersectionArea = width * height;

    return intersectionArea;
  }

  // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
  return 0;
}
