/** 2018/6/16
 *作者:newbee
 *视频截图
 */

//文件准备就绪
$(function () {
    var imgHeight = 0,
        imgWidth = 0,
        videoWidth = 0,
        videoHeight = 0,
        //画布
        canvas = null,
        //画布上下文
        canvasCtx = null,
        //要截图的视频
        video = null;


    /**
     * 准备好视频和画布
     */
    function init() {
        addVideo();
        canvas = document.createElement("canvas");
        canvasCtx = canvas.getContext("2d");

        //视频准备好可以播放
        video.addEventListener("canplay", function () {
            //获取展示的video宽高作为画布的宽高和临时视频截图的宽高
            canvas.width = imgWidth = video.offsetWidth;
            canvas.height = imgHeight = video.offsetHeight;
            //获取实际视频的宽高，相当于视频分辨率吧
            videoWidth = video.videoWidth;
            videoHeight = video.videoHeight;
            $("#shotBar").click(click2shot);
            //防止拖动进度条的时候重复触发
            video.removeEventListener("canplay", arguments.callee);
        });
    }

    /**
     * 创建临时图片，设置动画效果
     */
    function click2shot() {
        video.pause();
        //坐原图像的x,y轴坐标，大小，目标图像的x，y轴标，大小。
        canvasCtx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, imgWidth, imgHeight);
        //把图标base64编码后变成一段url字符串
        var dataUrl = canvas.toDataURL("image/png");

        //创建一个和video相同位置的图片
        var $imgBig = $("<img/>");

        $imgBig.css({
            position: "absolute",
            left: video.offsetLeft,
            top: video.offsetTop,
            width: imgWidth + "px",
            height: imgHeight + "px"
        }).attr("src", dataUrl);
        $("body").append($imgBig);

        //创建缩略图，准备加到shotBar
        var $img = $(createImg(dataUrl));
        $(this).append($img);

        var offset = getOffset($img[0]);
        $img.hide();
        //添加动画效果
        $imgBig.animate({
            left: offset.x + "px",
            top: offset.y + "px",
            width: $img.width() + "px",
            height: $img.height() + "px"
        }, 500, function () {
            $img.show();
            $imgBig.remove();
            video.play();
        });
    }

    /**
     * 创建缩略图
     * @param dataUrl
     * @returns {DocumentFragment}
     */
    function createImg(dataUrl) {
        var div = document.createElement('div');
        div.id = 'imgShot';
        //获取缩略图模板
        div.innerHTML = document.querySelector('#imgFunTemplate').innerHTML;
        var ul = div.querySelector('ul');
        //显示图片操作选项
        div.addEventListener('mouseenter', function () {
            ul.style.transform = 'translateY(0)';
        });
        div.addEventListener('mouseleave', function () {
            ul.style.transform = 'translateY(-100%)';
        });
        //添加缩略图的相关操作
        div.querySelector('ul').addEventListener('click', function (e) {
            if (e.target === div.querySelector('li')) {
                //创建下载链接并且下载
                var $a = $('<a>');
                $a.attr({href: dataUrl, download: 'shortImg'});
                $a.css({display: 'none'});
                //防止冒泡
                $a.on('click', function (e) {
                    e.stopPropagation();
                });
                $a[0].click();
                e.currentTarget.appendChild($a[0]);
            } else {
                //删除缩略图
                $(div).animate({
                    marginLeft: "-210px"
                }, 200, function () {
                    $(div).css({display: 'none'});
                });
            }
        });
        //防止图片点击冒泡或者捕获
        div.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        //添加图片地址
        $(div.querySelector('img')).attr("src", dataUrl);
        return div;
    }

    /**
     * 获取元素在显示区域的leftOffset和topOffset
     * @param elem - 原生元素
     * @returns {{x: (Number|number), y: (Number|number)}}
     * @private
     */
    function getOffset(elem) {
        var pos = {x: elem.offsetLeft, y: elem.offsetTop};
        var offsetParent = elem.offsetParent;
        while (offsetParent) {
            pos.x += offsetParent.offsetLeft;
            pos.y += offsetParent.offsetTop;
            offsetParent = offsetParent.offsetParent;
        }
        return pos;
    }

    /**
     * 添加视频
     */
    function addVideo() {
        //创建一个video对象
        var $addVideo = $('.addVideo');
        video = document.createElement("video");
        $(video).css({width: '100%', height: '100%', position: 'absolut'}).attr('controls', 'controls');

        //拖放的形式添加视频
        $addVideo[0].ondragover = function (e) {
            e.preventDefault();
        };
        $addVideo[0].ondragenter = function (e) {
            e.preventDefault();
        };
        $addVideo[0].ondrop = function (e) {
            showVideo($(this), e.dataTransfer.files[0]);
            e.preventDefault();
        };

        //选择的形式添加视频
        $addVideo.click(function () {
            $('input[type="file"]').on('change', function (e) {
                showVideo($(this.parentNode), this.files[0]);
            }).click(function (e) {
                e.stopPropagation();
            }).click();
        });

        /**
         * 展示视频删除其他无关控件
         * @param container
         * @param file
         */
        function showVideo(container, file) {
            container.empty().append(video);
            video.src = window.URL.createObjectURL(file)
        }
    }
    init();
});