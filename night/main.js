

//COLOUR PALLETTE
var Colours = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    slateGray:0x7D6B91,
    desert:0xc09a6b
}

window.addEventListener('load', init, false);
//Variables for Init Function
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, height, width, renderer, container;
//Variables for Lights Function
var hemisphereLight, shadowLight, hemiLighthelper, dirLightHelper;
//Variables to create the sea 
var sea;
//Variables to create the sky
var sky;
//Variables to create the plane
var plane;

function init() {
    // Set up the scene, camera and the renderer
    height = window.innerHeight;
    width = window.innerWidth;

    scene = new THREE.Scene();

    //Scene has a Fog Effect, same colour as the background div "world"
    // scene.fog = new THREE.Fog(0x989FCE, 100, 950);
    scene.fog = new THREE.Fog(0xB7BACE, 100, 950);
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
    //Create all the objects necessary for the game
    createSea();
    createSky();
    createPlane();
    //Run a animated loop
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
    //Hemisphere Light helper element helps map how the light is being cast ambiently.
    hemiLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 10);
    
    //Directional Light Acts as the sun inthis scene. Ray of light.
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    //Define visible area of shadow projection
    shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// Define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    //Directional Light helper helps visually describe how the directional light is cast and zones of light
    dirLightHelper = new THREE.DirectionalLightHelper(shadowLight, 10);

    ambientLight = new THREE.AmbientLight(0xdc8874, .5);
    scene.add(ambientLight);

    //Adding the shadow casting light and the hemispherical light to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);

    //Adding the helpers for both lights to the scene.
    scene.add(hemiLightHelper);
    scene.add(dirLightHelper);
}

//Function to create the sea 3D object and add it to the scene.
function createSea() {
    sea = new Sea();
    sea.mesh.position.y=-600;
    scene.add(sea.mesh);
}

//Function to create the sky 3D object and the clouds in it. This object is added to the scene.
function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}

//Function to create the plane 3D object and it to the scene
function createPlane() {
    plane = new AirPlane();
    plane.mesh.position.y = 100;
    plane.mesh.scale.set(0.25, 0.25, 0.25);
    scene.add(plane.mesh);
}

function loop() {
    //Rotate the propeller, the sea and the sky
    plane.propeller.rotation.x += 0.3;
    sea.mesh.rotation.z += 0.005;
    sky.mesh.rotation.z += 0.01;
    //Render the scene.
    renderer.render(scene, camera);
    //Call the loop funciton again
    requestAnimationFrame(loop);
}

Sea = function() {
    //Create geometry of the cylinder that represents the sea 
    /*The parameters include radius bottom, height, 
    number of segments on the radius and number of segments vertically*/
    let geo = new THREE.CylinderGeometry(600,600,800,40,10);
    geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    let mat = new THREE.MeshPhongMaterial({
        color: Colours.desert,
        transparent: true,
        opacity: 0.6,
        flatShading: true
    });

    this.mesh = new THREE.Mesh(geo, mat);
    //Allow the sea object to receive shadow
    this.mesh.receiveShadow = true;
}

