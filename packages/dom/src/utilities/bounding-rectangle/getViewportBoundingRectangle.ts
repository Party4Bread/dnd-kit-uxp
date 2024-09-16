import type {BoundingRectangle} from '@dnd-kit/geometry';

import {getDocument} from '../execution-context/index.ts';

/**
 * Returns the bounding rectangle of the viewport
 * @param element
 * @returns BoundingRectangle
 */
export function getViewportBoundingRectangle(
  element: Element
): BoundingRectangle {
  const {documentElement} = getDocument(element);
  const width = documentElement.clientWidth;
  const height = documentElement.clientHeight;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
}
