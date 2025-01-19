import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getDeviceType } from "../common";

const LOCAL_STORAGE_KEY = "gameState";
const defaultDataForLocalStorage = () => ({
    phase: "ready",
    blocksSeed: 0,
    startTime: 0,
    endTime: 0,
    deviceType: getDeviceType(),
    windowSize: {
        width: window.innerWidth,
        height: window.innerHeight,
    },
});

const saveToLocalStorage = (state) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
};

const loadInitialState = () => {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const state = {
                blocksCounts: 4,
                scores: [],
                currentBall: 0,
                ...JSON.parse(savedState),
                ...defaultDataForLocalStorage(),
            }
            state.blocksCounts = state.blocksCounts > 502 ? 502 : state.blocksCounts
            return state;
        }
    } catch (error) {
        console.error("Error parsing localStorage data:", error);
    }

    return {
        blocksCounts: 4,
        scores: [],
        currentBall: 0,
        ...defaultDataForLocalStorage(),
    };
};

export default create(
    subscribeWithSelector((set, get) => ({
        ...loadInitialState(),
        play: false,
        setPlay:(play)=>{
            set(() => ({ play }));
        },
        setWindowSize: (windowSize) => {
            set(() => ({ windowSize }));
        },

        setDeviceType: (deviceType) => {
            set(() => ({ deviceType }));
        },

        changeCurrentBall: (currentBall) => {
            set(() => {
                const newState = {
                    currentBall,
                    ...defaultDataForLocalStorage()
                };
                saveToLocalStorage(newState);
                return newState;
            });
        },

        start: () => {
            set((state) => {
                if (state.phase === "ready" && state.play) {
                    const newState = {
                        ...state, phase: "playing", startTime: Date.now(),
                    };
                    saveToLocalStorage(newState);
                    return newState;
                }
                return {};
            });
        },

        restart: () => {
            set((state) => {
                if (["playing", "ended"].includes(state.phase)) {
                    const newScores = [...state.scores];
                    let newBlocksCounts = state.blocksCounts
                    if (state.phase === "ended") {
                        newScores[(state.blocksCounts / 2) - 2] = (
                            (state.endTime - state.startTime) /
                            1000
                        ).toFixed(2);
                        newBlocksCounts += 2
                        newBlocksCounts = newBlocksCounts > 502 ? 502 : newBlocksCounts
                    }

                    const newState = {
                        ...state,
                        blocksCounts: newBlocksCounts,
                        phase: "ready",
                        blocksSeed: Math.random(),
                        scores: newScores,
                    };
                    saveToLocalStorage(newState);
                    return newState;
                }
                return {};
            });
        },

        end: () => {
            set((state) => {
                if (state.phase === "playing") {
                    const newState = {
                        ...state, phase: "ended", endTime: Date.now(),
                    };
                    saveToLocalStorage(newState);
                    return newState;
                }
                return {};
            });
        },

        gameReset: () => {
            set(() => {
                const newState = {
                    blocksCounts: 4,
                    blocksSeed: Math.random(),
                    startTime: 0,
                    endTime: 0,
                    phase: "ready",
                    scores: [],
                };
                saveToLocalStorage(newState);
                return newState;
            });
        },

        levelRestart: () => {
            set((state) => {
                const newState = {
                    ...state,
                    blocksSeed: Math.random(),
                    startTime: 0,
                    endTime: 0,
                    phase: "ready",

                };
                saveToLocalStorage(newState);
                return newState;
            });
        },
    }))
);
