import { useKeyboardControls } from '@react-three/drei'
import React, { useEffect, useRef, useState } from 'react'
import useGame from './stores/useGame'
import { addEffect } from '@react-three/fiber'
import { Joystick } from 'react-joystick-component'
import { arraysEqual, exitFullScreen, makeFullScreen, toggleFullScreen, toggleMusic, triggerKeyPress, triggerKeyRelease } from './common'
import { ball, jumpBTN, menuTop, score, scoresTop, musicPaused, musicStart, FullScreen, reset, playBTN, ExitFullScreen } from './svgs'

function Interface() {

    const prevKeysRef = useRef([]);

    const time = useRef()
    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    const phase = useGame(state => state.phase)
    const restart = useGame(state => state.restart)
    const gameReset = useGame(state => state.gameReset)
    const levelRestart = useGame(state => state.levelRestart)
    const scores = useGame(state => state.scores)
    const currentBall = useGame(state => state.currentBall)
    const changeCurrentBall = useGame(state => state.changeCurrentBall)
    const deviceType = useGame(state => state.deviceType)
    const play = useGame(state => state.play)
    const setPlay = useGame(state => state.setPlay)


    const [openScoreBoard, setOpenScoreBoard] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const [openBallChangePopup, setOpenBallChangePopup] = useState(false)
    const [ballHoverIndex, setballHoverIndex] = useState(currentBall)

    const ballsUrl = [
        './balls/pokemon_basic_pokeball.png',
        './balls/sci_fi_football.png',
        './balls/volleyball.png',
        './balls/normal_ball.png',
    ]

    useEffect(() => {
        const unSub = addEffect(() => {
            const state = useGame.getState()
            let elapsedTime = 0
            if (state.phase == 'playing')
                elapsedTime = Date.now() - state.startTime
            else if (state.phase == 'ended')
                elapsedTime = state.endTime - state.startTime

            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)
            if (time.current)
                time.current.textContent = elapsedTime
        })
        return () => {
            unSub()
        }
    }, [])


    const handleMove = (data) => {
        const x = data.x;
        const y = data.y;

        const margin = 0.20;

        // Define the current key presses based on the direction
        let currentKeys = [];

        if (Math.abs(x) <= margin && y > margin) {
            currentKeys = ["ArrowUp"];
        } else if (Math.abs(x) <= margin && y < -margin) {
            currentKeys = ["ArrowDown"];
        } else if (x < 0 && Math.abs(y) <= margin) {
            currentKeys = ["ArrowLeft"];
        } else if (x > 0 && Math.abs(y) <= margin) {
            currentKeys = ["ArrowRight"];
        } else if (x < 0 && y > 0) {
            currentKeys = ["ArrowLeft", "ArrowUp"];
        } else if (x > 0 && y > 0) {
            currentKeys = ["ArrowRight", "ArrowUp"];
        } else if (x < 0 && y < 0) {
            currentKeys = ["ArrowLeft", "ArrowDown"];
        } else if (x > 0 && y < 0) {
            currentKeys = ["ArrowRight", "ArrowDown"]
        }

        if (arraysEqual(currentKeys, prevKeysRef.current)) {
            triggerKeyPress(currentKeys);
        }
        else {
            triggerKeyPress(currentKeys);
            triggerKeyRelease(prevKeysRef.current);
            prevKeysRef.current = currentKeys;
        }

    };

    const handleStop = () => {
        triggerKeyRelease(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyS", "KeyA", "KeyD"]);
    };

    const handleJump = () => {

        triggerKeyPress(["Space"]);
        triggerKeyRelease(["Space"]);
    };

    return (
        <div className='interface' >
            <audio id="backgroundMusic" src="./music.mp3" loop hidden ></audio>

            {play ? <>
                <div className={`scoresButton ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => {
                    setOpenScoreBoard(!openScoreBoard)
                }} >
                    {scoresTop} Scores
                </div>
                <div className={`resetLevelButton ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { setOpenMenu(!openMenu) }} >
                    {menuTop} <span>menu</span>
                </div>
                <div className='time' ref={time} >
                    0.00
                </div>
                {
                    phase == 'ended' && <div className="restart" onClick={() => { restart(); }} >
                        CLick For Next Level
                    </div>
                }

                {
                    deviceType == 'laptop' ? <div className="controls">
                        <div className="raw">
                            <div className={`key ${forward ? 'active' : ''}`}></div>
                        </div>
                        <div className="raw">
                            <div className={`key ${leftward ? 'active' : ''}`}></div>
                            <div className={`key ${backward ? 'active' : ''}`}></div>
                            <div className={`key ${rightward ? 'active' : ''}`}></div>
                        </div>
                        <div className="raw">
                            <div className={`key large ${jump ? 'active' : ''}`}></div>
                        </div>
                    </div> :
                        <>
                            <div className='nonLaptopcontrols' >
                                <Joystick size={deviceType == "tablet" ? 160 : 100} baseColor="black" stickColor="grey" move={handleMove} stop={handleStop}></Joystick>
                            </div>
                            <button
                                className="nonLaptopJumpBtn"
                                onPointerDown={(e) => { handleJump(); e.target.style.transform = 'scale(0.85)'; }}
                                onPointerUp={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                {jumpBTN}
                            </button>
                        </>
                }


                <div className={`scoresBoard ${openScoreBoard ? '' : 'hidden'}`}>
                    <div>
                        <div>
                            Your Score
                            <span className='scoreCloseButton' onClick={() => {
                                setOpenScoreBoard(!openScoreBoard)
                            }} >
                                close
                            </span>
                        </div>
                        <div className='scroller' >
                            {
                                scores.length ? (
                                    scores.map((score, index) => (
                                        <div key={index} >
                                            <span className='pr5px' >level {index + 1}</span> : <span className='pl5px' > <span className='pl2px' >{score}</span> seconds</span>
                                        </div>
                                    ))
                                ) :
                                    (
                                        <div className='noScoreText' >
                                            reach end to score
                                        </div>
                                    )
                            }
                        </div>

                    </div>
                </div>
                <div className={`scoresBoard ${openBallChangePopup ? '' : 'hidden'}`}>
                    <div>
                        <div>
                            Balls
                            <span className='scoreCloseButton' onClick={() => {
                                setOpenBallChangePopup(!openBallChangePopup)
                            }} >
                                close
                            </span>
                        </div>
                        <div className='scroller' >
                            {
                                ballsUrl.length ? (
                                    ballsUrl.map((url, index) => (
                                        <div key={index} >
                                            <img src={url} alt="" style={{
                                                height: deviceType == "phone" ? "120px" : '300px',
                                                cursor: 'pointer',
                                                border: ballHoverIndex == index ? '2px solid yellow' : '2px solid transparent',
                                            }}
                                                onMouseEnter={() => setballHoverIndex(index)}
                                                onClick={() => {

                                                    changeCurrentBall(index)
                                                    setOpenBallChangePopup(!openBallChangePopup)
                                                }}
                                            />
                                        </div>
                                    ))
                                ) :
                                    (
                                        <div className='noScoreText' >
                                            No Balls avialable
                                        </div>
                                    )
                            }
                        </div>

                    </div>
                </div>
                <div className={`scoresBoard ${openMenu ? '' : 'hidden'}`}>
                    <div>
                        <div>
                            Menu
                            <span className='scoreCloseButton' onClick={() => {
                                setOpenMenu(!openMenu)
                            }} >
                                close
                            </span>
                        </div>
                        <div className='scroller' >
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => {
                                setOpenScoreBoard(!openScoreBoard)
                                setOpenMenu(!openMenu)

                            }} >
                                {score}Scores
                            </div>
                            <div className={` menuText ${openBallChangePopup ? 'eventNone' : ''}`} onClick={() => {
                                setOpenBallChangePopup(!openBallChangePopup)
                                setOpenMenu(!openMenu)

                            }} >
                                {ball}Change Ball
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { toggleFullScreen(); setOpenMenu(!openMenu) }} >
                                {!(document.fullscreenElement ||
                                    document.webkitFullscreenElement ||
                                    document.msFullscreenElement) ? <>{FullScreen}FullScreen</> :
                                    <>{ExitFullScreen}Exit FullScreen</>}
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { toggleMusic(); setOpenMenu(!openMenu) }} >
                                {document.getElementById('backgroundMusic').paused ? <>{musicPaused}Play Music</> :
                                    <>{musicStart}Pause Music</>}
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { levelRestart(); setOpenMenu(!openMenu) }} >
                                {reset}Restart Current Level
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { gameReset(); setOpenMenu(!openMenu) }} >
                                {reset}Restart Game
                            </div>

                        </div>

                    </div>
                </div>
            </> : <div className='playButton'
                onClick={() => {
                    setPlay(true);
                    toggleMusic()
                    makeFullScreen();
                }} >
                {playBTN}
            </div>}

        </div>
    )
}

export default Interface