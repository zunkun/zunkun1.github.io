/* eslint-disable node/no-unsupported-features/node-builtins */
function fromNow(time) {
    // 支持传入10位或13位毫秒数，如 1587367194536,"1587367194"
    // 支持传入日期格式，如 "2020/4/20 15:31:18"

    if (typeof time === 'number' || Number(time) === time) {
        if (String(time).length === 10) {
            time = Number(time) * 1000;
        } else if (String(time).length === 13) {
            time = Number(time);
        } else {
            console.log('时间格式错误');
            return time;
        }
    } else {
        if (typeof time === 'string' && time.split(' ').length === 2 && time.split(/[- : \/]/).length === 6) {
            time = new Date(time.replace(/\-/g, '/')).getTime();
        } else {
            console.log('时间格式错误');
            return time;
        }
    }
    // 处理之后的time为13位数字格式的毫秒数

    const date_now = new Date();
    const date_time = new Date(time);
    const distance = date_now.getTime() - time;

    const days = parseInt(distance / (1000 * 60 * 60 * 24), 10);
    if (days === 1) {
        return '昨天';
    } else if (days > 1 && days < 4) {
        return days + '天前';
    } else if (days > 3) {
        // 超过3天的，返回日期，如 2018-12-05
        // 如果是今年的，就省去年份，返回 12-05
        const year = date_time.getFullYear();
        let month = date_time.getMonth() + 1;
        const _month = month;
        if (month < 10) {
            month = '0' + month;
        }
        let day = date_time.getDate();
        const _day = day;
        if (day < 10) {
            day = '0' + day;
        }
        if (date_now.getFullYear() === year) {
            return `${_month}月${_day}日`;
        }
        return `${year}${month}月${day}日`;

    }

    const hours = parseInt((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10);
    if (hours > 0) {
        return hours + '小时前';
    }

    const minutes = parseInt((distance % (1000 * 60 * 60)) / (1000 * 60), 10);
    if (minutes > 0) {
        return minutes + '分钟前';
    }

    return '刚刚';
}


(function($, ClipboardJS, config) {
    $('.article img:not(".not-gallery-item")').each(function() {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<p class="has-text-centered is-size-6 caption">' + this.alt + '</p>');
            }
        }
    });

    if (typeof $.fn.lightGallery === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
    if (typeof $.fn.justifiedGallery === 'function') {
        if ($('.justified-gallery > p > .gallery-item').length) {
            $('.justified-gallery > p > .gallery-item').unwrap();
        }
        $('.justified-gallery').justifiedGallery();
    }

    $('.article-meta time').each(function() {
        let datetime = $(this).attr('datetime');
        datetime = new Date(datetime).getTime();
        $(this).text(fromNow(datetime));
    });

    $('.article > .content > table').each(function() {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('justify-content-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('justify-content-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    function toggleFold(codeBlock, isFolded) {
        const $toggle = $(codeBlock).find('.fold i');
        !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
        !isFolded ? $toggle.removeClass('fa-angle-right') : $toggle.removeClass('fa-angle-down');
        !isFolded ? $toggle.addClass('fa-angle-down') : $toggle.addClass('fa-angle-right');
    }

    function createFoldButton(fold) {
        return '<span class="fold">' + (fold === 'unfolded' ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>') + '</span>';
    }

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof config !== 'undefined'
        && typeof config.article !== 'undefined'
        && typeof config.article.highlight !== 'undefined') {

        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function() {
            const classes = $(this).attr('class').split(/\s+/);
            if (classes.length === 1) {
                $(this).addClass('hljs-' + classes[0]);
                $(this).removeClass(classes[0]);
            }
        });


        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();

        $('figure.highlight').each(function() {
            if ($(this).find('figcaption').length) {
                $(this).find('figcaption').addClass('level is-mobile');
                $(this).find('figcaption').append('<div class="level-left">');
                $(this).find('figcaption').append('<div class="level-right">');
                $(this).find('figcaption div.level-left').append($(this).find('figcaption').find('span'));
                $(this).find('figcaption div.level-right').append($(this).find('figcaption').find('a'));
            } else {
                if (clipboard || fold) {
                    $(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>');
                }
            }
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            $('figure.highlight').each(function() {
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                const button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="fas fa-copy"></i></a>';
                $(this).attr('id', id);
                $(this).find('figcaption div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
        }

        if (fold) {
            $('figure.highlight').each(function() {
                if ($(this).find('figcaption').find('span').length > 0) {
                    const span = $(this).find('figcaption').find('span');
                    if (span[0].innerText.indexOf('>folded') > -1) {
                        span[0].innerText = span[0].innerText.replace('>folded', '');
                        $(this).find('figcaption div.level-left').prepend(createFoldButton('folded'));
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('figcaption div.level-left').prepend(createFoldButton(fold));
                toggleFold(this, fold === 'folded');
            });

            $('figure.highlight figcaption .fold').click(function() {
                const $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }

    const $toc = $('#toc');
    if ($toc.length > 0) {
        const $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() { // eslint-disable-line no-inner-declarations
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }
}(jQuery, window.ClipboardJS, window.IcarusThemeSettings));
