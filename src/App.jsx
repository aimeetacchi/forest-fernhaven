import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud, Clone, Sparkles, Stars, useAnimations, useGLTF } from "@react-three/drei";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
	ArrowUpRight,
	AudioLines,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Compass,
	Leaf,
	LocateFixed,
	X,
	Volume2,
	VolumeX,
} from "lucide-react";

const palette = [
	"#375e48",
	"#426b50",
	"#507957",
	"#668866",
	"#78966a",
	"#456b59",
];

const ANIMAL_INFO = {
	"roe deer": {
		title: "Roe deer",
		scientific: "Capreolus capreolus",
		about: "One of Britain’s native deer, the roe browses on young shoots, leaves, herbs and brambles. It often keeps to woodland cover, moving quietly between trees.",
		pause: "If you like, take a moment to notice its quiet movements. There’s no hurry to follow.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/roe-deer/",
	},
	"red fox": {
		title: "Red fox",
		scientific: "Vulpes vulpes",
		about: "Foxes are adaptable mammals found in woods, fields and towns. They eat a varied diet, including rodents, rabbits, insects, fruit and berries.",
		pause: "Listen for the small sounds around you. You can stay here as long as you want.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/fox/",
	},
	badger: {
		title: "Badger",
		scientific: "Meles meles",
		about: "Badgers live in family groups and make underground homes called setts. They forage mostly at night, often searching for earthworms and other small invertebrates.",
		pause: "This one is taking its time among the leaves. You can watch quietly, or carry on along the path.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/badger/",
	},
	rabbit: {
		title: "Rabbit",
		scientific: "Oryctolagus cuniculus",
		about: "Rabbits graze on grasses and herbs, then retreat to sheltered burrows when they need a rest. Their long ears help them listen for movement nearby.",
		pause: "Watch the rabbit pause between little steps. There is nowhere else you need to be just now.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/rabbit/",
	},
	hedgehog: {
		title: "Hedgehog",
		scientific: "Erinaceus europaeus",
		about: "Hedgehogs search for beetles, earthworms and other small invertebrates. By day, they rest in sheltered nests made from leaves and grasses.",
		pause: "A quiet rustle under the leaves. Take a moment to notice it, then wander on when you are ready.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/hedgehog/",
	},
	squirrel: {
		title: "Squirrel",
		scientific: "Sciuridae",
		about: "Squirrels climb between branches in search of seeds, nuts and fungi. They often tuck food away for later, leaving some seeds behind to grow into new plants.",
		pause: "Follow its small, unhurried movements through the undergrowth. You can stay here or carry on whenever you like.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/squirrels/",
	},
	"wood mouse": {
		title: "Wood mouse",
		scientific: "Apodemus sylvaticus",
		about: "Wood mice shelter in dense cover and gather seeds, nuts, fruit and insects. Their large ears and eyes help them notice what is happening around them.",
		pause: "A little rustle in the undergrowth. Stay for a moment if you like, then wander on whenever you’re ready.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/mammals/wood-mouse/",
	},
	hawk: {
		title: "Hawk",
		scientific: "Accipitridae",
		about: "Hawks are birds of prey with keen eyesight. They use woodland edges and open spaces to watch for small animals, then glide quietly between patches of cover.",
		pause: "Look up and follow its easy circles through the canopy. Take your time; it will keep soaring overhead.",
		source: "https://www.rspb.org.uk/birds-and-wildlife/buzzard/",
	},
	butterfly: {
		title: "Butterfly",
		scientific: "Order Lepidoptera",
		about: "Butterflies begin life as caterpillars before transforming inside a chrysalis. Adult butterflies visit flowers for nectar and bring a little colour to sunny woodland clearings.",
		pause: "Follow its slow drift through the clearing with your eyes, or simply let it pass by.",
		source: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/butterflies/",
	},
};

function Tree({ position, scale = 1, variant = 0, phase = 0 }) {
	const group = useRef();
	const crown = useRef();
	const tint = palette[variant % palette.length];
	useFrame(({ clock }) => {
		const t = clock.elapsedTime + phase;
		if (group.current) group.current.rotation.z = Math.sin(t * 0.55) * 0.018;
		if (crown.current) {
			crown.current.rotation.x = Math.sin(t * 0.8) * 0.014;
			crown.current.rotation.z = Math.cos(t * 0.65) * 0.012;
		}
	});
	return (
		<group ref={group} position={position} scale={scale}>
			<mesh position={[0, 1.05, 0]} castShadow>
				<cylinderGeometry args={[0.12, 0.19, 2.2, 7]} />
				<meshStandardMaterial color="#594735" roughness={1} />
			</mesh>
			<group ref={crown} position={[0, 1.35, 0]}>
				<mesh position={[0, 0.8, 0]} castShadow>
					<coneGeometry args={[0.9, 1.8, 7]} />
					<meshStandardMaterial color={tint} roughness={0.95} />
				</mesh>
				<mesh position={[0, 1.42, 0]} castShadow>
					<coneGeometry args={[0.7, 1.48, 7]} />
					<meshStandardMaterial
						color={palette[(variant + 2) % palette.length]}
						roughness={0.92}
					/>
				</mesh>
				<mesh position={[0, 1.94, 0]} castShadow>
					<coneGeometry args={[0.48, 1.12, 7]} />
					<meshStandardMaterial
						color={palette[(variant + 3) % palette.length]}
						roughness={0.9}
					/>
				</mesh>
			</group>
		</group>
	);
}

