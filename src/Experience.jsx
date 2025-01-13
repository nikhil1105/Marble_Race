import { OrbitControls } from '@react-three/drei'
import Lights from './Lights.jsx'
import Level from './Level.jsx'
import { Perf } from 'r3f-perf'
import { Debug, Physics } from '@react-three/rapier'
import Player from './Player.jsx'
import useGame from './stores/useGame.js'
import Effects from './Effects.jsx'

export default function Experience() {
    const blocksCounts = useGame(state => state.blocksCounts)
    const blocksSeed = useGame(state => state.blocksSeed)

    return <>
        <color args={["#252731"]} attach={'background'} />
        <Physics>
            {/* <Debug /> */}
            <Lights />
            <Level count={blocksCounts} seed={blocksSeed} />
            <Player />
        </Physics>
        <Effects />
    </>
}