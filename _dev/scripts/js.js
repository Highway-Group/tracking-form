let  baseurl = (typeof BASEURL !== 'undefined') ? BASEURL : '/';
let  currentUrl = (typeof CURRENTURL !== 'undefined') ? CURRENTURL : '/';
let  BREAKPOINT_XS = 0;
let  BREAKPOINT_SM = 768;
let  BREAKPOINT_MD = 992;
let  BREAKPOINT_LG = 1200;
let  BREAKPOINT_XL = 1330; 
const tabsBtns = document.querySelectorAll('.btn_tab_js');
const tabsContent = document.querySelectorAll('.tabs__content');
let btnCallJs = document.querySelectorAll('.call-js:not(.readonly):not(select):not([disabled])');
let inputMask = document.querySelectorAll('.mask_js');


let  IS_MOBILE = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 'ontouchstart' in document.documentElement) {
    IS_MOBILE = true;
}

let  iphone = false;
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    iphone = true;
}

document.addEventListener('DOMContentLoaded', function() {
    callJs();
    maskInit();

    tabsBtns.forEach(btn => btn.addEventListener('click', function(event) {
        // табы для калькулятора
        if(btn.closest('.tabs')){
            changeTabs(event);
        }
    }));
});


function getOption(el, option, params) {
    if (option == null) {
        option = el.getAttribute('data-option');
    }

    try {
        if (params == null) {
            params = recordParamsData(el) || {};
        }

        console.log(params); 

        switch (option) {
            case 'getContainerJs':  
                if(params.container && params.sources){
                    let sources  = document.querySelector(params.sources);
 
                    if(sources){
                        let html = sources.cloneNode(true); //клонируем исходный блок
                        let container = el.closest(params.container);
                        container.append(html);
     
                        let last_item = document.querySelector(params.container + ' ' + params.sources); //нашли вставленный блок
                        if(last_item){ 
                            // удаляем класс исходного блока с вставленного блока
                            last_item.classList.remove(params.sources.replace('.',''));
                        }

                        if (params.item && params.key_text) {
                            let items = document.querySelectorAll(params.item+':not('+params.sources+')');
                            keyItem(items, params.key_text);
                        }
                    }
                }
                break;
    
            case 'removeItem':
                let form = false;

                if(el.closest('form')){
                    form = el.closest('form');
                }

                if (params.container) {
                    container = el.closest(params.container);
                }

                if(params.last == 'true' && params.container){
                    let count = document.querySelectorAll(params.container + ' ' + params.block_remove).length;

                    if (count > 1) {
                        el.closest(params.block_remove).remove();
                    } else {
                        // $.fn.systemMessage({
                        //     title: 'Предупреждение!',
                        //     text: 'Невозможно удалить последний элемент',
                        //     type: 'warning'
                        // });
                    }

                    if (params.key_text) {
                        let items = document.querySelectorAll(params.block_remove+':not('+params.sources+')');
                        keyItem(items, params.key_text);
                    }
                }else{
                    el.closest(params.block_remove).remove();
                }
                break;
    
            default:
                break;
        }
    } catch (error) {
        console.log('error getOption');
    }finally{
        callJs();
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

    switch(event.type){
        case 'click':
            tabsBtns.forEach((tab, i) => {
                tab.classList.remove('active');
                tabsContent[i].classList.remove('active');
            });
        
            tabsBtns[tabId - 1].classList.add('active');
            tabsContent[tabId - 1].classList.add('active');
            break;
    }
}

let callJsOption = function(e) {
    e.preventDefault();
    var name = this.getAttribute('data-option');
    getOption(this, name);
}; 

function callJs(){
    btnCallJs.forEach(el => el.removeEventListener('click', callJsOption, false)); //удаляем событие 
    btnCallJs = document.querySelectorAll('.call-js:not(.readonly):not(select):not([disabled])'); // получаем актуальный набор 
    btnCallJs.forEach(el => el.addEventListener('click', callJsOption));  // добавляем событие
}



let maskInitStart = function(e) {
    e.preventDefault();
    let type = this.getAttribute('data-mask');

    switch (type) {
        case 'phone':
            IMask(this,{
                mask: '+{7}(000)000-00-00',
                lazy: false,
            });
            break;

        case 'int':
            IMask(this,{
                mask: Number
            });
            break;

        case 'date':
            IMask(this,{
                mask: Date,
                lazy: false,
            });
            break;

        case 'float':
            IMask(this,{
                mask: Number,
                radix: ',',
            });
            break;
    }
};

function maskInit(){
    // inputMask.forEach(el => el.removeEventListener('focus', maskInitStart, false)); 
    // inputMask.forEach(el => el.removeEventListener('focusout', maskInitStart, false)); 
    inputMask = document.querySelectorAll('.mask_js'); 
    inputMask.forEach(el => el.addEventListener('focus', maskInitStart)); 
}; 

function keyItem(items,key_text){
    if (items && key_text) {
        //расставляем номер 
        for (var i = 0; i < items.length; i++) {
            let item = items[i].querySelector(key_text);
            item.innerHTML = i + 1;
        }
    }
}

