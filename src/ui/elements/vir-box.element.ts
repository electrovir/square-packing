import {css, defineElement, html} from 'element-vir';
import type {BoxPlacement} from '../../data/run-algorithm.js';

const boxSize = 40; // px

export const VirBox = defineElement<{
    boundingSize: number;
    boxPlacements: ReadonlyArray<Readonly<BoxPlacement>>;
    solution: undefined | boolean;
}>()({
    tagName: 'vir-box',
    hostClasses: {
        'vir-box-success': ({inputs}) => inputs.solution === true,
        'vir-box-failure': ({inputs}) => inputs.solution === false,
    },
    styles: ({hostClasses}) => css`
        .bounding-box {
            position: relative;
            border: 4px solid grey;
        }

        .placed-box {
            position: absolute;
            box-sizing: border-box;
            border: 2px solid white;
            background-color: dodgerblue;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            font-size: ${boxSize - 4}px;
        }

        ${hostClasses['vir-box-failure'].selector} .bounding-box {
            border-color: red;
        }
        ${hostClasses['vir-box-success'].selector} .bounding-box {
            border-color: limegreen;
        }
    `,
    render({inputs}) {
        const placementTemplates = inputs.boxPlacements.map((placement) => {
            return html`
                <div
                    class="placed-box"
                    style=${css`
                        width: ${placement.size * boxSize}px;
                        height: ${placement.size * boxSize}px;
                        left: ${placement.x * boxSize}px;
                        top: ${placement.y * boxSize}px;
                    `}
                >
                    <span>${placement.size}</span>
                </div>
            `;
        });

        return html`
            <div
                class="bounding-box"
                style=${css`
                    width: ${boxSize * inputs.boundingSize}px;
                    height: ${boxSize * inputs.boundingSize}px;
                `}
            >
                ${placementTemplates}
            </div>
        `;
    },
});
