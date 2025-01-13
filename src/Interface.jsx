import { useKeyboardControls } from '@react-three/drei'
import React, { useEffect, useRef, useState } from 'react'
import useGame from './stores/useGame'
import { addEffect } from '@react-three/fiber'
import { Joystick } from 'react-joystick-component'
import { arraysEqual, makeFullScreen, toggleFullScreen, toggleMusic, triggerKeyPress, triggerKeyRelease } from './common'

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


    const [play, setPlay] = useState(false)
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
                    Scores
                </div>
                <div className={`resetLevelButton ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { setOpenMenu(!openMenu) }} >
                    <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="2 -3 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M20 17.5a1.5 1.5 0 0 1 .144 2.993L20 20.5H4a1.5 1.5 0 0 1-.144-2.993L4 17.5zm0-7a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 0 1 0-3zm0-7a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 1 1 0-3z"></path></g></svg>
                    <span>menu</span>
                </div>
                <div className='time' ref={time} >
                    0.00
                </div>
                {
                    phase == 'ended' && <div className="restart" onClick={() => { restart(); }} >
                        Next Level
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
                                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 48 48"><path fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 24L24 6l19 18H31v18H17V24z"></path></svg>
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
                                                height: deviceType == "laptop" ? "300px" : '160px',
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
                                Scores
                            </div>
                            <div className={` menuText ${openBallChangePopup ? 'eventNone' : ''}`} onClick={() => {
                                setOpenBallChangePopup(!openBallChangePopup)
                                setOpenMenu(!openMenu)

                            }} >
                                Change Ball
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { toggleFullScreen(); setOpenMenu(!openMenu) }} >
                                {!(document.fullscreenElement ||
                                    document.webkitFullscreenElement ||
                                    document.msFullscreenElement) ? <><svg xmlns="http://www.w3.org/2000/svg" width={60} height={60} viewBox="2 -2 20 20"><path fill="#fff" d="M7 2H2v5l1.8-1.8L6.5 8L8 6.5L5.2 3.8zm6 0l1.8 1.8L12 6.5L13.5 8l2.7-2.7L18 7V2zm.5 10L12 13.5l2.7 2.7L13 18h5v-5l-1.8 1.8zm-7 0l-2.7 2.7L2 13v5h5l-1.8-1.8L8 13.5z"></path></svg>FullScreen</> : <><svg xmlns="http://www.w3.org/2000/svg" width={80} height={80} viewBox="2 -2 20 20"><path fill="#fff" d="M3.4 2L2 3.4l2.8 2.8L3 8h5V3L6.2 4.8zm11.8 4.2L18 3.4L16.6 2l-2.8 2.8L12 3v5h5zM4.8 13.8L2 16.6L3.4 18l2.8-2.8L8 17v-5H3zM17 12h-5v5l1.8-1.8l2.8 2.8l1.4-1.4l-2.8-2.8z"></path></svg>Exit FullScreen</>}
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { toggleMusic(); setOpenMenu(!openMenu) }} >
                                {document.getElementById('backgroundMusic').paused ? <> <svg xmlns="http://www.w3.org/2000/svg" width={70} height={70}  viewBox="2 -2 24 24"><path fill="#fff" d="M21 3v12.5a3.5 3.5 0 0 1-3.5 3.5a3.5 3.5 0 0 1-3.5-3.5a3.5 3.5 0 0 1 3.5-3.5c.54 0 1.05.12 1.5.34V6.47L9 8.6v8.9A3.5 3.5 0 0 1 5.5 21A3.5 3.5 0 0 1 2 17.5A3.5 3.5 0 0 1 5.5 14c.54 0 1.05.12 1.5.34V6z"></path></svg>Start Music </> :
                                 <><svg xmlns="http://www.w3.org/2000/svg" width={70} height={70}  viewBox="2 -2 24 24"><path fill="#fff" d="M2 5.27L3.28 4L20 20.72L18.73 22L9 12.27v5.23A3.5 3.5 0 0 1 5.5 21A3.5 3.5 0 0 1 2 17.5A3.5 3.5 0 0 1 5.5 14c.54 0 1.05.12 1.5.34v-4.07zM21 3v12.5c0 1-.43 1.92-1.12 2.56l-4.94-4.94c.64-.69 1.56-1.12 2.56-1.12c.54 0 1.05.12 1.5.34V6.47l-8.83 1.88l-2.51-2.51z"></path></svg>Stop Music</>}
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { levelRestart(); setOpenMenu(!openMenu) }} >
                                Restart Current Level
                            </div>
                            <div className={` menuText ${openScoreBoard ? 'eventNone' : ''}`} onClick={() => { gameReset(); setOpenMenu(!openMenu) }} >
                                Restart Game
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
                <svg xmlns="http://www.w3.org/2000/svg" width={156} height={156} viewBox="0 0 1536 1536"><path fill="#fff" d="M1184 768q0 37-32 55l-544 320q-15 9-32 9q-16 0-32-8q-32-19-32-56V448q0-37 32-56q33-18 64 1l544 320q32 18 32 55m128 0q0-148-73-273t-198-198t-273-73t-273 73t-198 198t-73 273t73 273t198 198t273 73t273-73t198-198t73-273m224 0q0 209-103 385.5T1153.5 1433T768 1536t-385.5-103T103 1153.5T0 768t103-385.5T382.5 103T768 0t385.5 103T1433 382.5T1536 768"></path></svg>            </div>}

        </div>
    )
}

export default Interface