import { TouchEvent, MouseEvent } from 'react';

export type CanvasMouseEvent = MouseEvent<HTMLCanvasElement>;
export type CanvasTouchEvent = TouchEvent<HTMLCanvasElement>;
export type CanvasInteractionEvent = CanvasMouseEvent | CanvasTouchEvent;

export interface Point {
  x: number;
  y: number;
}

export interface InpaintOptions {
  maskPng: string;
  prompt: string;
}