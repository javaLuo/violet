/** 全局函数 **/
var width = 1;      // 全局 - 窗口宽度
var height = 1;     // 全局 - 窗口高度
var windowPie = 1;  // 全局 - 当前工作区宽高比
var canvas = document.getElementById('canvas1');    // 全局 - 主canvas
var ctx = canvas.getContext('2d');                  // 全局 - 主ctx画笔
var stars = [];     // 全局 - 所有的星星
var met = {};       // 全局 - 一颗流星

var imgs = {        // 全局 - 所有需异步加载的图片资源
    starback: { url: 'assets/img/star-back1.jpg', dom: null, width: 1, height: 1, pie: 1},   // url图片URL，图片DOM，图片宽，图片高，图片宽高比
    all: 1,
    down: 0
};
var audio1 = document.getElementById('audio1');
var volumeTimer = null; // 音量timer

/** letter页全局函数 **/
var dom_rotate = [0,0]; // 当前旋转角
var $dom = $("#letter");
var $letterInfo = $("#letter-info");
var stop = false;   // 是否停止自旋转
var scoler = 1; // 缩放比例
var rotateTimer = null; // 旋转timer
var hammerTest = null;

$(function(){
    /** 开始执行loading，等待所有的图片加载完成 **/
    onInit();
});

/**
 * 初始化相关
 * **/

/** 初始化加载 **/
 function onInit() {
    initEvents();   // 初始化各种绑定事件
    loadImg(imgs.starback, loadDown);  // 加载图片
    initStart(2000);    // 创建星星对象
    initMet();          // 初始化流星参数
}

/** 各种事件初始化 **/
function initEvents() {
    /** 窗口大小改变时触发 **/
    $(window).on('resize', function(){
        height = this.innerHeight;
        width = this.innerWidth;
        canvas.width = width;
        canvas.height = height;
        windowPie = width/height;
        initStart(2000);
    }).resize();

    /** 信窗口相关事件 **/
    hammerTest = new Hammer(document.getElementById('letter-page'));
    hammerTest.get('pan').set({ direction: Hammer.DIRECTION_ALL }); // 开启所有方向的检测

    hammerTest.on('pan panmove swipe swipeup press pressup', function(e) {
        switch (e.type) {
            case "pan":
                onPan(e);
        }
    });

    $('#letter-page').on('mousedown touchstart', function() {
        clearInterval(rotateTimer);
    }).on('mouseup touchend', function() {
        clearInterval(rotateTimer);
        rotateTimer = window.setInterval(autoRotate, 50);
    }).on('mousewheel', function(event, delta) {	// 滚轮滚动
        scoler+=delta*0.1;
        if(scoler>1.5){
            scoler = 1.5;
            return;
        }else if(scoler<0.5){
            scoler = 0.5;
        }
        $('#z').css({"transform":"scale("+ scoler +")"});
    });

    /** 菜单点击事件 **/
    $('#to_letter-page').on('click', function(){
       $(".pages[id!=letter-page]").fadeOut(300);
       $("#letter-page").fadeIn(300);
       $("#close").addClass('show');
       clearInterval(rotateTimer);
        rotateTimer = window.setInterval(autoRotate, 50);
    });
    $("#to_person-page").on('click', function(){
        clearInterval(rotateTimer);
        $(".pages[id!=person-page]").fadeOut(300);
        $("#person-page").fadeIn(300);
        $("#close").addClass('show');
    });
    $("#to_copyright-page").on('click', function(){
        clearInterval(rotateTimer);
        $(".pages[id!=copyright-page]").fadeOut(300);
        $("#copyright-page").fadeIn(300);
        $("#close").addClass('show');
    });
    $('#menu-music').on('click', function(){
        if($('#music-info').data('music') === 'close') {
            $('#menu-music').addClass('open');
            $('#music-info').data('music','open').text('播放中');
            onMp3Play();
        } else {
            $('#menu-music').removeClass('open');
            $('#music-info').data('music','close').text('已关闭');
            onMp3Pause();
        }
    });
    /** close按钮事件 **/
    $("#close").on('click', function(){
        clearInterval(rotateTimer);
        $(".pages").fadeOut(300);
        $("#close").removeClass('show');
    });
}

 // 工具 - 加载一张图片
 function loadImg(item, callback) {
    var img = document.createElement("img");
    img.onload = function(){
       item.dom = img;
       item.width = img.width;
       item.height = img.height;
       item.pie = img.width / img.height;
       callback();
    };
    img.onerror= function() {
        console.log('图片加载出错，请刷新页面');
    };
    img.src = item.url;
}

 // 加载完成一张图片
 function loadDown() {
    imgs.down++;
    if(imgs.all === imgs.down) { // 全部加载完成
        show();
    }
}

 // 页面初始化完毕，页面出现
 function show() {
    animate();
     $('#loading-info').addClass('hide');
     $('#loading-box').fadeOut(800);
     $('#menu').animate({opacity: 'show', left: 0}, 600);
     onMp3Play();
    setTimeout(function(){
        $('#logo-box').addClass('show');
    }, 600);
}

 /**
 * 主canvas相关
 * **/

