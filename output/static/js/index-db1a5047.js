(function($, window) {
    var queryObj = queryString.parse(location.search);
    var imgId = queryObj['imageId'];

    function getRemoteData(id, callback) {

        $.ajax({
            url: 'http://tplus.api.591ku.com/share/view',
            dataType: 'jsonp',
            data: {
                imageId: id
            },
            success: function(rs, succ) {
                if (rs['code'] != 20000) {
                    $('#columns').html($('h2').text('用户已删除'));
                    return;
                }
                updateHTML(rs.resp);
                callback(rs.resp);
            },
            error: function(e, err) {

            }
        });
    };

    function updateHTML(data) {
        var arr = data['images'];
        $('.time').html(data['time']);
        $('.user').attr('src', data['user']['headUrl']);
        $('.name').text(data['user']['nickname']);
        $('h2.title, .info').text(data['time']);
        $('.head-img').attr('src', data['image']['url']);

        for (var i = 0; i < arr.length; i++) {
            $('.col-content').eq(i % 2).append(
                $('<img class="preview" />', {
                    src: arr[i]['thumb']['url']
                })
            );
        };

        if(data['links']) {
            var links = data['links'];
            for(var i =0; i<links.length;i++) {
                $('#footer .tags').append($('<a target="_blank">', {
                    href:  links[i]['url'],
                    text: '#' + links[i]['name']
                }));
            }
        }

    };

    function nextTick (handler, sec) {
        setTimeout(function() {
            handler();
        }, sec||0);
    };
    function bindEvents() {
        $('body').on('click', '.preview', function(e) {
            var url = $(e.target).attr('src');
            if (!window.myScroll) {
                initIScroll($('#scroller')[0], window._const_remote_data['images']);
            }
            var images = window.myScroll.options.images;
            for(var i = 0; images.length > i ; i++) {
                if (images[i]['src'] == url) {
                    break;
                }
            }
            var index = i;
            window.myScroll.show();
            window.myScroll.setCur(index);
            $(window).trigger('resize');
            nextTick(function() {
                window.myScroll.scroll.currentPage.pageX = index;
                window.myScroll.scroll.refresh();
            },0);
        });
        // no double click
        $(document).on('click', '#wrapper', function() {
            clearTimeout(window._pid);

            if (!window.isDoubleClick) {
                window.isDoubleClick = 1;
                // console.log(isDoubleClick, '11');
                // $('.ui-header').html(isDoubleClick +'-' + + new Date + ' ');
            } else {
                window.isDoubleClick ++;
                // console.log(isDoubleClick, '22');
                // $('.ui-header').html(isDoubleClick +'-' + + new Date + ' ');
            }

            window._pid = setTimeout(function() {
                delete window.isDoubleClick;
            }, 800);
            if (window.isDoubleClick >= 2) {
                delete window.isDoubleClick;
                if(!window.isChromeVisible ) {
                    $('.ui-header, .ui-footer').hide();
                    window.isChromeVisible = true;
                } else {
                    $('.ui-header, .ui-footer').show();
                    window.isChromeVisible = false;
                }
            }
        });

        $('.btn-home').click(function(e) {
            window.myScroll.hide();
        });

        $('body').on('click', '.application', function(e) {
            if(_NA_['isWeixin']) {
                window.location = _NA_['TencentStore'];
            } else {
                if (_NA_['isAndroid']) {
                    window.location = _NA_['Android'];
                } else if (_NA_['isIOS']) {
                    alert('T语言 IOS 即将发布，敬请期待!');
                    return;//ios上线后，删除本行
                    window.location = _NA_['IOS'];
                }
            }
            nextTick(function() {
                window.scrollTo(0, 1);
            }, 50);
            return false;
        })
    };

    function APPScroll(el, options) {
        this.options = options;
        this.el = el;

        this.init();
    };

    function ApllyFastClick() {
        FastClick.attach(document.body);
    }

    APPScroll.prototype.setCur = function(index) {
        $('.page-nav').text((index + 1) + '/' + this.options.images.length);
    };

    APPScroll.prototype.setImages = function(images) {
        var $wrap = $(this.scroll.wrapper).find('#wrapper');
        var len = images.length;
        $wrap.css('width', len * window.innerWidth + 'px');

        for (var i = 0; i < len; i++) {
            var img = images[i];

            var imgStyle = 'width: auto; height: 100%';
            if(img['width'] / img['height'] > window.innerWidth / window.innerHeight) {
                imgStyle = 'width: 100%; height: audo';
            }
            $wrap.append('<div class="slide" style="width: ' + window.innerWidth + 'px;"> <div class="box"> <img src="' + img['src'] + '"  style=" ' + imgStyle + '" alt="小图" ／> </div> </div>');
        }
        $(window).on('resize', function() {
            $wrap.css('width', len * window.innerWidth + 'px');
            $wrap.find('.slide').css('width', window.innerWidth + 'px');
        });
    };

    APPScroll.prototype.init = function() {
        this.scroll = new IScroll(this.el, {
            scrollX: true,
            scrollY: true,
            momentum: false,
            snap: true,
            snapSpeed: 600,
            keyBindings: false
        });
        var _self = this;
        this.scroll.on('scrollEnd', function(e) {
            var index = this.currentPage['pageX'] || 0;
            _self.setCur(index);
        });
        this.setImages(this.options.images);
    };

    APPScroll.prototype.show = function() {
        $('.ui-scroll').show();
    };
    APPScroll.prototype.hide = function() {
        $('.ui-scroll').hide();
    };

    function initIScroll(el, images) {
        window.myScroll = new APPScroll(el, {
            images: images
        });

    };
    WeixinApi.ready(function(Api) {
        // 分享的回调
        window._NA_.isWeixin = true;
        var wxCallbacks = {
            // 分享操作开始之前
            ready: function() {
                // 你可以在这里对分享的数据进行重组
                // alert("准备分享");
            },
            // 分享被用户自动取消
            cancel: function(resp) {
                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
                // alert("分享被取消");
            },
            // 分享失败了
            fail: function(resp) {
                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
                // alert("分享失败");
            },
            // 分享成功
            confirm: function(resp) {
                // 分享成功了，我们是不是可以做一些分享统计呢？
                //window.location.href='http://192.168.1.128:8080/wwyj/test.html';
                // alert("分享成功");
            },
            // 整个分享过程结束
            all: function(resp) {
                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
                // alert("分享结束");
            }
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        Api.shareToFriend(window.weixinData, wxCallbacks);

        // 点击分享到朋友圈，会执行下面这个代码
        Api.shareToTimeline(window.weixinData, wxCallbacks);

        // 点击分享到腾讯微博，会执行下面这个代码
        Api.shareToWeibo(weixinData, wxCallbacks);
    });

    var fixed = document.getElementById('tu-app');
    return {
        init: function() {
            getRemoteData(imgId, function(data) {
                window._const_remote_data = {};
                var list = data['images'];
                var images = $(list).map(function(index, item) {
                    var size = (item['size'] || '100*100').split('*');
                    return {src: item['url'], width: ~~size[0], height: ~~size[1]};
                });
                window._const_remote_data = {
                    images: images
                };
                window.weixinData['title'] = data['user']['nickname'] + window.weixinData['title'];
                window.weixinData['desc'] = data['atlas']['title'];

                window.weixinData['imgUrl'] = data['image']['url'];

                document.title =  window.weixinData['title'] + '\n' + window.weixinData['desc'];
                $('title').text(window.weixinData['title'] + '\n' + window.weixinData['desc'])
            });
            ApllyFastClick();
            bindEvents();

            nextTick(function() {
                window.scrollTo(0, 100);
            });
        }
    }
}(Zepto || jQuery, window, undefined)).init();