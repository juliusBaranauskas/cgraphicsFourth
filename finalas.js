

var stats = initStats();
var scene = new THREE.Scene();
var dollyCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 9000);
var mainCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 9000);
var followingCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 9000);

var webGLRenderer = new THREE.WebGLRenderer();
webGLRenderer.setClearColor(0xEEEEEE, 1.0);
webGLRenderer.setSize(window.innerWidth, window.innerHeight);
webGLRenderer.shadowMapEnabled = true;
var moverPosition = new THREE.Vector3(0, 0, 0);

var controls = new function() {

    this.figSegments = 12;
    this.fov = 45;
    this.cameraNum = 1;

    this.redraw = function() {
    
        scene.remove(rook);
        scene.remove(king);

        generateKing(controls.figSegments, moverPosition.x, moverPosition.y, moverPosition.z);
        generateRook(controls.figSegments, 0, 0, 0);
        var camPos = dollyCam.position;
        scene.remove(dollyCam);
        
        setupdollyCam(controls.fov, camPos);
        readyNormalCamera();
    };
}
var gui = new dat.GUI();
gui.add(controls, 'figSegments', 0, 50).step(1).onChange(controls.redraw);
gui.add(controls, 'cameraNum', 1, 3).step(1).onChange(controls.redraw);
gui.add(controls, 'fov', 30, 150).step(1).onChange(controls.redraw);

dollyCam.position.x = -500;
dollyCam.position.y = 40;
dollyCam.position.z = 10;
dollyCam.rotation.set(-Math.PI/2, -Math.PI/2, Math.PI); 
dollyCam.lookAt(new THREE.Vector3(0, 0, -80));

mainCam.position.x = -500;
mainCam.position.y = 40;
mainCam.position.z = 100;
mainCam.lookAt(new THREE.Vector3(0, 0, 0));
mainCam.rotation.set(-Math.PI/2, -Math.PI/2, Math.PI); 

let dollyCamBox = undefined;
let seklysCamBox = undefined;
var line;

addCam();

const light = new THREE.PointLight( 0xffffff, 2, 1000 );
light.position.set( 50, 50, 300 );
scene.add( light );

$("#WebGL-output").append(webGLRenderer.domElement);

camControl = new THREE.TrackballControls( mainCam, webGLRenderer.domElement );    

var counter = 0;

var rook;
var king;

generateRook(12, 0, 0, 0);
generateKing(12, 0, 0, 0);

addFloor();

render();

var rot = 0;
var counter = 0;
followingCam.position.x = 0;
followingCam.position.y = 0;
followingCam.position.z = 500;
followingCam.lookAt(new THREE.Vector3(0, 0, 0));

function setupdollyCam(fov, camPos) {
    dollyCam.fov = fov;
    dollyCam.updateProjectionMatrix();
    
    const constant = 150;
    const length = Math.sqrt(camPos.x *  camPos.x + camPos.y * camPos.y + camPos.z *camPos.z);
    const distance = Math.abs(constant/ (2*Math.tan(fov/360 * Math.PI)));
    
    dollyCam.position.x = distance * camPos.x/length;
    dollyCam.position.y = distance * camPos.y/length;
    dollyCam.position.z = distance * camPos.z/length;
}

function readyNormalCamera() {
    mainCam.updateProjectionMatrix ();
    mainCam.rotation.set(-Math.PI/2, -Math.PI/2, Math.PI); 
}

function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $("#Stats-output").append(stats.domElement);
    return stats;
}

