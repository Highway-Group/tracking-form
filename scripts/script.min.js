let  baseurl = (typeof BASEURL !== 'undefined') ? BASEURL : '/';
let  currentUrl = (typeof CURRENTURL !== 'undefined') ? CURRENTURL : '/';
let  BREAKPOINT_XS = 0;
let  BREAKPOINT_SM = 768;
let  BREAKPOINT_MD = 992;
let  BREAKPOINT_LG = 1200;
let  BREAKPOINT_XL = 1330; 

const tabsBtns = document.querySelectorAll('.btn_light');
const tabsContent = document.querySelectorAll('.tabs__content');

let  IS_MOBILE = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 'ontouchstart' in document.documentElement) {
    IS_MOBILE = true;
}

let  iphone = false;
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    iphone = true;
}
console.log('iphone = ' + iphone);


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.call-js:not(.readonly):not(select):not([disabled])').addEventListener('click', function(event) {
        var name = this.getAttribute('data-option');
        getOption(this, name);
    });

    // табы для калькулятора
    tabsBtns.forEach(btn => btn.addEventListener('click', changeTabs));
});


function getOption(that, option, params) {

    if (option == null) {
        option = that.attr('data-option');
    }

    console.log('Option ' + option + ' started...');

    try {
        console.log(params); 
        if (params == null) {
            params = recordParamsData(that) || {};
        }
    } catch (error) {
        console.log('error getOption');
    }

    switch (option) {

        case 'getContainerJs':
            console.log(params);
   
            if(params.container && params.sources){
                var html = document.querySelector(params.sources).firstElementChild;
                var container = that.closest(params.container);
                container.append(html);

                
                if (params.item && params.key_text) {

                    var items = document.querySelector(params.item);
                    console.log(items);

                    for (let i=0; i < items.childNodes.length; i++) {
                        console.log(items.childNodes[i]);
                        items.childNodes[i];
                    }

                    var i = 1;
                    items.each(function () {
                        var current_item = $(this);
                        $(params.key_text, current_item).text(i);
                        i++;
                    });
                }
            }
            break;

        default:
            break;
    }
}

function recordParamsData(that){ 
    try { 
        if(that){
            var options = {};
            var attr = that.attributes;
            for (key in attr) {
                var name = attr[key].name;
                var val = attr[key].nodeValue;

                if(name != undefined){
                    if (name.indexOf('data-') != -1) {
                        options[name.replace('data-', '')] = val;
                    }
                }
            }
            return options;
        }
    } catch (error) {
        console.log(error);
    } 
}


function changeTabs(event) {
    const tabId = event.target.dataset.tab;

    console.log(event);
    switch(event.type){
        case 'click':
            tabsBtns.forEach((tab, i) => {
            tab.classList.remove('active');
            tabsContent[i].classList.remove('active');
            })
        
            tabsBtns[tabId - 1].classList.add('active');
            tabsContent[tabId - 1].classList.add('active');
            break;
    }
}


