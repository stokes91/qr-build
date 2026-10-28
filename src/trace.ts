export type Stage =
  | "input"
  | "segments"
  | "padding"
  | "correction"
  | "interleave"
  | "finders"
  | "timing"
  | "alignment"
  | "reserved"
  | "data"
  | "remainder"
  | "masks"
  | "mask"
  | "format"
  | "complete";

export interface Event {
  stage: Stage;
  source: string;
  label: string;
  x?: number;
  y?: number;
  value?: number;
  bitIndex?: number;
  values?: number[];
  grid?: number[];
  mask?: number;
  penalty?: number;
}

export type Observe = (event: Event) => void;

export class Trace {
  events: Event[] = [];
  constructor(public size: number) {}
  observe: Observe = (event) => {
    this.events.push(event);
  };
  frame(index: number): Int8Array {
    const grid = new Int8Array(this.size * this.size).fill(-1);
    for (let i = 0; i < Math.min(index, this.events.length); i++) {
      const event = this.events[i];
      if (event.grid) grid.set(event.grid);
      if (event.x !== undefined && event.y !== undefined) {
        grid[event.y * this.size + event.x] = event.value!;
      }
    }
    return grid;
  }
}