function addCam() {

    const floorGeometry = new THREE.BoxGeometry( 100, 100, 100 );
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
        'https://i.ytimg.com/vi/AE1bMc8tGWs/maxresdefault.jpg',
        (texture) => {
            const textureMaterial = new THREE.MeshBasicMaterial({ map: texture});
            texture.minFilter = THREE.NearestFilter;
            dollyCamBox = THREE.SceneUtils.createMultiMaterialObject(floorGeometry, [textureMaterial]);
            dollyCamBox.position.x = dollyCam.position.x;
            dollyCamBox.position.y = dollyCam.position.y;
            dollyCamBox.position.z = dollyCam.position.z;
            dollyCamBox.rotation.set(0, 0, Math.PI/2);
            scene.add(dollyCamBox);
            
            seklysCamBox = THREE.SceneUtils.createMultiMaterialObject(floorGeometry, [textureMaterial]);
            seklysCamBox.position.x = followingCam.position.x;
            seklysCamBox.position.y = followingCam.position.y;
            seklysCamBox.position.z = followingCam.position.z;
            
            seklysCamBox.rotation.set(Math.PI/2 + followingCam.rotation.x, followingCam.rotation.z, 0); 
            scene.add(seklysCamBox);
        });
}

function createMesh(geom) {

    var meshMaterial = new THREE.MeshLambertMaterial();
    meshMaterial.side = THREE.DoubleSide;
    var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
    return mesh;
}

function generateRook(segments, x, y, z) {
    var pointsX = [
        250, 220, 208, 
201, 196, 194, 194, 197, 
203, 213, 225, 208, 203, 
208, 228, 226, 224, 221, 
217, 212, 204, 188, 185, 
174, 169, 168, 175, 172, 
172, 173, 250 ];
var pointsY = [
34, 46, 58, 
70, 82, 94, 106, 118, 
130, 142, 154, 166, 178, 
190, 202, 214, 226, 238, 
250, 262, 274, 286, 298, 
310, 322, 334, 346, 358, 
370, 382, 382];
    var points = [];
    var count = 31;
    for (var i = 0; i < count; i++) {
        points.push(new THREE.Vector3((250-pointsX[i])/4, 0, (pointsY[30]-pointsY[i]-230)/4));
    }

    var latheGeometry = new THREE.LatheGeometry(points, Math.ceil(segments), 0, 2 * Math.PI);
    rook = createMesh(latheGeometry);
    rook.position.set(x, y,z);
    scene.add(rook);
}

function generateKing(segments, x, y, z) {
    var pointsX = [
    0, 50, 50,
    50, 50, 100,
    100, 75, 50, 
    50, 50, 100,
    110, 120, 140,
    160, 190, 210,
    205, 200, 190,
    180, 170, 160,
    150, 140, 130,
    120, 115, 110,
    105, 100, 100,
    100, 105, 110,
    115, 120, 130,
    140, 150, 160,
    170, 180, 190,
    200, 205, 210,
    240, 250, 250,
    250, 240, 210,
    210, 180, 150,
    180, 200, 210,
    210, 220, 230,
    240, 250, 280,
    300, 300, 0,
    ];

    var points = [];
    var count = 72;
    for (var i = 0; i < count; i++) {
        points.push(new THREE.Vector3(pointsX[i]/10, 0, (750-i*20)/10));
    }

    var latheGeometry = new THREE.LatheGeometry(points, Math.ceil(segments), 0, 2 * Math.PI);
    king = createMesh(latheGeometry);
    king.position.set(x, y,z);
    scene.add(king);
}

function addFloor() {
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
        'https://thumbs.dreamstime.com/z/black-white-checker-pattern-llustration-texture-82326757.jpg',
        (texture) => {
            const textureMaterial = new THREE.MeshBasicMaterial({ map: texture});
            texture.minFilter = THREE.NearestFilter;
            const floorMesh = THREE.SceneUtils.createMultiMaterialObject(floorGeometry, [textureMaterial]);
            floorMesh.position.z = -80;
            scene.add(floorMesh);
        });
}

