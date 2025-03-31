import {wrapInTry} from '@augment-vir/common';
import {extractEventTarget} from '@augment-vir/web';
import {type Duration, type DurationUnit} from 'date-vir';
import {css, defineElementNoInputs, html, listen, nothing} from 'element-vir';
import {defineShape, isValidShape} from 'object-shape-tester';
import {type BoxPlacement, RunAlgorithm} from '../../data/run-algorithm.js';
import {VirBox} from './vir-box.element.js';

const interiorBoxesShape = defineShape([-1]);

export const VirApp = defineElementNoInputs({
    tagName: 'vir-app',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 32px;
            padding: 32px;
            font-family: sans-serif;
        }

        .controls {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: flex-end;
        }

        label {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
    `,
    state() {
        return {
            boundingSize: 10,
            interiorBoxes: [
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
            boxPlacements: [] as BoxPlacement[],
            /** Duration per placement */
            speed: {milliseconds: 200} as Duration<DurationUnit.Milliseconds>,
            currentAlgorithm: undefined as undefined | RunAlgorithm,
            solution: undefined as boolean | undefined,
        };
    },
    render({state, updateState}) {
        function initAlgorithm() {
            if (state.currentAlgorithm) {
                state.currentAlgorithm.exited = true;
            }

            const newAlgorithm = new RunAlgorithm(
                state.boundingSize,
                state.interiorBoxes,
                state.speed,
                (update) => {
                    if (update.placement) {
                        updateState({
                            boxPlacements: [
                                ...state.boxPlacements,
                                update.placement,
                            ],
                        });
                    } else {
                        updateState({
                            solution: update.solution,
                        });
                    }
                },
            );

            updateState({
                solution: undefined,
                boxPlacements: [],
                currentAlgorithm: newAlgorithm,
            });

            void newAlgorithm.start();
        }

        if (!state.currentAlgorithm) {
            initAlgorithm();
        }

        return html`
            <div class="controls">
                <label>
                    Bounding Box
                    <input
                        .value=${state.boundingSize}
                        type="number"
                        ${listen('change', (event) => {
                            const element = extractEventTarget(event, HTMLInputElement);
                            const value = Number(element.value);

                            if (isNaN(value)) {
                                return;
                            }

                            updateState({
                                boundingSize: value,
                            });
                        })}
                    />
                </label>
                <label>
                    Interior boxes (JSON)
                    <input
                        .value=${JSON.stringify(state.interiorBoxes)}
                        ${listen('change', (event) => {
                            const element = extractEventTarget(event, HTMLInputElement);
                            const value = wrapInTry(() => JSON.parse(element.value), {
                                fallbackValue: undefined,
                            });

                            if (!isValidShape(value, interiorBoxesShape)) {
                                return;
                            }

                            updateState({
                                interiorBoxes: value,
                            });
                        })}
                    />
                </label>
                <label>
                    ms / step (speed)
                    <input
                        .value=${state.speed.milliseconds}
                        type="number"
                        ${listen('change', (event) => {
                            const element = extractEventTarget(event, HTMLInputElement);
                            const value = Number(element.value);

                            if (isNaN(value)) {
                                return;
                            }

                            updateState({
                                speed: {milliseconds: value},
                            });
                        })}
                    />
                </label>
                <button
                    ${listen('click', () => {
                        initAlgorithm();
                    })}
                >
                    Start
                </button>
            </div>
            ${state.currentAlgorithm
                ? html`
                      <${VirBox.assign({
                          boundingSize: state.currentAlgorithm.boundingSize,
                          boxPlacements: state.boxPlacements,
                          solution: state.solution,
                      })}></${VirBox}>
                  `
                : nothing}
        `;
    },
});
