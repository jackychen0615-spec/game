import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Float, Text, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { EnemyData, Loot } from '../types';

// Augment JSX.IntrinsicElements to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      planeGeometry: any;
      sphereGeometry: any;
      torusGeometry: any;
      meshStandardMaterial: any;
      fog: any;
      color: any;
      gridHelper: any;
      [elemName: string]: any;
    }
  }
}

// --- GAME CONFIG ---
const PLAYER_SPEED = 0.15;
const ENEMY_SPEED = 0.06;
const ATTACK_RANGE = 3.5;
const ATTACK_COOLDOWN = 600; // ms

interface Game3DProps {
  onStatsUpdate: (hp: number, maxHp: number, xp: number) => void;
  onGameOver: () => void;
}

// --- UTILS ---
const checkCollision = (p1: [number, number, number], p2: [number, number, number], radius: number) => {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz) < radius;
};

// --- VISUAL ASSETS ---

// 1. THE DAWNBREAKER (Weapon)
const DawnbreakerSword = ({ isAttacking }: { isAttacking: boolean }) => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        
        // Idle Sway
        const t = state.clock.elapsedTime;
        group.current.position.y = Math.sin(t * 1.5) * 0.02;
        
        // Attack Animation
        if (isAttacking) {
            // Heavy swing
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -Math.PI / 3, 0.2);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -Math.PI / 2, 0.2);
            group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, -0.5, 0.2);
        } else {
            // Return to carry position
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.1);
            group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0, 0.1);
        }
    });

    const bladeColor = "#00F0FF"; // Cyan
    const goldColor = "#D4AF37";
    const metalColor = "#333333";

    return (
        <group ref={group} position={[0.6, -0.2, 0.5]} scale={[0.8, 0.8, 0.8]}>
            {/* Hilt */}
            <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
                <meshStandardMaterial color={metalColor} />
            </mesh>
            {/* Pommel */}
            <mesh position={[0, -0.82, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={goldColor} />
            </mesh>
            {/* Guard (Techy) */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[0.4, 0.1, 0.15]} />
                <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Core Engine */}
            <mesh position={[0, -0.3, 0]}>
                 <cylinderGeometry args={[0.1, 0.08, 0.15, 8]} />
                 <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, -0.3, 0.06]}>
                 <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} rotation={[Math.PI/2, 0, 0]} />
                 <meshStandardMaterial color={bladeColor} emissive={bladeColor} emissiveIntensity={2} />
            </mesh>

            {/* The Rails (Blade holder) */}
            <group position={[0, 0.6, 0]}>
                 {/* Left Rail */}
                 <mesh position={[-0.08, 0, 0]}>
                     <boxGeometry args={[0.04, 1.8, 0.05]} />
                     <meshStandardMaterial color="#888" metalness={0.8} />
                 </mesh>
                 {/* Right Rail */}
                 <mesh position={[0.08, 0, 0]}>
                     <boxGeometry args={[0.04, 1.8, 0.05]} />
                     <meshStandardMaterial color="#888" metalness={0.8} />
                 </mesh>
                 {/* Energy Blade (Center) */}
                 <mesh position={[0, 0, 0]}>
                     <boxGeometry args={[0.1, 1.7, 0.02]} />
                     <meshStandardMaterial color={bladeColor} emissive={bladeColor} emissiveIntensity={3} transparent opacity={0.8} />
                 </mesh>
                 {/* Trail Effect */}
                 {isAttacking && (
                    <Trail width={1.5} length={5} color={new THREE.Color(bladeColor)} attenuation={(t) => t * t}>
                        <mesh visible={false} position={[0, 0.8, 0]} />
                    </Trail>
                 )}
            </group>
        </group>
    );
};