// 初始化所有的星星对象
function initStart(num) {
    var grad = [];
    for(var k=0;k<11;k++) {
        for(var g=0;g<k;g++) {
            grad.push(k);
        }
    }
    var obj;
    if(stars.length) {
        var max = Math.sqrt(Math.pow(width,2) + Math.pow(height, 2));
        for(var j=0;j<stars.length;j++) {
            obj = setStar(j, num);
            stars[j].r = random(max*0.07*grad[Math.round(random(0,grad.length))], max);
            stars[j].a = random(0, 0.5);
            stars[j].m = 0;
            stars[j].f = Math.random() > 0.7;
            stars[j].o = random(0.6, 1);
            stars[j].s = obj.s;
            stars[j].w = obj.w;
        }
    } else {
        for(var i=0; i<num; i++) {
            var c = document.createElement('canvas');
            c.width = 50;
            c.height = 50;
            var c_ctx = c.getContext('2d');
            c_ctx.fillStyle = getColor();
            c_ctx.shadowColor = getColor();
            c_ctx.shadowBlur = 21;
            c_ctx.beginPath();
            c_ctx.arc(25,25,2,0, Math.PI * 2);
            c_ctx.fill();
            obj = setStar(i, num);
            var star = {
                pic: c,
                r: random(200, Math.sqrt(Math.pow(width,2) + Math.pow(height, 2))), // 星轨半径(圆心距离) Math.sqrt(Math.pow(width,2) + Math.pow(height, 2))
                a: random(0, 0.5),  // 起始弧度
                m: 0,   // 当前偏移弧度
                // color: getColor(),  // 星星的颜色
                f: Math.random() > 0.7, // 星星是否会闪烁
                o: random(0.6, 1),   // 星星当前的透明度
                s: obj.s,
                w: obj.w,
            };
            stars.push(star);
        }
    }
}

/** 设置星星的某些参数，因为有2个地方用到，所以把这部分提取出来了
 * @param i 当前处理的第几颗星星
 * @param num 总共有多少颗星星
 */
function setStar(i, num) {
    // 定义星星的运行速度s，星星本身的半径w
    const obj = {};
    if (i< num/9){
        obj.s = 0.000115;
        obj.w = random(20, 22);
    } else if (i< num/8) {
        obj.s = 0.00012;
        obj.w = random(22, 23);
    } else if (i< num/7) {
        obj.s = 0.000125;
        obj.w = random(23, 24);
    } else if (i< num/6) {
        obj.s = 0.00012;
        obj.w = random(24, 25);
    } else if (i<num/5){
        obj.s = 0.00013;
        obj.w = random(25, 26);
    } else if (i< num/4) {
        obj.s = 0.000135;
        obj.w = random(26, 27);
    } else if (i< num/3) {
        obj.s = 0.00014;
        obj.w = random(27, 28);
    } else if (i< num/2) {
        obj.s = 0.000145;
        obj.w = random(28, 29);
    } else{
        obj.s = 0.00015;
        obj.w = random(29, 30);
    }
    return obj;
}
/** 初始化流星对象 **/
var c = document.createElement('canvas');
c.width = 300;
c.height = 5;
var c_ctx = c.getContext('2d');
var g = c_ctx.createRadialGradient(100, 1, 0, 200, 1, 125);
g.addColorStop(0, 'rgb(255,255,255)');
g.addColorStop(0.2, 'rgb(220,220,255)');
g.addColorStop(0.9, "transparent");

c_ctx.fillStyle = g;

c_ctx.beginPath();
c_ctx.fillRect(0,0,300,3);
met.pic = c;    // 图片对象
function initMet() {
    var temp_x = random(width*.3, width); // random(width*.25, width*1);
    met.start = [temp_x, random(height*-.25, height)]; // 随机流星出现位置
    met.deg = random(-Math.PI/180*10, Math.PI/180*10); // random(-Math.PI/180 * 30, Math.PI/180 * 30);  // 旋转角度
    met.range = met.start[0] - random(width*.3, width*.8);    // 飞行距离
    met.leng = random(350, 500);    // 流星完全状态下有多长
    met.op = 0;     // 当前透明度
    met.pin = 0;  // 前100帧和后100帧, 0~1
    met.sx = -Math.cos(met.deg) * 0.02; // 每次在X上前进的距离
    met.sy = -Math.sin(met.deg) * 0.02; // 每次在Y上前进的距离
}
// 工具 - 获取随机颜色，少数星星可以有特殊颜色
function getColor() {
    return Math.random() < 0.8 ?
        "rgb(220,220,255)" :
        "rgb("+ Math.round(random(50, 255)) +", "+ Math.round(random(50, 255)) +", "+ Math.round(random(50, 255)) +")";
}