function Deer({ position, onFind, onEncounter }) {
	const group = useRef();
	const { scene, animations } = useGLTF("/models/deer.glb");
	const { actions } = useAnimations(animations, group);
	const [found, setFound] = useState(false);
	const motion = useRef(false);
	useEffect(() => {
		const idle = actions.Idle || actions["AnimalArmature|Idle"];
		idle?.reset().fadeIn(0.4).play();
		return () => idle?.fadeOut(0.2);
	}, [actions]);
	useFrame(({ clock }) => {
		if (!group.current) return;
		const t = clock.elapsedTime;
		const moving = Math.sin(t * 0.18) > 0.25;
		if (moving !== motion.current) {
			const idle = actions.Idle || actions["AnimalArmature|Idle"];
			const walk = actions.Walk || actions["AnimalArmature|Walk"];
			if (moving) { idle?.fadeOut(0.55); walk?.reset().fadeIn(0.55).play(); }
			else { walk?.fadeOut(0.55); idle?.reset().fadeIn(0.55).play(); }
			motion.current = moving;
		}
		group.current.position.x = position[0] + Math.sin(t * 0.16) * 0.9;
		group.current.position.z = position[2] + Math.cos(t * 0.11) * 0.55;
		group.current.rotation.y = Math.sin(t * 0.16) >= 0 ? Math.PI / 2 : -Math.PI / 2;
	});
	const discover = (event) => {
		event.stopPropagation();
		if (!found) { setFound(true); onFind("roe deer"); }
		onEncounter("roe deer");
	};
	return <group ref={group} position={position} scale={0.4} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
		<primitive object={scene} />
	</group>;
}

function Fox({ position, onFind, onEncounter }) {
	const group = useRef();
	const { scene, animations } = useGLTF("/models/fox.glb");
	const { actions } = useAnimations(animations, group);
	const [found, setFound] = useState(false);
	useEffect(() => {
		const walk = actions.Walk || actions["AnimalArmature|Walk"];
		walk?.reset().fadeIn(0.4).play();
		if (walk) walk.timeScale = 0.42;
		return () => walk?.fadeOut(0.2);
	}, [actions]);
	useFrame(({ clock }, delta) => {
		if (!group.current) return;
		// A broad, slow wandering path gives the walk cycle room to read.
		const t = clock.elapsedTime * 0.24 + 8;
		group.current.position.x = position[0] + Math.sin(t) * 1.25;
		group.current.position.z = position[2] + Math.cos(t * 0.72) * 0.32;
		const targetYaw = Math.cos(t) >= 0 ? Math.PI / 2 : -Math.PI / 2;
		const yawDelta = Math.atan2(Math.sin(targetYaw - group.current.rotation.y), Math.cos(targetYaw - group.current.rotation.y));
		group.current.rotation.y += yawDelta * (1 - Math.exp(-4 * delta));
	});
	const discover = (event) => { event.stopPropagation(); if (!found) { setFound(true); onFind("red fox"); } onEncounter("red fox"); };
	return <group ref={group} position={position} scale={0.3} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}><primitive object={scene} /></group>;
}