//Define a star object 
Stars = function() {
    this.mesh = new THREE.Object3D();

    let mat = new THREE.PointsMaterial({
        size: 15, 
        color: Colours.white
    });
    let geo = new THREE.Geometry();
    for(let i=0;i<500;i++){
        let x = 1000* Math.random() - 500;
        let y = 750*Math.random() + 500;
        let z = -400-Math.random()*400
        geo.vertices.push(new THREE.Vector3(x,y,z)); 
    }
    let stars = new THREE.Points(geo, mat);
    this.mesh.add(stars);


}
//Define a cloud object
Cloud = function() {
    //So this mesh represents a sort of mesh container for all the tiny cubes that make a low-poly cloud
    this.mesh = new THREE.Object3D();
    //Create a cube geometry which will be duplicated to create the cloud
    let geo = new THREE.BoxGeometry(20,20,20);
    //Create material for the cloud in this case we are going to use a white material for the clouds
    let mat = new THREE.MeshPhongMaterial({
        color: Colours.slateGray,
    });
    //Duplicate the cubes to make individual parts of the cloud (upto 6 individual parts)
    let nBlocs = 3+Math.floor(Math.random()*3);
    for (var i=0; i<nBlocs; i++){
        //Cloning the geometry a bunch of times 
        var m = new THREE.Mesh(geo, mat);
        //Position and rotation of each cube is random 
        m.position.x = i*15;
        m.position.y = Math.random()*10;
        m.position.z = Math.random()*10;
        m.rotation.z = Math.random()*Math.PI*2;
        m.rotation.y = Math.random()*Math.PI*2;

        //Scaling each cloud cube down to a random dimension
        let s= 0.1 + Math.random()*0.9;
        m.scale.set(s,s,s);

        //Allow each cube in the cloud to cast and receive shadows
        m.castShadow = true;
        m.receiveShadow = true;

        //Add the cube to each cloud container
        this.mesh.add(m);
    }

}
//Define a Sky Object 
Sky = function() {
    //Create an empty container representing the sky in it's entirety
    this.mesh = new THREE.Object3D();
    //Represents the number of clouds to appear in the sky object 
    this.nClouds = 20;
    //The clouds have to be placed along a uniform angle, in a consistent manner 
    let stepAngle = Math.PI*2 / this.nClouds;

    //For loop to create the clouds
    for(var i =0; i<this.nClouds; i++){
        let st = new Stars();
        let c = new Cloud();

        //Set the rotation and position of each cloud 
        //Final angle of this particular cloud
        let a = stepAngle*i;
        //This is the distance between the center of the scene axis and the cloud itself
        let h = 750 + Math.random()*200;
   
        //Converting polar coordinates (distance for h and angle for a) into Cartesian Coordinates (x, y)
        let x= Math.sin(a)*h;
        console.log('Height between axis', x);
        c.mesh.position.y = x;
        c.mesh.position.x = Math.cos(a)*h;

        //Rotate the cloud according to it's position
        c.mesh.rotation.z = a + Math.PI/2;
        //Positioning the clouds at random depths for each cloud
        c.mesh.position.z = -400-Math.random()*400;

        //Randomly scale each cloud 
        let s = 1+Math.random()*2;
        c.mesh.scale.set(s, s, s);
        //Add each cloud to the empty container sky object
        this.mesh.add(st.mesh);
        this.mesh.add(c.mesh);
    }
}

//Define an airplane object
AirPlane = function() {
    this.mesh = new THREE.Object3D();
    
    //
    let cockpitGeo = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
    let cockpitMat = new THREE.MeshPhongMaterial({
        color: Colours.red,
        flatShading: true
    });
    //
    let cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    //
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    //
    this.mesh.add(cockpit);

    //
    let engineGeo = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    let engineMat = new THREE.MeshPhongMaterial({
        color: Colours.white,
        flatShading: true
    })
    //
    let engine = new THREE.Mesh(engineGeo, engineMat);
    //
    engine.castShadow = true;
    engine.receiveShadow = true;
    engine.position.x = 40;
    //
    this.mesh.add(engine);

    //
    let propellerGeo = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    let propellerMat = new THREE.MeshPhongMaterial({
        color: Colours.brown,
        flatShading: true
    });
    //
    this.propeller = new THREE.Mesh(propellerGeo, propellerMat);
    //
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    //
    let bladeGeo = new THREE.BoxGeometry(2, 100, 20, 1, 1, 1);
    let bladeMat = new THREE.MeshPhongMaterial({
        color: Colours.brownDark,
        flatShading: true
    });
    let blade = new THREE.Mesh(bladeGeo, bladeMat);
    //
    blade.castShadow = true;
    blade.receiveShadow = true;
    blade.position.set(8,0,0);
    // 
    this.propeller.add(blade);
	this.propeller.position.set(50,0,0);
	this.mesh.add(this.propeller);
    
    //
    let tailGeo = new THREE.BoxGeometry(10, 20, 2, 1, 1, 1);
    let tailMat = new THREE.MeshPhongMaterial({
        color: Colours.red,
        flatShading: true
    });
    //
    let tail = new THREE.Mesh(tailGeo, tailMat);
    //
    tail.castShadow = true;
    tail.receiveShadow = true;
    tail.position.set(-35, 25, 0);
    //
    this.mesh.add(tail);

    //
    let wingGeo = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    let wingMat = new THREE.MeshPhongMaterial({
        color: Colours.red,
        flatShading: true
    });
    //
    let wing = new THREE.Mesh(wingGeo, wingMat);
    //
    wing.castShadow = true;
    wing.receiveShadow = true;
    this.mesh.add(wing);

}
