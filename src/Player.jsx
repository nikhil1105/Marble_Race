import { useGLTF, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from "three";
import useGame from './stores/useGame';
import { getDeviceType, getIsLaptop } from './common';
function Player() {

    const ballModels = [
        {
            url: './pokemon_basic_pokeball.glb',
            props: {
                scale: 0.079,
                flatShading: true
            },
            density: 0.8

        },
        {
            url: './sci_fi_football.glb',
            props: {
                scale: 2.5,
                flatShading: true
            },
            density: 0.76
        },
        {
            url: './volleyball.glb',
            props: {
                scale: 0.22,
                flatShading: true

            },
            density: 0.35
        },
    ];

    const modelIndex = useGame(state => state.currentBall)


    const sceneArray = ballModels.map(() => {
        if (modelIndex + 1 > ballModels.length) return null        
        if (ballModels[modelIndex].url) {
            return useGLTF(ballModels[modelIndex].url)
        }
    })

    sceneArray.forEach((scene) => {
        if (scene) {
            scene.scene.children.forEach((child) => {
                child.castShadow = true
                child.flatShading = true
            })
        }

    })

    const body = useRef()
    const ball = useRef()

    const [subscribeKeys, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const rapierWorld = world.raw()
    const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10))
    const [smoothcameraTarget] = useState(() => new THREE.Vector3())
    const jump = () => {

        const origin = body.current.translation()
        origin.y -= 0.36  //0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)

        if (hit.toi < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }
    }

    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
        body.current.setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0 })

    }

    const start = useGame(state => state.start)
    const end = useGame(state => state.end)
    const restart = useGame(state => state.restart)
    const blocksCounts = useGame(state => state.blocksCounts)
    const setDeviceType = useGame(state => state.setDeviceType)
    const deviceType = useGame(state => state.deviceType)
    const setWindowSize = useGame(state => state.setWindowSize)
    const windowSize = useGame(state => state.windowSize)


    useEffect(() => {

        const unSubReset = useGame.subscribe(
            state => state.phase,
            (value) => {
                if (value == 'ready') {
                    reset()
                }
            }
        )

        const unSub = subscribeKeys((state) => state.jump,
            (value) => {
                if (value) {
                    jump()
                }
            }
        )

        const unSubAnyKeys = subscribeKeys(() => {
            start()
        })

        return () => {
            unSub()
            unSubAnyKeys()
            unSubReset()
        }
    }, [])    

    useFrame((state, delta) => {

        const newDeviceType = getDeviceType();
        if (newDeviceType !== deviceType) {
            setDeviceType(newDeviceType);
        }

        if (windowSize.width !== window.innerWidth || windowSize.height !== window.innerHeight) {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }


        const { backward, forward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        let impulseStrength = 0.6 * delta
        let torqueStrength = 0.2 * delta

        if (forward) {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }

        if (backward) {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }

        if (rightward) {
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }

        if (leftward) {            
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        //camera
        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += deviceType == 'laptop' ? 2.25 : deviceType == "tablet" ? 5 : 6
        cameraPosition.y += deviceType == 'laptop' ? 0.65 : deviceType == "tablet" ? 3 : 3

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothcameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothCameraPosition)
        state.camera.lookAt(smoothcameraTarget)

        //phases 
        if (bodyPosition.z < -(blocksCounts * 4 + 2)) {
            end()
        }

        if (bodyPosition.y < - 4)
            restart()

    })

    return (
        <RigidBody
            key={`ball-${modelIndex}`}
            ref={body}
            position={[0, 1, 0]}
            colliders="ball"
            restitution={0.2}
            friction={1}
            linearDamping={0.5}
            angularDamping={0.5}
            density={ballModels[modelIndex]?.density}
        >
            {
                modelIndex + 1 > ballModels.length ?
                    <mesh castShadow ref={ball} >
                        <icosahedronGeometry args={[0.3, 1]} />
                        <meshStandardMaterial flatShading color={'mediumpurple'} />
                    </mesh> :
                    (sceneArray[modelIndex]?.scene && <primitive ref={ball} object={sceneArray[modelIndex].scene} {...ballModels[modelIndex].props} />)

            }

        </RigidBody>
    )
}

export default Player