// 2. AETHER PALADIN CHARACTER MODEL
const AetherPaladinModel = () => {
    const whiteArmor = new THREE.MeshStandardMaterial({ color: "#F0F0F0", roughness: 0.3, metalness: 0.5 });
    const goldTrim = new THREE.MeshStandardMaterial({ color: "#C5A059", roughness: 0.2, metalness: 1.0 });
    const darkUndersuit = new THREE.MeshStandardMaterial({ color: "#2A2A2A", roughness: 0.8 });
    const blueCloth = new THREE.MeshStandardMaterial({ color: "#1A2A4A", roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: "#E0AC69" });
    const hair = new THREE.MeshStandardMaterial({ color: "#DDDDDD", roughness: 0.5 });
    const cyanLight = new THREE.MeshStandardMaterial({ color: "#00F0FF", emissive: "#00F0FF", emissiveIntensity: 2 });

    return (
        <group position={[0, 0.85, 0]} scale={[0.9, 0.9, 0.9]}>
            {/* -- LEGS -- */}
            <group position={[0, -0.75, 0]}>
                {/* Left Leg */}
                <mesh position={[-0.2, 0.4, 0]} material={whiteArmor} castShadow>
                     <boxGeometry args={[0.18, 0.5, 0.2]} />
                </mesh>
                <mesh position={[-0.2, 0.1, 0]} material={whiteArmor} castShadow> {/* Boot */}
                     <boxGeometry args={[0.22, 0.3, 0.25]} />
                </mesh>
                <mesh position={[-0.2, 0.1, 0.13]} material={goldTrim}> {/* Boot Detail */}
                     <boxGeometry args={[0.1, 0.1, 0.05]} />
                </mesh>
                
                {/* Right Leg */}
                <mesh position={[0.2, 0.4, 0]} material={whiteArmor} castShadow>
                     <boxGeometry args={[0.18, 0.5, 0.2]} />
                </mesh>
                <mesh position={[0.2, 0.1, 0]} material={whiteArmor} castShadow> {/* Boot */}
                     <boxGeometry args={[0.22, 0.3, 0.25]} />
                </mesh>
                <mesh position={[0.2, 0.1, 0.13]} material={goldTrim}>
                     <boxGeometry args={[0.1, 0.1, 0.05]} />
                </mesh>

                {/* Cloth/Tabard (Navy Blue) */}
                <mesh position={[0, 0.5, 0.11]} material={blueCloth}>
                    <boxGeometry args={[0.3, 0.7, 0.02]} />
                </mesh>
                <mesh position={[0, 0.5, -0.11]} material={blueCloth}>
                    <boxGeometry args={[0.35, 0.8, 0.02]} />
                </mesh>
            </group>

            {/* -- TORSO -- */}
            <mesh position={[0, 0.2, 0]} material={whiteArmor} castShadow>
                 <boxGeometry args={[0.5, 0.5, 0.3]} />
            </mesh>
            <mesh position={[0, 0.25, 0.16]} material={cyanLight}> {/* Core Reactor */}
                 <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} />
            </mesh>
            <mesh position={[0, 0.25, 0.16]} material={goldTrim}> {/* Core Ring */}
                 <torusGeometry args={[0.09, 0.02, 8, 16]} />
            </mesh>
            
            {/* -- SHOULDERS -- */}
            <mesh position={[-0.35, 0.4, 0]} material={whiteArmor} castShadow>
                 <boxGeometry args={[0.3, 0.3, 0.35]} />
            </mesh>
            <mesh position={[-0.35, 0.4, 0]} material={goldTrim}> {/* Trim */}
                 <boxGeometry args={[0.31, 0.05, 0.36]} />
            </mesh>

            <mesh position={[0.35, 0.4, 0]} material={whiteArmor} castShadow>
                 <boxGeometry args={[0.3, 0.3, 0.35]} />
            </mesh>
            <mesh position={[0.35, 0.4, 0]} material={goldTrim}>
                 <boxGeometry args={[0.31, 0.05, 0.36]} />
            </mesh>

            {/* -- ARMS -- */}
            <mesh position={[-0.35, 0.1, 0]} material={darkUndersuit}>
                 <cylinderGeometry args={[0.08, 0.07, 0.4, 8]} />
            </mesh>
            <mesh position={[0.35, 0.1, 0]} material={darkUndersuit}>
                 <cylinderGeometry args={[0.08, 0.07, 0.4, 8]} />
            </mesh>
            {/* Gauntlets */}
            <mesh position={[-0.35, -0.1, 0]} material={whiteArmor}>
                 <boxGeometry args={[0.18, 0.2, 0.2]} />
            </mesh>
            <mesh position={[0.35, -0.1, 0]} material={whiteArmor}>
                 <boxGeometry args={[0.18, 0.2, 0.2]} />
            </mesh>

            {/* -- HEAD -- */}
            <mesh position={[0, 0.6, 0]} material={skin}>
                 <boxGeometry args={[0.2, 0.25, 0.22]} />
            </mesh>
            <mesh position={[0, 0.73, -0.02]} material={hair}> {/* Hair */}
                 <boxGeometry args={[0.22, 0.1, 0.24]} />
            </mesh>
            {/* Cyber Eye */}
            <mesh position={[0.05, 0.62, 0.11]} material={cyanLight}>
                 <planeGeometry args={[0.04, 0.04]} />
            </mesh>

            {/* -- BACKPACK / THRUSTERS -- */}
            <group position={[0, 0.3, -0.2]}>
                 <mesh material={whiteArmor}>
                      <boxGeometry args={[0.35, 0.4, 0.15]} />
                 </mesh>
                 {/* Thrusters */}
                 <mesh position={[-0.12, 0.1, 0.08]} material={cyanLight} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                 </mesh>
                 <mesh position={[0.12, 0.1, 0.08]} material={cyanLight} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                 </mesh>
                 <mesh position={[-0.12, -0.1, 0.08]} material={cyanLight} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                 </mesh>
                 <mesh position={[0.12, -0.1, 0.08]} material={cyanLight} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                 </mesh>
            </group>
        </group>
    );
};

