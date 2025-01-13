import { Float, Text, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import React, { useMemo, useRef, useState } from 'react'
import * as THREE from "three";

THREE.ColorManagement.legacyMode = false

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0, roughness: 0 })
const floor2Material = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0, roughness: 0 })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000', metalness: 0, roughness: 1 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#887777', metalness: 0, roughness: 0 })

const BlockStart = ({ position = [0, 0, 0], count }) => (
    <group position={position} >
        <Float
            floatIntensity={0.25}
            rotationIntensity={0.25}
        >
            <Text
                scale={0.3}
                font='./bebas-neue-v9-latin-regular.woff'
                maxWidth={0.25}
                lineHeight={0.95}
                textAlign='center'
                position={[0.75, 0.65, 0]}
                rotation-y={-0.25}
            >
                Marble Race Level {(count / 2) - 1}
                <meshBasicMaterial toneMapped={false} />
            </Text>

        </Float>
        <mesh
            geometry={boxGeometry}
            material={floor1Material}
            position={[0, -0.1, 0]}
            scale={[4, 0.2, 4]}
            receiveShadow
        />
    </group>

)

const BlockSpinner = ({ position = [0, 0, 0] }) => {
    const [speed] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? 1 : -1))
    const obstacle = useRef()
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        obstacle.current.setNextKinematicRotation(rotation)

    })
    return (
        <group position={position} >
            <mesh
                geometry={boxGeometry}
                material={floor2Material}
                position={[0, -0.1, 0]}
                scale={[4, 0.2, 4]}
                receiveShadow
            />
            <RigidBody ref={obstacle} type='kinematicPosition' restitution={0.2} friction={0} >
                <mesh
                    geometry={boxGeometry}
                    material={obstacleMaterial}
                    scale={[3.5, 0.3, 0.3]}
                    receiveShadow
                    castShadow
                />
            </RigidBody>
        </group>
    )
}

const BlockLimbo = ({ position = [0, 0, 0] }) => {
    const [timeOffset] = useState(() => (Math.random()) * (Math.PI * 2))
    const obstacle = useRef()

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const y = Math.sin(time + timeOffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })

    })
    return (
        <group position={position} >
            <mesh
                geometry={boxGeometry}
                material={floor2Material}
                position={[0, -0.1, 0]}
                scale={[4, 0.2, 4]}
                receiveShadow
            />
            <RigidBody ref={obstacle} type='kinematicPosition' restitution={0.2} friction={0} >
                <mesh
                    geometry={boxGeometry}
                    material={obstacleMaterial}
                    scale={[3.5, 0.3, 0.3]}
                    receiveShadow
                    castShadow
                />
            </RigidBody>
        </group>
    )
}


const BlockAxe = ({ position = [0, 0, 0] }) => {
    const [timeOffset] = useState(() => (Math.random()) * (Math.PI * 2))
    const obstacle = useRef()

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const x = Math.sin(time + timeOffset) * 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.80, z: position[2] })

    })
    return (
        <group position={position} >
            <mesh
                geometry={boxGeometry}
                material={floor2Material}
                position={[0, -0.1, 0]}
                scale={[4, 0.2, 4]}
                receiveShadow
            />
            <RigidBody ref={obstacle} type='kinematicPosition' restitution={0.2} friction={0} >
                <mesh
                    geometry={boxGeometry}
                    material={obstacleMaterial}
                    scale={[1.5, 1.5, 0.3]}
                    receiveShadow
                    castShadow
                />
            </RigidBody>
        </group>
    )
}

const Bounds = ({ length = 1 }) => {

    return <>
        <RigidBody key={`Bounds-${length}`} type='fixed' restitution={0.2} friction={0} >

            <mesh
                position={[2.15, 0.75, -(length * 2) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[0.3, 1.5, 4 * length]}
                castShadow
            />
            <mesh
                position={[-2.15, 0.75, -(length * 2) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[0.3, 1.5, 4 * length]}
                receiveShadow
            />
            <mesh
                position={[0, 0.75, -(length * 4) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[4, 1.5, 0.3]}
                receiveShadow
            />
            <CuboidCollider
                args={[2, 0.1, 2 * length]}
                position={[0, -0.1, -(length * 2) + 2]}
                restitution={0.2}
                friction={1}
            />
        </RigidBody>

    </>
}

const BlockEnd = ({ position = [0, 0, 0], count }) => {
    const scene = useGLTF('./trophy/scene.gltf')

    scene.scene.children.forEach((child) => {
        child.castShadow = true
    })

    const [speed] = useState(() => 2 * (Math.random() < 0.5 ? 1 : -1))
    const trophy = useRef()
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        trophy.current.setNextKinematicRotation(rotation)

    })

    return (
        <group position={position} >
            <Text
                scale={1}
                font='./bebas-neue-v9-latin-regular.woff'
                position={[0, 2.25, 2]}
            >
                FINISH
                <meshBasicMaterial toneMapped={false} />
            </Text>
            <mesh
                geometry={boxGeometry}
                material={floor1Material}
                position={[0, 0.1, 0]}
                scale={[4, 0.2, 4]}
                receiveShadow
            />
            <RigidBody key={`trophy-${count}`} ref={trophy} type='kinematicPosition' position={[0, 0.25, 0]} colliders='hull' restitution={0.2} friction={0} scale={10} >
                <primitive object={scene.scene} scale={0.2} />
            </RigidBody>
        </group>

    )
}


function Level({ count = 10, types = [BlockLimbo, BlockAxe, BlockAxe, BlockSpinner], seed = 0 }) {
    const blocks = useMemo(() => {
        const blocks = []
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            blocks.push(type)
        }
        return blocks
    }, [seed, count, types])

    return (
        <>
            <BlockStart count={count} position={[0, 0, 0]} />
            {blocks.map((Block, index) => {
                return <Block
                    key={index}
                    position={[0, 0, -(index + 1) * 4]}
                />
            })}
            <BlockEnd count={count} position={[0, 0, -((count + 1) * 4)]} />
            <Bounds length={count + 2} />
        </>
    )
}

export default Level