function ForestAnimal({ animal, model, position, scale, groundOffset = 0, phase = 0, pace = 0.16, animation, drift = [0.4, 0.25], hop = false, onFind, onEncounter }) {
	const group = useRef();
	const [found, setFound] = useState(false);
	const { scene, animations } = useGLTF(model);
	const { actions } = useAnimations(animations, group);
	useEffect(() => {
		if (!animation) return;
		const action = Object.values(actions).find((candidate) => candidate.getClip().name.toLowerCase().endsWith(animation.toLowerCase()));
		if (!action) return;
		action.reset().fadeIn(0.4).play();
		return () => action.fadeOut(0.2);
	}, [actions, animation]);
	useFrame(({ clock }) => {
		if (!group.current) return;
		const t = clock.elapsedTime * pace + phase;
		group.current.position.x = position[0] + Math.sin(t) * drift[0];
		group.current.position.y = position[1] + groundOffset + (hop ? Math.max(0, Math.sin(t * 3)) * 0.13 : animal === "badger" ? Math.sin(t * 2) * 0.025 : 0);
		group.current.position.z = position[2] + Math.cos(t * 0.78) * drift[1];
		// The badger model has no walk animation, so keep its facing fixed while
		// it shuffles gently through a small patch instead of turning in circles.
		if (animal !== "badger") {
			const targetYaw = Math.cos(t) >= 0 ? Math.PI / 2 : -Math.PI / 2;
			group.current.rotation.y = targetYaw;
		}
	});
	const discover = (event) => {
		event.stopPropagation();
		if (!found) { setFound(true); onFind(animal); }
		onEncounter(animal);
	};
	return <group ref={group} position={[position[0], position[1] + groundOffset, position[2]]} scale={scale} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
		<Clone object={scene} />
		<mesh><sphereGeometry args={[1.25 / scale, 8, 6]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
	</group>;
}

function WoodMouse({ position, onFind, onEncounter }) {
	const group = useRef();
	const tail = useMemo(() => new THREE.CatmullRomCurve3([
		new THREE.Vector3(0, .16, .2), new THREE.Vector3(.04, .2, .42), new THREE.Vector3(.12, .14, .62), new THREE.Vector3(.22, .16, .74),
	]), []);
	const [found, setFound] = useState(false);
	useFrame(({ clock }) => {
		if (!group.current) return;
		const t = clock.elapsedTime + 5;
		group.current.position.x = position[0] + Math.sin(t * .29) * .68;
		group.current.position.z = position[2] + Math.cos(t * .23) * .32;
		group.current.rotation.y = Math.cos(t * .29) > 0 ? Math.PI : 0;
	});
	const discover = (event) => {
		event.stopPropagation();
		if (!found) { setFound(true); onFind("wood mouse"); }
		onEncounter("wood mouse");
	};
	return <group ref={group} position={position} scale={0.72} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
		<mesh position={[0, .2, 0]} castShadow><sphereGeometry args={[.25, 9, 7]} /><meshStandardMaterial color="#aa805c" roughness={1} /></mesh>
		<mesh position={[0, .23, -.19]}><sphereGeometry args={[.18, 9, 7]} /><meshStandardMaterial color="#b88e69" roughness={1} /></mesh>
		{[-1, 1].map((side) => <React.Fragment key={side}>
			<mesh position={[side * .13, .39, -.23]}><sphereGeometry args={[.12, 8, 6]} /><meshStandardMaterial color="#916d5b" /></mesh>
			<mesh position={[side * .13, .4, -.238]}><sphereGeometry args={[.075, 8, 6]} /><meshStandardMaterial color="#d88c86" /></mesh>
			<mesh position={[side * .09, .27, -.33]}><sphereGeometry args={[.035, 7, 5]} /><meshStandardMaterial color="#151712" /></mesh>
			<mesh position={[side * .13, .09, .05]}><sphereGeometry args={[.09, 7, 5]} /><meshStandardMaterial color="#81664f" /></mesh>
		</React.Fragment>)}
		<mesh position={[0, .2, -.38]}><sphereGeometry args={[.045, 7, 5]} /><meshStandardMaterial color="#d78c82" /></mesh>
		<mesh><tubeGeometry args={[tail, 12, .018, 5, false]} /><meshStandardMaterial color="#bd8e78" /></mesh>
	</group>;
}

function MovementController({ player, keys, transitioning }) {
	useFrame(({ clock }, delta) => {
		if (transitioning.current) return;
		const movement = keys.current;
		const turn = (movement.right ? 1 : 0) - (movement.left ? 1 : 0);
		const forward = (movement.forward ? 1 : 0) - (movement.backward ? 1 : 0);
		player.current.yaw += turn * delta * 1.45;
		if (forward) {
			const step = forward * delta * 2.1;
			player.current.x += Math.sin(player.current.yaw) * step;
			player.current.z -= Math.cos(player.current.yaw) * step;
			player.current.x = THREE.MathUtils.clamp(player.current.x, -6.5, 6.5);
			player.current.z = THREE.MathUtils.clamp(player.current.z, -39, -1.5);
		}
	});
	return null;
}

function Mushroom({ position, onFind, id }) {
	const [found, setFound] = useState(false);
	const discover = (event) => { event.stopPropagation(); if (!found) { setFound(true); onFind(id); } };
	return <group position={position} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
		<mesh position={[0, .12, 0]}><cylinderGeometry args={[.045, .07, .24, 7]} /><meshStandardMaterial color="#e6d9ba" /></mesh>
		<mesh position={[0, .25, 0]}><sphereGeometry args={[.17, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={found ? "#c98269" : "#a64f3d"} /></mesh>
	</group>;
}

function Fern({ position }) {
	const group = useRef();
	useFrame(({ clock }) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * .65 + position[0]) * .06; });
	return <group ref={group} position={position}>
		{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[(i - 3) * .08, .25 + Math.sin(i * .48) * .07, 0]} rotation={[0, 0, (i - 3) * -.18]}><capsuleGeometry args={[.025, .45, 3, 5]} /><meshStandardMaterial color={i % 2 ? "#506a3f" : "#77905a"} /></mesh>)}
	</group>;
}

function Wildflower({ position, color = "#e8d9a5" }) {
	return <group position={position}>
		<mesh position={[0, .35, 0]}><cylinderGeometry args={[.012, .018, .7, 5]} /><meshStandardMaterial color="#657849" /></mesh>
		{Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[Math.cos(i * 1.256) * .08, .7 + Math.sin(i * 1.256) * .08, 0]}><sphereGeometry args={[.075, 7, 6]} /><meshStandardMaterial color={color} /></mesh>)}
		<mesh position={[0, .7, .02]}><sphereGeometry args={[.045, 7, 6]} /><meshStandardMaterial color="#d6a94d" /></mesh>
	</group>;
}

