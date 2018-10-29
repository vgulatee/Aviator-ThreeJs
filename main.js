//COLOUR PALLETTE
var Colours = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x683c0
}

window.addEventListener('load', init, false);
//Variables for Init Function
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, height, width, renderer, container;
//Variables for Lights Function
var hemisphereLight, shadowLight, hemiLighthelper, dirLightHelper;

function init() {
    // Set up the scene, camera and the renderer
    height = window.innerHeight;
    width = window.innerWidth;

    scene = new THREE.Scene();

    //Scene has a Fog Effect, same colour as the background div "world"
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    aspectRatio = width / height;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    //Camera position
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    //Create Renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    //Renderer should fit the entire screen
    renderer.setSize(width, height);
    //Shadow Rendering enabled
    renderer.shadowMap.enabled = true;
    //Add DOM element of the renderer to container with id 'world'
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);

    //Create Lights for the Scene
    createLights();
    loop();
}

function handleWindowResize() {
    height = window.innerHeight;
    width = window.innerWidth;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function createLights() {
    //The first parameter is the sky colour and the second colour is a ground colour.
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
    hemiLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 10);
    
    //Directional Light Acts as the sun inthis scene. Ray of light.
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    
    dirLightHelper = new THREE.DirectionalLightHelper(shadowLight, 10);

    scene.add(hemisphereLight);
    scene.add(hemiLightHelper);
    scene.add(shadowLight);
    scene.add(dirLightHelper);
}

function loop() {
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}