// 3. PLAYER CONTROLLER
const Player = ({ 
  position, 
  setPosition, 
  onAttack,
  hp
}: { 
  position: THREE.Vector3, 
  setPosition: (v: THREE.Vector3) => void,
  onAttack: () => void,
  hp: number
}) => {
  const { camera } = useThree();
  const [isAttacking, setIsAttacking] = useState(false);
  const lastAttackTime = useRef(0);
  const moveDirection = useRef(new THREE.Vector3());
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const onKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    const onMouseDown = () => {
      const now = Date.now();
      if (now - lastAttackTime.current > ATTACK_COOLDOWN) {
        setIsAttacking(true);
        lastAttackTime.current = now;
        onAttack();
        setTimeout(() => setIsAttacking(false), 300);
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [onAttack]);

  useFrame((state) => {
    const front = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    front.y = 0;
    front.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    moveDirection.current.set(0, 0, 0);
    if (keys.current['KeyW']) moveDirection.current.add(front);
    if (keys.current['KeyS']) moveDirection.current.sub(front);
    if (keys.current['KeyD']) moveDirection.current.add(right);
    if (keys.current['KeyA']) moveDirection.current.sub(right);

    if (moveDirection.current.length() > 0) {
      moveDirection.current.normalize().multiplyScalar(PLAYER_SPEED);
      position.add(moveDirection.current);
    }

    position.x = THREE.MathUtils.clamp(position.x, -48, 48);
    position.z = THREE.MathUtils.clamp(position.z, -48, 48);

    setPosition(position.clone());

    // FPS / Third Person Camera Logic
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, position.x, 0.2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, position.y + 1.7, 0.2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, position.z, 0.2);
  });

  return (
    <group position={position}>
      {/* 
         We only render the high-detail body if we look down or see reflections.
         However, for this demo, we'll attach the weapon to the camera 
         so it feels like FPS, but render the body in the scene for shadows.
      */}
      <AetherPaladinModel />
      
      {/* Weapon is attached to the player group but synced with camera rotation visually */}
      <group position={[0, 1.4, 0]} rotation={[camera.rotation.x, camera.rotation.y, camera.rotation.z]}>
         {/* Offset weapon to right hand side */}
         <group position={[0.2, -0.3, 0.4]}>
            <DawnbreakerSword isAttacking={isAttacking} />
         </group>
      </group>
    </group>
  );
};