function Bluebells({ position }) {
	const group = useRef();
	useFrame(({ clock }) => {
		if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * .55 + position[0]) * .035;
	});
	return <group ref={group} position={position}>
		{Array.from({ length: 5 }, (_, i) => {
			const x = (i - 2) * .16;
			const height = .48 + (i % 3) * .08;
			return <group key={i} position={[x, 0, (i % 2) * .08]}>
				<mesh position={[0, height / 2, 0]}><cylinderGeometry args={[.012, .018, height, 5]} /><meshStandardMaterial color="#607b4a" /></mesh>
				<mesh position={[0, height, 0]} rotation={[0, 0, Math.PI]}><cylinderGeometry args={[.035, .09, .16, 6]} /><meshStandardMaterial color={i % 2 ? "#7881b4" : "#969ac5"} roughness={.9} /></mesh>
			</group>;
		})}
	</group>;
}

function CloverPatch({ position }) {
	return <group position={position}>
		{Array.from({ length: 8 }, (_, i) => {
			const angle = i * 2.4;
			const x = Math.cos(angle) * (.08 + (i % 3) * .08);
			const z = Math.sin(angle) * (.08 + (i % 3) * .08);
			return <group key={i} position={[x, .08 + (i % 2) * .04, z]} rotation={[0, angle, .16]}>
				{[-1, 0, 1].map((leaf) => <mesh key={leaf} position={[leaf * .055, 0, 0]} scale={[.8, .24, 1]}><sphereGeometry args={[.075, 7, 5]} /><meshStandardMaterial color={leaf === 0 ? "#738d58" : "#91a66a"} roughness={1} /></mesh>)}
			</group>;
		})}
	</group>;
}

function Bird({ position, phase = 0, onFind, onEncounter }) {
	const group = useRef();
	const { scene, animations } = useGLTF("/models/hawk.glb");
	const { actions } = useAnimations(animations, group);
	const [found, setFound] = useState(false);
	useEffect(() => {
		const fly = actions["metarig|Fly"] || Object.values(actions)[0];
		fly?.reset().fadeIn(0.4).play();
		return () => fly?.fadeOut(0.2);
	}, [actions]);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime * 0.34 + phase;
		if (!group.current) return;
		group.current.position.x = position[0] + Math.sin(t * 0.72) * 2.5;
		group.current.position.y = position[1] + Math.sin(t * 1.15) * 0.3;
		group.current.position.z = position[2] + Math.cos(t * 0.52) * 1.5;
		const dx = Math.cos(t * 0.72) * 2.5;
		const dz = -Math.sin(t * 0.52) * 0.78;
		group.current.rotation.y = Math.atan2(-dx, -dz);
	});
	const discover = (event) => {
		event.stopPropagation();
		if (!found) { setFound(true); onFind("hawk"); }
		onEncounter("hawk");
	};
	return <group ref={group} position={position} scale={0.14} onClick={discover} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
		<Clone object={scene} />
		<mesh><sphereGeometry args={[2.2, 8, 6]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
	</group>;
}

function Bee({ position, phase = 0 }) {
	const group = useRef();
	const wings = useRef();
	useFrame(({ clock }) => {
		const t = clock.elapsedTime * 1.7 + phase;
		if (!group.current) return;
		group.current.position.set(position[0] + Math.sin(t) * .85, position[1] + Math.sin(t * 1.6) * .32, position[2] + Math.cos(t * .8) * .7);
		group.current.rotation.y = -t * .8;
		if (wings.current) wings.current.rotation.x = Math.sin(t * 12) * .65;
	});
	return <group ref={group} position={position}>
		<mesh><sphereGeometry args={[.09, 8, 7]} /><meshStandardMaterial color="#d5a936" /></mesh>
		<mesh position={[0, 0, .035]}><torusGeometry args={[.06, .012, 4, 8]} /><meshStandardMaterial color="#312e20" /></mesh>
		<group ref={wings}><mesh position={[0, .08, .07]}><sphereGeometry args={[.055, 7, 5]} /><meshStandardMaterial color="#dfe7d0" transparent opacity={.65} /></mesh><mesh position={[0, .08, -.07]}><sphereGeometry args={[.055, 7, 5]} /><meshStandardMaterial color="#dfe7d0" transparent opacity={.65} /></mesh></group>
	</group>;
}

function Butterfly({ position, phase = 0, onFind, onEncounter }) {
	const group = useRef();
	const leftWing = useRef();
	const rightWing = useRef();
	const [found, setFound] = useState(false);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime * .42 + phase;
		if (!group.current) return;
		group.current.position.set(position[0] + Math.sin(t) * 1.25, position[1] + Math.sin(t * 1.7) * .3, position[2] + Math.cos(t * .7) * .8);
		group.current.rotation.y = Math.sin(t) * .35;
		if (leftWing.current) leftWing.current.rotation.y = .15 + Math.sin(t * 10) * .7;
		if (rightWing.current) rightWing.current.rotation.y = -.15 - Math.sin(t * 10) * .7;
	});
	const discover = (event) => {
		event.stopPropagation();
		if (!found) { setFound(true); onFind("butterfly"); }
		onEncounter("butterfly");
	};
	const interactive = { onClick: discover, onPointerOver: () => { document.body.style.cursor = "pointer"; }, onPointerOut: () => { document.body.style.cursor = ""; } };
	return <group ref={group} position={position} {...interactive}>
		<mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[.022, .1, 3, 5]} /><meshStandardMaterial color="#493b30" /></mesh>
		<mesh ref={leftWing} position={[-.09, .015, 0]} rotation={[0, 0, .24]}><circleGeometry args={[.13, 7]} /><meshStandardMaterial color="#d99370" side={THREE.DoubleSide} /></mesh>
		<mesh ref={rightWing} position={[.09, .015, 0]} rotation={[0, 0, -.24]}><circleGeometry args={[.13, 7]} /><meshStandardMaterial color="#e6c67e" side={THREE.DoubleSide} /></mesh>
		<mesh position={[0, 0, 0]}><sphereGeometry args={[.24, 7, 5]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
	</group>;
}

