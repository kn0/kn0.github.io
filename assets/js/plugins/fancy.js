var Stars = function()
{
    var me = this;
    var canEle = document.getElementById('can');
    var can    = canEle.getContext('2d');
    var height = 0;
    var width  = 0;

    var mdDefault = 150;
    var mdHover   = 500;
    var mdDec     = true;

    var max           = 50;
    var distance      = 100;
    var mouseDistance = mdDefault;

    var stars    = new Array(max);
    var mouse    = {
        x : width / 2,
        y : height / 2
    };

    var defaultRed   = 255;
    var defaultGreen = 255;
    var defaultBlue  = 255;

    var red   = defaultRed;
    var green = defaultGreen;
    var blue  = defaultBlue;

    var targetRed   = red;
    var targetGreen = green;
    var targetBlue  = blue;

    var speedDefault = 1;
    var speedHover   = 5;
    var speed        = speedDefault;

    var maxTime = 0;
    var minTime = 1000;

    var moving   = false;
    var lastTime = new Date();

    var arcCache = {};

    me.start = function()
    {
        if (navigator.appVersion.match('Chrome')) {
            max = 300;
        }

        resize();
        createStars();
        //setInterval(run, 1000 / 30);
        run();

        document.onmousemove = mousemove;

        $('.site-logo').hover(function() {
            //moving        = true;
            mdDec         = false;
            speed         = speedHover;
            var color = c = $(this).children().eq(0).data('color');

            if (!color) {
                targetRed   = defaultRed;
                targetGreen = defaultGreen;
                targetBlue  = defaultBlue;
            } else {
                targetRed   = color.red;
                targetGreen = color.green;
                targetBlue  = color.blue;
            }
        }, function() {
            moving        = false;
            mdDec         = true;
            speed         = speedDefault;
            targetRed     = defaultRed;
            targetGreen   = defaultGreen;
            targetBlue    = defaultBlue;
        });
    };

    var mousemove = function(e)
    {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    };

    var run = function()
    {
        clean();
        drawStars();
    };

    var drawStars = function()
    {
        for (var i = 0; i < max; i++) {
            stars[i].connected = [];
        }

        var time = new Date();

        setColors();
        can.lineWidth   = 1;
        var dist        = 0.0;

        if (mdDec && mouseDistance > mdDefault) {
            mouseDistance -= 80;
        } else if (!mdDec && mouseDistance < mdHover) {
            mouseDistance += 80;
        }

        for (var i = 0; i < max; i++) {
            if (!moving) {
                moveStar(stars[i]);
            }

            var star = stars[i];

            dist     = Math.sqrt(Math.pow(star.x - mouse.x, 2) + Math.pow(star.y - mouse.y, 2));

            if (dist < mouseDistance * 2) {
                can.fillStyle   = 'rgb('.concat(red, ',', green, ',',  blue, ')');
            } else {
                can.fillStyle   = 'rgba('.concat(red, ',', green, ',',  blue, ', 0.3)');
            }

            can.fillRect(star.x, star.y, star.size / 2, star.size);

            can.beginPath();
            if (dist < mouseDistance) {
                star.arc = true;

                for (var j = 0; j < max; j++) {
                    var refStar = stars[j];

                    if (star == refStar || refStar.connected.indexOf(star) != -1) {
                        continue;
                    }

                    if (
                        Math.abs(star.x - refStar.x) < distance &&
                        Math.abs(star.y - refStar.y) < distance
                    ) {
                        star.connected.push(refStar);
                        drawRelation(star, refStar);
                    }
                }
            } else {
                star.arc = false;
            }

            can.stroke();
            can.closePath();
        }



        for (var i = 0; i < max; i++) {
            if (stars[i].arc) {
                arc(stars[i]);
            }
        }

        var nDate = new Date();
        var time  = nDate.getTime() - time.getTime();

        if (time > maxTime) {
            maxTime = time;
        }

        if (time < minTime) {
            minTime = time;
        }

        lastTime = new Date();

        setTimeout(run, (1000 / 30) - time);
    };

    var arc = function(star)
    {
        var r = star.size * 2;
        can.drawImage(star.cache, star.x - r, star.y - r, r * 2, r * 2);
    }

    var setColors = function()
    {
        var percent = 10;

        if (targetRed != red) {
            var tick = Math.floor(Math.abs(targetRed - red) / percent);

            if (targetRed > red) {
                red += tick;
            } else {
                red -= tick;
            }
        }
        if (targetGreen != green) {
            var tick = Math.floor(Math.abs(targetGreen - green) / percent);

            if (targetGreen > green) {
                green += tick;
            } else {
                green -= tick;
            }
        }
        if (targetBlue != blue) {
            var tick = Math.floor(Math.abs(targetBlue - blue) / percent);

            if (targetBlue > blue) {
                blue += tick;
            } else {
                blue -= tick;
            }
        }

        can.fillStyle   = 'rgb('.concat(red, ',', green, ',',  blue, ')');
        can.strokeStyle = 'rgba('.concat(red, ',', green, ',',  blue, ', 0.3)');
    }

    var drawRelation = function(star, refStar)
    {
        can.moveTo(star.x | 0, star.y | 0);

        if (true) {
            can.lineTo(refStar.x | 0, refStar.y | 0);
            return;
        } else {
            var midX = Math.max(star.x, refStar.x) - (Math.max(star.x, refStar.x) - Math.min(star.x, refStar.x)) / 2;
            var midY = Math.max(star.y, refStar.y) - (Math.max(star.y, refStar.y) - Math.min(star.y, refStar.y)) / 2;

            if (star.curve > 0) {
                midX += 20;
                midY += 20;
            } else {
                midX -= 20;
                midY -= 20;
            }
        }
    };

    var moveStar = function(star)
    {
        star.x += star.dirX * speed;
        star.y += star.dirY * speed;

        if (star.y > height) {
            star.dirY = Math.random() * -1;
        } else if (star.y < 0) {
            star.dirY = Math.random();
        } else if (star.x > width) {
            star.dirX = Math.random() * -1;
        } else if (star.x < 0) {
            star.dirX = Math.random();
        }

        return star;
    };

    var clean = function()
    {
        can.fillStyle = 'rgb(0, 0, 0)';
        can.fillRect(0, 0, width, height);
    };

    var createStars = function()
    {
        for (var i = 0; i < max; i++) {
           stars[i] = createStar();
        }
    };

    var createStar = function()
    {
        var star = {
            x     : Math.random() * width,
            y     : Math.random() * height,
            dirX  : (Math.random() - 0.5),
            dirY  : (Math.random() - 0.5),
            size  : Math.ceil(Math.random() * 3),
            curve : (Math.random() - 0.5),
            line  : (Math.random() - 0.5),
            arc   : false
        };

        initCache(star);

        return star;
    };

    var initCache = function(star)
    {
        var cache = $(document.createElement('canvas'));
        var c     = cache.get(0).getContext('2d');
        var r     = star.size * 4;

        cache.attr({
            width  : star.size * 8,
            Height : star.size * 8
        });

        c.fillStyle = 'rgba(200, 200, 200, 0.5)';
        c.beginPath();
        c.arc(r, r, r, 0, 2*Math.PI);
        c.fill();

        star.cache = cache.get(0);
    }

    var resize = function()
    {
        height = canEle.parentElement.offsetHeight - 10;
        width  = canEle.parentElement.offsetWidth - 10;
        canEle.style.width  = ''.concat(width, 'px');
        canEle.style.height = ''.concat(height, 'px');
        canEle.setAttribute('width', width);
        canEle.setAttribute('height', height);
    }
};

