window.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
  document.getElementById('scene-container').appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2, 1000);
  scene.add(light);

  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const planetData = [
    { name: 'Mercury', radius: 0.3, distance: 5, color: 0xaaaaaa, speed: 0.04 },
    { name: 'Venus',   radius: 0.5, distance: 7, color: 0xffcc99, speed: 0.015 },
    { name: 'Earth',   radius: 0.6, distance: 9, color: 0x3399ff, speed: 0.01 },
    { name: 'Mars',    radius: 0.4, distance: 11, color: 0xff3300, speed: 0.008 },
    { name: 'Jupiter', radius: 1.2, distance: 14, color: 0xffcc66, speed: 0.005 },
    { name: 'Saturn',  radius: 1.0, distance: 17, color: 0xffe699, speed: 0.003 },
    { name: 'Uranus',  radius: 0.7, distance: 20, color: 0x66ccff, speed: 0.002 },
    { name: 'Neptune', radius: 0.7, distance: 23, color: 0x3366ff, speed: 0.0015 },
  ];

  const planets = [];
  const speeds = {};
  const controlsDiv = document.getElementById('controls');

  planetData.forEach((p) => {
    const geometry = new THREE.SphereGeometry(p.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { angle: Math.random() * Math.PI * 2, distance: p.distance };
    planets.push(mesh);
    scene.add(mesh);
    speeds[p.name] = p.speed;

    const label = document.createElement('label');
    label.innerHTML = `${p.name}: <input type="range" min="0.001" max="0.05" step="0.001" value="${p.speed}" id="${p.name}">`;
    controlsDiv.appendChild(label);

    document.getElementById(p.name).addEventListener('input', (e) => {
      speeds[p.name] = parseFloat(e.target.value);
    });
  });

  camera.position.z = 30;

  // Add stars
  function addStars(count = 300) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  }
  addStars();

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.color = "white";
  tooltip.style.fontSize = "14px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function updateTooltip() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const name = planetData[planets.indexOf(obj)].name;
      tooltip.innerText = name;
      tooltip.style.left = event.clientX + 10 + 'px';
      tooltip.style.top = event.clientY + 10 + 'px';
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }
  }

  // Pause feature
  let paused = false;
  document.getElementById("toggle-animation").addEventListener("click", () => {
    paused = !paused;
    document.getElementById("toggle-animation").innerText = paused ? "Resume" : "Pause";
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!paused) {
      planets.forEach((planet, i) => {
        const name = planetData[i].name;
        planet.userData.angle += speeds[name];
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
      });
    }
    updateTooltip();
    renderer.render(scene, camera);
  }
  animate();
});