function Forest({ onFind, onEncounter, wander }) {
	const trees = useMemo(() => {
		let seed = 281;
		const random = () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};
		const list = [];
		for (let i = 0; i < 205; i++) {
			const x = (random() - 0.5) * 43;
			const z = -random() * 47 - 2;
			const depth = THREE.MathUtils.clamp((Math.abs(z) - 2) / 34, 0.48, 1.3);
			list.push({
				position: [x, 0, z],
				scale: (0.72 + random() * 0.58) * depth,
				variant: Math.floor(random() * 6),
				phase: random() * 9,
			});
		}
		return list;
	}, []);
	return (
		<>
			<fog attach="fog" args={["#a5b9a4", 12, 40]} />
			<ambientLight intensity={1.15} color="#d8e4c9" />
			<hemisphereLight intensity={1.15} color="#d8e9d0" groundColor="#5a6348" />
			<directionalLight
				position={[-6, 12, 4]}
				intensity={2.2}
				color="#ffe4b2"
				castShadow
				shadow-mapSize={[1024, 1024]}
			/>
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.04, -12]}
				receiveShadow
			>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial color="#78846a" roughness={1} />
			</mesh>
			<mesh position={[0, -0.015, -22]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[4.7, 75]} />
				<meshStandardMaterial color="#b6aa87" roughness={1} />
			</mesh>
			{trees.map((tree, i) => (
				<Tree key={i} {...tree} />
			))}
			<Deer position={[2.5, 0, -20]} onFind={onFind} onEncounter={onEncounter} />
			<Fox position={[-3.4, 0, -20.3]} onFind={onFind} onEncounter={onEncounter} />
			<ForestAnimal animal="badger" model="/models/badger.glb" position={[-5.5, 0, -28]} scale={0.009} groundOffset={0.31} phase={1.2} pace={0.34} drift={[1.2, 0.16]} onFind={onFind} onEncounter={onEncounter} />
			<ForestAnimal animal="hedgehog" model="/models/hedgehog.glb" position={[2.7, 0, -29.2]} scale={0.5} animation="idle" phase={2.4} drift={[0.16, 0.12]} onFind={onFind} onEncounter={onEncounter} />
			<ForestAnimal animal="rabbit" model="/models/rabbit.glb" position={[-4.4, 0, -16.4]} scale={0.11} phase={3.1} pace={0.25} drift={[0.75, 0.32]} hop onFind={onFind} onEncounter={onEncounter} />
			<ForestAnimal animal="squirrel" model="/models/squirrel.glb" position={[-1.7, 0, -12.2]} scale={0.11} phase={0.8} drift={[0.4, 0.25]} hop onFind={onFind} onEncounter={onEncounter} />
			<WoodMouse position={[1.2, 0, -11.5]} onFind={onFind} onEncounter={onEncounter} />
			{[[-1.3, 0, -12], [3.2, 0, -18], [-4.4, 0, -23], [1.2, 0, -28], [4.5, 0, -31]].map((position, i) => <Fern key={`fern-${i}`} position={position} />)}
			{[[-3.8, 0, -12], [2.4, 0, -14], [-1.1, 0, -21], [4.2, 0, -22], [-3.7, 0, -32]].map((position, i) => <Bluebells key={`bluebell-${i}`} position={position} />)}
			{[[-1.8, 0, -10], [2.2, 0, -16], [-4.5, 0, -18], [3.7, 0, -27], [-.4, 0, -33], [4.8, 0, -35]].map((position, i) => <CloverPatch key={`clover-${i}`} position={position} />)}
			{[[-2.2, 0, -12.5], [1.3, 0, -18.5], [3.8, 0, -25], [-3.6, 0, -29]].map((position, i) => <Mushroom key={`mushroom-${i}`} id={i === 0 ? "fly agaric" : `woodland mushroom ${i}`} position={position} onFind={onFind} />)}
			{[[-3.5, 0, -10], [-2.8, 0, -14], [3.4, 0, -17], [2.1, 0, -24], [-1.2, 0, -27]].map((position, i) => <Wildflower key={`flower-${i}`} position={position} color={i % 2 ? "#e5c7a1" : "#d7dba7"} />)}
			<Bird position={[-2, 5.5, -17]} phase={0} onFind={onFind} onEncounter={onEncounter} />
			<Bird position={[1, 6.1, -22]} phase={2.1} onFind={onFind} onEncounter={onEncounter} />
			<Bird position={[3, 5.2, -14]} phase={4.4} onFind={onFind} onEncounter={onEncounter} />
			<Bee position={[-1.5, .9, -13]} phase={0} />
			<Bee position={[2.2, 1.2, -19]} phase={2.4} />
			<Bee position={[-2.9, .85, -25]} phase={4.8} />
			<Butterfly position={[-1.2, 1.25, -12]} phase={0} onFind={onFind} onEncounter={onEncounter} />
			<Butterfly position={[2.7, 1.6, -19]} phase={2.4} onFind={onFind} onEncounter={onEncounter} />
			<Butterfly position={[-3, 1.05, -29]} phase={4.1} onFind={onFind} onEncounter={onEncounter} />
			<Cloud
				position={[-4, 8, -17]}
				seed={42}
				opacity={0.12}
				speed={0.06}
				segments={18}
			/>
			<Sparkles
				count={85}
				scale={[27, 10, 25]}
				size={2.2}
				speed={0.18}
				color="#eff4c7"
				opacity={0.55}
			/>
			<Stars
				radius={65}
				depth={40}
				count={450}
				factor={3}
				saturation={0}
				fade
				speed={0.05}
			/>
		</>
	);
}