// 工具 - 获取范围随机数
function random(min, max) {
    return Math.random() * ( max - min ) + min;
}

// 绘制一帧
var tick = 0.5;
var meteor = false;
function drow() {
    ctx.drawImage(imgs.starback.dom, 0, 0, imgs.starback.pie > windowPie ? height * imgs.starback.pie : width, imgs.starback.pie > windowPie ? height : width * imgs.starback.pie);

    for(var i=0; i < stars.length; i++) {
        var t = stars[i];
        var now = t.a - t.m;
        ctx.fillStyle = t.color;

        ctx.save();
        ctx.globalAlpha = t.o;
        ctx.drawImage(t.pic, width - Math.sin(now * Math.PI) * t.r,  height - Math.cos(now * Math.PI) * t.r, t.w, t.w);
        ctx.restore();

        var rand = Math.random();

        // 画流星
        if (meteor) {
            if (met.start[0] > met.range) {
                if (met.pin < 0.8) {
                    met.pin+=0.00001;
                    ctx.op+=0.00001;
                }
                met.start[0]+=met.sx;
                met.start[1]+=met.sy;
            } else {
                if (met.pin > 0) {
                    met.pin-=0.00002;
                    ctx.op-=0.00002;
                } else {
                    meteor = false;
                    initMet();

                }
            }

           ctx.save();
           ctx.globalAlpha = ctx.op;
           ctx.translate(met.start[0], met.start[1]);
           ctx.rotate(met.deg);

            /**
             * @param pic 图片对象
             * @param x 画图起始点x
             * @param y 画图起始点y
             * @param w 图片宽
             * @param h 图片高
             */
            ctx.drawImage(met.pic, 0, 0, met.leng * met.pin, met.pin);
            ctx.restore();
        }

        // 有小概率出现流星
        if((!meteor) && rand>0.999999) {
            meteor = true;
        }
        // 需要闪烁的星星随机调整亮度
        if(t.f) {
            if (rand > 0.5 && t.o > 0.2) {
                t.o -= 0.1;
            } else if (rand < 0.5 && t.o < 1) {
                t.o += 0.1;
            }
        }
        // 旋转到边缘的星星重置位置
        if(now < 0) {
            t.m = t.a - 0.5;
        }
        t.m += t.s;
    }
}

// 动画函数
function animate() {
    drow();
    requestAnimationFrame(animate);
}

/**
 * letter页相关
 * **/
// 自动旋转
var rotate_v = 0.2;
function autoRotate() {
    if (dom_rotate[1] > 20) {
        rotate_v = -0.2;
    } else if (dom_rotate[1] < -20) {
        rotate_v = 0.2;
    }
    dom_rotate[1] += rotate_v;

    makeLetter();
}

// 处理移动
function onPan(e) {
    dom_rotate[0] -= e.deltaY/100;
    dom_rotate[1] += e.deltaX/100;
    if (dom_rotate[0]>15) {
        dom_rotate[0] = 15;
    } else if (dom_rotate[0]<-15) {
        dom_rotate[0] = -15;
    }

    makeLetter();

    if (dom_rotate[1] > 0) {
        $letterInfo.html('后来，我终于明白什么是爱，<br/>可惜你早已远去，消失在人海');
    } else {
        $letterInfo.html('我爱你.');
    }
}

// 根据当前参数设置信封的旋转状态
function makeLetter() {
    const pi = Math.PI / 180;
    const op = Math.abs(Math.sin(pi * (dom_rotate[1] + 90))) / 2;
    const x = - Math.sin(pi * dom_rotate[1]) * 90;
    const y = Math.sin(pi * dom_rotate[0]) * 90;

    $dom.css("transform", 'rotateX('+ dom_rotate[0] +'deg) rotateY(' + dom_rotate[1] + 'deg)');
    $dom.css("box-shadow", x + 'px ' + y + 'px ' + '100px rgba(100,100,100,' + op + ')');
}

/** 音频事件，开始播放 **/
function onMp3Play() {
    audio1.play();
    volumeUp();
}

/** 音频事件，暂停播放 **/
function onMp3Pause() {
    volumeDown();
}

/** 音频音量调大 **/
function volumeUp() {
    clearTimeout(this.volumeTimer);
    if (audio1.volume + 0.1 <= 1) {
        audio1.volume += 0.1;
        this.volumeTimer = setTimeout(volumeUp, 200);
    }
}
/** 音频音量调小 **/
function volumeDown() {
    clearTimeout(this.volumeTimer);
    if (audio1.volume - 0.1 >= 0) {
        audio1.volume -= 0.1;
        volumeTimer = setTimeout(volumeDown, 200);
    } else {
        audio1.pause();
    }
}