// 4. ENEMY
const Enemy = ({ data, playerPos, onHitPlayer }: { data: EnemyData, playerPos: THREE.Vector3, onHitPlayer: () => void }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [flash, setFlash] = useState(0);

  useFrame(() => {
    if (!mesh.current || data.isDead) return;

    const pos = new THREE.Vector3(data.position[0], data.position[1], data.position[2]);
    const dir = new THREE.Vector3().subVectors(playerPos, pos).normalize();
    
    if (pos.distanceTo(playerPos) > 1.2) {
        pos.add(dir.multiplyScalar(ENEMY_SPEED));
        mesh.current.position.copy(pos);
        mesh.current.lookAt(playerPos.x, mesh.current.position.y, playerPos.z);
        data.position[0] = pos.x;
        data.position[2] = pos.z;
    } else {
        if (Math.random() < 0.05) onHitPlayer();
    }
    if (flash > 0) setFlash(f => f - 1);
  });

  if (data.isDead) return null;

  return (
    <group position={data.position}>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={flash > 0 ? "white" : "#A00030"} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Enemy Eye */}
      <mesh position={[data.position[0], data.position[1], data.position[2] + 0.4]}>
           <planeGeometry args={[0.4, 0.1]} />
           <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

// 5. WORLD GEOMETRY
const World = () => {
    return (
        <group>
            {/* Fix Flashing: Solid Color + Fog matching exact color */}
            <color attach="background" args={['#050011']} />
            <fog attach="fog" args={['#050011', 5, 45]} />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.5} />
            </mesh>
            
            <gridHelper args={[200, 100, 0x00F0FF, 0x220044]} position={[0, 0.01, 0]} />

            {/* Environment Objects */}
            {Array.from({ length: 40 }).map((_, i) => {
                const x = (Math.random() - 0.5) * 90;
                const z = (Math.random() - 0.5) * 90;
                const h = 4 + Math.random() * 12;
                return (
                    <group key={i} position={[x, h/2, z]}>
                        <mesh castShadow receiveShadow>
                            <boxGeometry args={[1.5, h, 1.5]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Neon Strips on buildings */}
                        <mesh position={[0, 0, 0.76]}>
                             <planeGeometry args={[0.2, h*0.8]} />
                             <meshStandardMaterial color={Math.random() > 0.5 ? "#FF0055" : "#00F0FF"} emissiveIntensity={2} toneMapped={false} />
                        </mesh>
                    </group>
                );
            })}
            
            {/* Replaced Stars with Sparkles (Stable) */}
            <Sparkles count={500} scale={80} size={4} speed={0.2} opacity={0.5} color="#8888ff" />

            <ambientLight intensity={0.3} />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#00F0FF" distance={20} />
            <pointLight position={[10, 30, 10]} intensity={1} castShadow />
        </group>
    );
};

// --- MAIN SCENE ---
export default function GameCanvas({ onStatsUpdate, onGameOver }: Game3DProps) {
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const [loots, setLoots] = useState<Loot[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [xp, setXp] = useState(0);

  useEffect(() => {
      const initialEnemies: EnemyData[] = [];
      for(let i=0; i<10; i++) {
          initialEnemies.push({
              id: uuidv4(),
              position: [(Math.random()-0.5)*60, 1, (Math.random()-0.5)*60],
              hp: 60,
              maxHp: 60,
              isDead: false,
              type: 'minion'
          });
      }
      setEnemies(initialEnemies);
  }, []);

  useEffect(() => {
      onStatsUpdate(playerHp, 100, xp);
      if (playerHp <= 0) onGameOver();
  }, [playerHp, xp, onStatsUpdate, onGameOver]);

  const handlePlayerAttack = () => {
      const pPos = playerPosRef.current;
      setEnemies(prev => prev.map(e => {
          if (e.isDead) return e;
          const dist = Math.sqrt(Math.pow(pPos.x - e.position[0], 2) + Math.pow(pPos.z - e.position[2], 2));
          if (dist < ATTACK_RANGE) {
              const newHp = e.hp - 30;
              if (newHp <= 0) {
                  setLoots(l => [...l, { id: uuidv4(), position: [e.position[0], 1, e.position[2]], type: 'weapon' }]);
                  setXp(x => x + 100);
                  return { ...e, hp: 0, isDead: true };
              }
              return { ...e, hp: newHp };
          }
          return e;
      }));
  };

  const handleEnemyHitPlayer = () => setPlayerHp(h => Math.max(0, h - 5));

  const handleCollectLoot = (id: string) => {
      setLoots(prev => prev.filter(l => l.id !== id));
      setXp(x => x + 25);
      setPlayerHp(h => Math.min(100, h + 30));
  };

  return (
    <Canvas shadows camera={{ fov: 80 }}>
       <PointerLockControls />
       <World />
       
       <Player 
          position={playerPosRef.current} 
          setPosition={(p) => playerPosRef.current.copy(p)} 
          onAttack={handlePlayerAttack}
          hp={playerHp}
       />
       
       {enemies.map(e => (
           <Enemy key={e.id} data={e} playerPos={playerPosRef.current} onHitPlayer={handleEnemyHitPlayer} />
       ))}

       {loots.map(l => (
            <group key={l.id} position={l.position}>
                <Float speed={5} floatIntensity={1}>
                    <mesh onClick={() => handleCollectLoot(l.id)}>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
                    </mesh>
                </Float>
                <pointLight color="#FFD700" distance={3} intensity={2} />
                <mesh visible={false} onPointerOver={() => { if(checkCollision(playerPosRef.current.toArray(), l.position, 2)) handleCollectLoot(l.id) }} />
            </group>
       ))}
    </Canvas>
  );
}