function Scene({ zoom, wander, onFind, onEncounter, look, player, keys, transitioning }) {
	const previousWander = useRef(false);
	const viewTransition = useRef(null);
	useFrame(({ camera, clock }, delta) => {
		const t = clock.elapsedTime;
		const targetFov = THREE.MathUtils.lerp(48, 39, zoom);
		camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 2.6, 1 / 60);
		camera.updateProjectionMatrix();
		const clearPosition = new THREE.Vector3(Math.sin(t * 0.09) * 0.22, 2.8 + Math.sin(t * 0.17) * 0.045, 8);
		const clearLook = new THREE.Vector3(Math.sin(t * 0.09) * 0.4, 2.5, -10);
		if (wander) {
			const heading = player.current.yaw + look.current.yaw;
			const eyeHeight = 1.62;
			const forestPosition = new THREE.Vector3(player.current.x, eyeHeight, player.current.z);
			const pitch = look.current.pitch;
			const forestLook = new THREE.Vector3(
				player.current.x + Math.sin(heading) * Math.cos(pitch),
				eyeHeight + Math.sin(pitch),
				player.current.z - Math.cos(heading) * Math.cos(pitch),
			);
			if (!previousWander.current) {
				const direction = camera.getWorldDirection(new THREE.Vector3());
				viewTransition.current = {
					elapsed: 0,
					fromPosition: camera.position.clone(),
					fromLook: camera.position.clone().addScaledVector(direction, 18),
				};
				previousWander.current = true;
				transitioning.current = true;
			}
			if (viewTransition.current) {
				const transition = viewTransition.current;
				transition.elapsed += delta;
				const progress = THREE.MathUtils.clamp(transition.elapsed / 2.2, 0, 1);
				const eased = progress * progress * (3 - 2 * progress);
				camera.position.lerpVectors(transition.fromPosition, forestPosition, eased);
				camera.lookAt(new THREE.Vector3().lerpVectors(transition.fromLook, forestLook, eased));
				if (progress >= 1) {
					viewTransition.current = null;
					transitioning.current = false;
				}
			} else {
				camera.position.copy(forestPosition);
				camera.lookAt(forestLook);
			}
		} else {
			if (previousWander.current) {
				const direction = camera.getWorldDirection(new THREE.Vector3());
				viewTransition.current = {
					elapsed: 0,
					fromPosition: camera.position.clone(),
					fromLook: camera.position.clone().addScaledVector(direction, 18),
				};
				previousWander.current = false;
				transitioning.current = true;
			}
			if (viewTransition.current) {
				const transition = viewTransition.current;
				transition.elapsed += delta;
				const progress = THREE.MathUtils.clamp(transition.elapsed / 2.2, 0, 1);
				const eased = progress * progress * (3 - 2 * progress);
				camera.position.lerpVectors(transition.fromPosition, clearPosition, eased);
				camera.lookAt(new THREE.Vector3().lerpVectors(transition.fromLook, clearLook, eased));
				if (progress >= 1) {
					viewTransition.current = null;
					transitioning.current = false;
				}
			} else {
				camera.position.copy(clearPosition);
				camera.lookAt(clearLook);
			}
		}
	});
	return <>
		<Forest onFind={onFind} onEncounter={onEncounter} wander={wander} />
		{wander && <MovementController player={player} keys={keys} transitioning={transitioning} />}
	</>;
}

