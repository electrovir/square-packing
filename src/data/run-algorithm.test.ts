import {describe, itCases} from '@augment-vir/test';
import {RunAlgorithm} from './run-algorithm.js';

describe(RunAlgorithm.name, () => {
    async function testAlgorithm({
        boundingSize,
        boxes,
    }: Readonly<{boundingSize: number; boxes: ReadonlyArray<number>}>) {
        const instance = new RunAlgorithm(boundingSize, boxes, {milliseconds: 0}, () => {});
        await instance.start();
        return instance.solution;
    }

    itCases(testAlgorithm, [
        {
            it: 'fills the whole bounding box',
            input: {
                boundingSize: 10,
                boxes: [
                    5,
                    5,
                    4,
                    3,
                    3,
                    2,
                    2,
                    2,
                    1,
                    1,
                    1,
                    1,
                ],
            },
            expect: true,
        },
    ]);
});
