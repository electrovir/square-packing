import {copyThroughJson, createArray, wait, type Coords} from '@augment-vir/common';
import {convertDuration, type AnyDuration, type Duration, type DurationUnit} from 'date-vir';
import type {RequireExactlyOne} from 'type-fest';

export type BoxPlacement = {size: number} & Coords;

export class RunAlgorithm {
    private speed: Duration<DurationUnit.Milliseconds>;
    private interiorBoxes: number[];
    /** A value of `true` indicates that the position is filled. */
    private grid: boolean[][];

    /** Set this to true to stop operations. */
    public exited = false;
    public solution: boolean | undefined = undefined;

    constructor(
        public readonly boundingSize: number,
        interiorBoxes: ReadonlyArray<number>,
        speed: AnyDuration,
        private update: (
            params: Readonly<
                RequireExactlyOne<{
                    placement: Readonly<BoxPlacement>;
                    solution: boolean;
                }>
            >,
        ) => void,
    ) {
        this.speed = convertDuration(speed, {milliseconds: true});
        this.interiorBoxes = copyThroughJson(interiorBoxes).sort().reverse();
        this.grid = createArray(boundingSize, () => {
            return createArray(boundingSize, () => false);
        });
    }

    public async start() {
        await this.stepThroughAlgorithm();
    }

    private findNextPosition(boxSize: number) {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid.length; y++) {
                if (
                    this.doesFit({
                        size: boxSize,
                        x,
                        y,
                    })
                ) {
                    return {x, y};
                }
            }
        }

        return undefined;
    }

    private doesFit(placement: Readonly<BoxPlacement>): boolean {
        for (let x = placement.x; x < placement.size + placement.x; x++) {
            for (let y = placement.y; y < placement.size + placement.y; y++) {
                if (this.grid[x]?.[y] === true || this.grid[x]?.[y] == undefined) {
                    return false;
                }
            }
        }

        return true;
    }

    private fillPosition(placement: Readonly<BoxPlacement>) {
        for (let x = placement.x; x < placement.x + placement.size; x++) {
            for (let y = placement.y; y < placement.y + placement.size; y++) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.grid[x]![y] = true;
            }
        }
    }

    private async stepThroughAlgorithm() {
        if (this.exited || this.solution !== undefined) {
            return;
        }

        const currentBox = this.interiorBoxes.splice(0, 1)[0];
        if (currentBox === 0) {
            await this.stepThroughAlgorithm();
            return;
        }

        if (currentBox === undefined) {
            this.solution = true;
            this.update({solution: true});
            return;
        }

        const position = this.findNextPosition(currentBox);

        if (!position) {
            this.solution = false;
            this.update({solution: false});
            return;
        }

        this.fillPosition({
            size: currentBox,
            ...position,
        });

        this.update({
            placement: {
                size: currentBox,
                x: position.x,
                y: position.y,
            },
        });

        await wait(this.speed);
        await this.stepThroughAlgorithm();
    }
}