function App() {
	const [sound, setSound] = useState(false);
	const [currentTime, setCurrentTime] = useState(() => new Date());
	const audioRef = useRef(null);
	const [wander, setWander] = useState(false);
	const [zoom, setZoom] = useState(0);
	const [discoveries, setDiscoveries] = useState([]);
	const [activeAnimal, setActiveAnimal] = useState(null);
	const animalCloseRef = useRef(null);
	const sceneRef = useRef(null);
	const cameraTransitionRef = useRef(false);
	const lookRef = useRef({ yaw: 0, pitch: 0 });
	const dragRef = useRef(null);
	const playerRef = useRef({ x: 0, z: -2, yaw: 0 });
	const keysRef = useRef({ forward: false, backward: false, left: false, right: false });
	useEffect(() => {
		const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000);
		return () => window.clearInterval(timer);
	}, []);
	const onFind = (name) => setDiscoveries((found) => found.includes(name) ? found : [...found, name]);
	const onEncounter = (name) => { keysRef.current = { forward: false, backward: false, left: false, right: false }; setActiveAnimal(ANIMAL_INFO[name]); };
	useEffect(() => {
		const canvas = sceneRef.current?.querySelector("canvas");
		if (!wander || !canvas) return;
		const onDown = (event) => {
			if ((event.button !== 0 && event.pointerType !== "touch") || cameraTransitionRef.current) return;
			dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
			sceneRef.current?.classList.add("is-dragging");
		};
		const onMove = (event) => {
			const drag = dragRef.current;
			if (!drag || drag.id !== event.pointerId) return;
			const dx = event.clientX - drag.x;
			const dy = event.clientY - drag.y;
			if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) drag.moved = true;
			if (drag.moved) {
				lookRef.current.yaw = THREE.MathUtils.clamp(lookRef.current.yaw - dx * 0.004, -1.15, 1.15);
				lookRef.current.pitch = THREE.MathUtils.clamp(lookRef.current.pitch - dy * 0.003, -0.42, 0.42);
			}
			drag.x = event.clientX;
			drag.y = event.clientY;
		};
		const onUp = (event) => {
			if (dragRef.current?.id === event.pointerId) dragRef.current = null;
			sceneRef.current?.classList.remove("is-dragging");
		};
		const onWheel = (event) => {
			event.preventDefault();
			setZoom((value) => THREE.MathUtils.clamp(value - event.deltaY * 0.001, 0, 1));
		};
		canvas.addEventListener("pointerdown", onDown);
		canvas.addEventListener("wheel", onWheel, { passive: false });
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
		return () => {
			canvas.removeEventListener("pointerdown", onDown);
			canvas.removeEventListener("wheel", onWheel);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
			dragRef.current = null;
			sceneRef.current?.classList.remove("is-dragging");
		};
	}, [wander]);
	useEffect(() => {
		const keyMap = {
			w: "forward", arrowup: "forward",
			s: "backward", arrowdown: "backward",
			a: "left", arrowleft: "left",
			d: "right", arrowright: "right",
		};
		const onKeyDown = (event) => {
			const key = event.key.toLowerCase();
			const action = keyMap[key];
			if (!wander || !action || activeAnimal || cameraTransitionRef.current) return;
			event.preventDefault();
			keysRef.current[action] = true;
		};
		const onKeyUp = (event) => {
			const action = keyMap[event.key.toLowerCase()];
			if (action) keysRef.current[action] = false;
		};
		const onBlur = () => { keysRef.current = { forward: false, backward: false, left: false, right: false }; };
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onBlur);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
			onBlur();
		};
	}, [wander, activeAnimal]);
	useEffect(() => {
		if (!activeAnimal) return;
		animalCloseRef.current?.focus();
		const onEscape = (event) => {
			if (event.key === "Escape") setActiveAnimal(null);
		};
		window.addEventListener("keydown", onEscape);
		return () => window.removeEventListener("keydown", onEscape);
	}, [activeAnimal]);
	const toggleSound = async () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (sound) {
			audio.pause();
			audio.currentTime = 0;
			setSound(false);
			return;
		}
		audio.volume = 0.38;
		try {
			await audio.play();
			setSound(true);
		} catch {
			setSound(false);
		}
	};
	useEffect(() => () => audioRef.current?.pause(), []);
	return (
		<main className="experience">
			<audio ref={audioRef} src="/audio/forest-ambience.mp3" loop preload="none" />
			<div className={`scene${wander ? " exploring" : ""}`} ref={sceneRef}>
				<Canvas
					shadows
					dpr={[1, 1.6]}
					camera={{ position: [0, 2.8, 8], fov: 48 }}
					style={{ pointerEvents: wander ? "auto" : "none" }}
				>
					<Suspense fallback={null}>
						<Scene zoom={zoom} wander={wander} onFind={onFind} onEncounter={onEncounter} look={lookRef} player={playerRef} keys={keysRef} transitioning={cameraTransitionRef} />
					</Suspense>
				</Canvas>
			</div>
			<div className="scene-shade" />
			<header className="topbar">
				<a className="brand" href="#home">
					<span className="brand-mark">
						<Leaf size={17} strokeWidth={1.5} />
					</span>
					<span>fernhaven</span>
				</a>
				<div className="topbar-right">
					<span className="live">
						<i /> FERNHAVEN WOODS <b>·</b> {currentTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })}
					</span>
					<button
						className="sound-button"
						onClick={toggleSound}
						aria-label={sound ? "Turn forest ambience off" : "Turn forest ambience on"}
						aria-pressed={sound}
					>
						{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
						<span>{sound ? "SOUND ON" : "SOUND OFF"}</span>
					</button>
				</div>
			</header>
			{!wander && <section className="hero" id="home">
				<div className="eyebrow">
					<span className="eyebrow-line" />
					<span>A SMALL ESCAPE</span>
					<span className="eyebrow-line" />
				</div>
				<h1>
					Somewhere
					<br />
					to <em>slow down.</em>
				</h1>
				<p>
					A living forest, made for wandering.
					<br />
					Take a breath. See where the path goes.
				</p>
				<button className="wander-button" onClick={() => setWander(true)}>
					<Compass size={16} strokeWidth={1.7} />
					{wander ? "You’re wandering" : "Wander in"}
					<ArrowUpRight size={16} className="button-arrow" />
				</button>
			</section>}
			{wander && <section className="explore-panel" aria-live="polite">
				<div className="explore-eyebrow"><span className="live-dot" /> TRAIL 02 · WILDLIFE</div>
				<h2>The woods<br /><em>are alive.</em></h2>
				<p>{discoveries.length ? `${discoveries.length} small discoveries noticed` : "No score, no rush. Wander at your own pace."}</p>
				<div className="discovery-list">{discoveries.map((item) => <span key={item}>✦ {item}</span>)}</div>
				<button className="leave-explore" onClick={() => { setWander(false); setZoom(0); }}>Return to the clearing</button>
			</section>}
			{wander && <div className="zoom-control" aria-label="Camera zoom controls">
				<span>LOOK CLOSER</span>
				<div><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0, value - 0.2))}>−</button><input aria-label="Zoom level" type="range" min="0" max="1" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1, value + 0.2))}>+</button></div>
				<small>DRAG TO LOOK AROUND</small>
			</div>}
			{wander && <div className="walk-control" aria-label="Movement controls">
				<span>EXPLORE THE WOODS</span>
				<div className="walk-pad">
					<span />
					<button aria-label="Walk forward" onPointerDown={() => { keysRef.current.forward = true; }} onPointerUp={() => { keysRef.current.forward = false; }} onPointerLeave={() => { keysRef.current.forward = false; }} onPointerCancel={() => { keysRef.current.forward = false; }}><ChevronUp size={17} /></button>
					<span />
					<button aria-label="Turn left" onPointerDown={() => { keysRef.current.left = true; }} onPointerUp={() => { keysRef.current.left = false; }} onPointerLeave={() => { keysRef.current.left = false; }} onPointerCancel={() => { keysRef.current.left = false; }}><ChevronLeft size={17} /></button>
					<button aria-label="Walk back" onPointerDown={() => { keysRef.current.backward = true; }} onPointerUp={() => { keysRef.current.backward = false; }} onPointerLeave={() => { keysRef.current.backward = false; }} onPointerCancel={() => { keysRef.current.backward = false; }}><ChevronDown size={17} /></button>
					<button aria-label="Turn right" onPointerDown={() => { keysRef.current.right = true; }} onPointerUp={() => { keysRef.current.right = false; }} onPointerLeave={() => { keysRef.current.right = false; }} onPointerCancel={() => { keysRef.current.right = false; }}><ChevronRight size={17} /></button>
				</div>
				<small>W A S D OR ARROW KEYS</small>
			</div>}
			{activeAnimal && <div className="animal-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setActiveAnimal(null); }}>
				<section className="animal-modal" role="dialog" aria-modal="true" aria-labelledby="animal-title">
					<button ref={animalCloseRef} className="animal-modal-close" aria-label="Close animal information" onClick={() => setActiveAnimal(null)}><X size={18} /></button>
					<span className="modal-kicker"><Leaf size={13} /> A MOMENT IN THE WOODS</span>
					<h2 id="animal-title">{activeAnimal.title}</h2>
					<p className="animal-scientific">{activeAnimal.scientific}</p>
					<p className="animal-about">{activeAnimal.about}</p>
					<p className="animal-pause">{activeAnimal.pause}</p>
					<a className="animal-source" href={activeAnimal.source} target="_blank" rel="noreferrer">Learn more about this animal <ArrowUpRight size={13} /></a>
				</section>
			</div>}
			<div className="side-note">
				<span>01 / 04</span>
				<span className="side-rule" />
				<span>{wander ? "THE DEEP WOOD" : "A QUIETER KIND OF PLACE"}</span>
			</div>
			<footer className="bottom-bar">
				<div className="location">
					<LocateFixed size={15} strokeWidth={1.5} />
					<div>
						<span>YOU ARE HERE</span>
						<strong>{wander ? "Fernhaven · deep trail" : "Fernhaven trail"}</strong>
					</div>
				</div>
				<button className="ambience" onClick={toggleSound} aria-label={sound ? "Turn forest ambience off" : "Turn forest ambience on"} aria-pressed={sound}>
					<AudioLines size={15} strokeWidth={1.6} />
					<span>FOREST AMBIENCE</span>
					<div className={`sound-wave${sound ? " playing" : ""}`}>
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
						<i />
					</div>
				</button>
				<button className="discover" onClick={() => { setWander(!wander); if (wander) setZoom(0); }}>
					{wander ? "LEAVE THE FOREST" : "DISCOVER THE FOREST"} <ArrowUpRight size={14} />
				</button>
			</footer>
			<div className="frame-corner" />
		</main>
	);
}

export default App;
