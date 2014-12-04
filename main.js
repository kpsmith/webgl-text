var scene, width, height, camera, renderer;
var fooData;
$(function() {
    
    var text = "";
    // var textMesh;

    function init() {
        scene = new THREE.Scene();
        width = window.innerWidth;
        height = window.innerHeight;
        camera = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000);
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1);
        document.body.appendChild(renderer.domElement);

        camera.position.z = 100;

        $("body").keypress(keyPressHandler);

        // camera.rotateZ( -0.1);
        // spinIt();

        render();
        
    }

    var rZDir = 1;
    var rZC = 0.001;
    var numRots = 0;

    function spinIt() {
        numRots += 1;
        if (numRots > 200) {
            numRots = 0;
            rZDir *= -1;
        }
        camera.rotateZ( rZDir * rZC);
        // camera.rotateX( rZDir * rZC);
        // camera.rotateY( rZDir * rZC);
        // textMesh.rotateX(0.1);
        // textMesh.rotateY(0.04);
        // textMesh.rotateZ(0.01);
        setTimeout(spinIt, 16);
    }

    function keyPressHandler(evt) {
        var character = String.fromCharCode(evt.charCode);
        text += character;
        drawText(text);
    }

    var spriteSize = 20;
    var xCoord = spriteSize / 2;
    var yCoord;

    function drawText(text) {
        var x = xCoord;
        if (yCoord === undefined) {
            yCoord = height - spriteSize;
        }
        xCoord += spriteSize / 2;
        // var y = height - spriteSize;
        // var y = yCoord;
        if (xCoord > width) {
            xCoord = spriteSize / 2;
            yCoord -= spriteSize;
        }
        addNewCharSprite(x, yCoord, text[text.length-1]);
    }

    function addNewCharSprite(x, y, character) {
        var texture = getLetterTexture(character);
        var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } );
        var sprite = new THREE.Sprite( material );
        sprite.position.x = x;
        sprite.position.y = y;
        sprite.scale.set(spriteSize, spriteSize, 1);
        scene.add( sprite );
    }


    
    function getLetterTexture(character) {
        var canvas, ctx;
        var size = 256;
        if ( canvas === undefined) {
            canvas = document.getElementById('textureCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
        }
        ctx.fillStyle = '#fff';
        ctx.font = '256px monospace';
        ctx.fillText(character, size / 4, size*3 / 4);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    var lastFrameTStamp = 0;
    var framesMillisSum = 0;
    var framesToAggregate = 10;
    var numFrames = 0;

    function doFPS() {
        numFrames += 1;
        var curFrameTStamp = Date.now();
        var tDiff = curFrameTStamp - lastFrameTStamp;
        lastFrameTStamp = curFrameTStamp;
        framesMillisSum += 1000 / tDiff;
        if (numFrames >= framesToAggregate) {
            $('.fps').text(parseInt(framesMillisSum / framesToAggregate, 10));
            numFrames = 0;
            framesMillisSum = 0;
        }
        lastFrameTStamp = curFrameTStamp;
    }
    function render() {
        doFPS();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
        // newCharIfLeft();
    }


    function newCharIfLeft() {
        if (fooData.length > 0) {
            var foo = fooData.shift();
            var x = foo.x + spriteSize / 2;
            var y = (height) - foo.y;
            addNewCharSprite(x, y, foo.c);
        }
    }

    var makeNewData = [];

    function runData(data) {
        var makeNewData = [];
        for (var key in data) {
            var curData = data[key];
            for (var i = 0; i < curData.t.length; i++) {
                var character = curData.t[i];
                var x = curData.x[i] + spriteSize / 2;
                var y = (height - spriteSize) - curData.y[i];
                makeNewData.push({
                    x:curData.x[i],
                    y:curData.y[i],
                    c:character
                });
            }
        }
        return makeNewData;
    }

    // kick off
    $.get('data.json', function(res) {
        fooData = runData(res);
        init();
    });
});