function render() {

    stats.update();
    if (counter > 6.28) counter = 0;

    counter += 0.01;

    moverPosition =  new THREE.Vector3( 0, 400 * Math.cos(counter), 0);

    scene.remove(king);
    generateKing(controls.figSegments, moverPosition.x, moverPosition.y, moverPosition.z);
    updateCameras();
    createLine();

    followingCam.lookAt(moverPosition);
    var camRotation = followingCam.rotation;
    if (camRotation.x < 0 && rot < Math.PI) rot += 0.05;
    else if (rot > 0 && camRotation.x > 0) rot -= 0.05;
    
    followingCam.rotation.set(followingCam.rotation.x, 0, rot); 
    followingCam.updateProjectionMatrix ();

    requestAnimationFrame(render);
    camControl.update(); 


    switch (controls.cameraNum) {
        case 1:
            webGLRenderer.render(scene, mainCam);
            break;
        case 2:
            webGLRenderer.render(scene, dollyCam);
            break;
        default:
            webGLRenderer.render(scene, followingCam);
    }
}

function updateCameras() {
    if (dollyCamBox) {
        dollyCamBox.rotation = dollyCam.rotation;

        dollyCamBox.position.x = dollyCam.position.x;
        dollyCamBox.position.y = dollyCam.position.y;
        dollyCamBox.position.z = dollyCam.position.z;
		dollyCamBox.rotation.set(0, 0, Math.PI/2);
    }

    if (seklysCamBox) {
        seklysCamBox.rotation = dollyCam.rotation;

        seklysCamBox.position.x = followingCam.position.x;
        seklysCamBox.position.y = followingCam.position.y;
        seklysCamBox.position.z = followingCam.position.z;
        seklysCamBox.rotation.set(Math.PI/2 + followingCam.rotation.x, followingCam.rotation.z, 0); 
    }
}


function createLine() {
    var material = new THREE.LineBasicMaterial({ color: 0x000000 });

    var geometry = new THREE.Geometry();

    var rot = dollyCam.rotation;
    var camPos = dollyCam.position;
    var lenght = Math.sqrt(camPos.x *  camPos.x + camPos.y * camPos.y + camPos.z *camPos.z)/2;
    
    geometry.vertices.push(dollyCam.position);
    geometry.vertices.push(new THREE.Vector3( -Math.sin(rot.y -  controls.fov/360*Math.PI   ) * lenght, Math.cos(rot.y -  controls.fov/360*Math.PI   ) * lenght, 200));
    geometry.vertices.push(dollyCam.position);
    geometry.vertices.push(new THREE.Vector3( -Math.sin( rot.y +  controls.fov/360*Math.PI  ) * lenght, Math.cos( rot.y +  controls.fov/360*Math.PI  ) * lenght, 200));
    
    geometry.vertices.push(dollyCam.position);
    geometry.vertices.push(new THREE.Vector3( -Math.sin(rot.y -  controls.fov/360*Math.PI   ) * lenght, Math.cos(rot.y -  controls.fov/360*Math.PI   ) * lenght, -200));
    geometry.vertices.push(dollyCam.position);
    geometry.vertices.push(new THREE.Vector3( -Math.sin( rot.y +  controls.fov/360*Math.PI  ) * lenght, Math.cos( rot.y +  controls.fov/360*Math.PI  ) * lenght, -200));
    
    geometry.vertices.push(new THREE.Vector3( -Math.sin(rot.y -  controls.fov/360*Math.PI   ) * lenght, Math.cos(rot.y -  controls.fov/360*Math.PI   ) * lenght, -200));
    geometry.vertices.push(new THREE.Vector3( -Math.sin(rot.y -  controls.fov/360*Math.PI   ) * lenght, Math.cos(rot.y -  controls.fov/360*Math.PI   ) * lenght, 200));
    geometry.vertices.push(new THREE.Vector3( -Math.sin( rot.y +  controls.fov/360*Math.PI  ) * lenght, Math.cos( rot.y +  controls.fov/360*Math.PI  ) * lenght, 200));
        
    geometry.vertices.push(new THREE.Vector3( -Math.sin( rot.y +  controls.fov/360*Math.PI  ) * lenght, Math.cos( rot.y +  controls.fov/360*Math.PI  ) * lenght, -200));
        
    scene.remove(line);
    line = new THREE.Line(geometry, material);
    scene.add(line);
}