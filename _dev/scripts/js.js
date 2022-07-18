let  baseurl = (typeof BASEURL !== 'undefined') ? BASEURL : '/';
let  currentUrl = (typeof CURRENTURL !== 'undefined') ? CURRENTURL : '/';
const url = 'https://crm.hl-group.ru/api';
const params_get_token = 'request=addLead&login=api_app@mail.ru&password=133api&not_get_token=true&token';
// const params_get_token = {
//     request:'addLead',
//     token:'',
//     login:'api_app@mail.ru', 
//     password:'133api',
//     not_get_token:true,
// };

const tabsBtns = document.querySelectorAll('.btn_tab_js');
const tabsContent = document.querySelectorAll('.tabs__content');
let btnCallJs = document.querySelectorAll('.call-js:not(.readonly):not(select):not([disabled])');
let inputMask = document.querySelectorAll('.mask_js');
let calcItem = document.querySelectorAll('.calculator .calc_item_js');
let calcInputForm1 = document.querySelectorAll('.calc_form1_js');
let mask_phone;
let systemModal = new bootstrap.Modal(document.getElementById('systemMessage'));
let ajaxForm = document.querySelectorAll('.ajax-form');

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
    choiseJs();
    calcForm1Event();
    ajaxFormSubmit();

    tabsBtns.forEach(btn => btn.addEventListener('click', function(event) {
        // табы для калькулятора
        if(btn.closest('.tabs')){
            changeTabs(event);
        }
    }));

    const calcInputForm2 = document.querySelectorAll('.calc_form2_js');
    calcInputForm2.forEach(input => input.addEventListener('input', function(event) {
        initCalc2();
    }));
});


function post(url, data) {
    return new Promise((succeed, fail) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.addEventListener("load", () => {
            if (xhr.status >=200 && xhr.status < 400){
                succeed(xhr.response);
            } 
            else{
                fail(new Error(`Request failed: ${xhr.statusText}`));
            }
        });
        xhr.addEventListener("error", () => fail(new Error("Network error")));
        xhr.send(data);
    });
}

function ajaxFormSubmit(){
    ajaxForm.forEach(el => el.removeEventListener('submit', getAjaxForm, false));
    ajaxForm = document.querySelectorAll('.ajax-form');
    ajaxForm.forEach(el => el.addEventListener('submit', getAjaxForm));
}

let getAjaxForm = function(e) { 

    // 'Способ: Автодоставка Объем: 6.11 Вес: 1830 Наименование: Рампа для крепления автомобилей в транспортном контейнере (6 комплектов) Куда: Владивосток Откуда: Хойчжоу';

    e.preventDefault(); 
    console.log('function getAjaxForm');
    let params = new FormData(this);
    let query = '';
    let comment = 'comment=';

    for(let [name, value] of params) {
        switch(name) {
            case 'weight':
            case 'volume':
            case 'point_a':
            case 'point_b':
            case 'type_delivery':
            case 'product_title':
                let input = this.querySelector('[name="' + name + '"]');
                if(input){
                    let placeholder = input.getAttribute('placeholder');
                    if(placeholder.indexOf(',') != -1){
                        placeholder = placeholder.replace(',','');
                    }
                    comment += placeholder+':'+value+',';
                }
                break;

            case 'search_terms':
                break; 

            default:
                
                query += name+'='+value+'&';     
                break;
        }
        
        if(name == 'phone'){
            query += 'phones[]='+value+'&';    
        }
        if(name == 'email'){
            query += 'emails[]='+value+'&';    
        }
    }


    post(url, params_get_token + query + comment).then(response =>  {
        let result = JSON.parse(response);
        if(result.success == true){
            new systemMessage({
                type:'success',
                title: 'спасибо!',
                text: 'Ваша заявка принята, наш менеджер свяжется с вами в ближайшее время'
            }).show();
        }
    }).catch(error => console.error(error));
}; 


class systemMessage {
    constructor({type, title, text}) {
        this._type = type ? type : 'error';
        this._html_title = document.querySelector('#systemMessage .system_title_js');
        this._html_text = document.querySelector('#systemMessage .system_text_js'); 

        switch(this._type){ 
            case 'success':
                this._title = title ? title : 'Успех'; 
                this._text = text ? text : 'Операция успешно завершена';
                break;

            default:
                this._title = title ? title : 'Ошибка'; 
                this._text = text ? text : 'Произошла ошибка, пожалйста обратитесь к разработчикам';
                break;
        }       
    }

    show(){
        this._html_title.textContent = this._title;
        this._html_text.textContent = this._text; 
        systemModal.show(); 
    }

    hide(){
        systemModal.hide();  
    }
};

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
                    let container = el.closest(params.container);
                }

                if(params.last == 'true' && params.container){
                    let count = document.querySelectorAll(params.container + ' ' + params.block_remove).length;

                    if (count > 1) {
                        el.closest(params.block_remove).remove();
                    } else {
                        alert('Невозможно удалить последний элемент');
                    }

                    if (params.key_text) {
                        let items = document.querySelectorAll(params.block_remove+':not('+params.sources+')');
                        keyItem(items, params.key_text);
                    }
                }else{
                    el.closest(params.block_remove).remove();
                }
                break;
    
            case 'toggleMask':
                let container = el.closest('.input_mask_flag');
                let input = container.querySelector('.mask_js');
                if(input){
                    input.classList.toggle('block_mask');
                    if(el){
                        el.classList.toggle('active'); 
                    }
                    
                    input.focus();
                }
                
                break;

            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }finally{
        callJs();
        calcForm1Event();
        initCalc(); 
        maskInit();
    }
}


function recordParamsData(that){ 
    try { 
        if(that){
            let options = {};
            let attr = that.attributes;
            for (key in attr) {
                let name = attr[key].name;
                let val = attr[key].nodeValue;

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
                if(tab){
                    tab.classList.remove('active');
                }

                if(tabsContent[i]){
                    tabsContent[i].classList.remove('active');
                }
            });

            if(tabsBtns[tabId - 1]){
                tabsBtns[tabId - 1].classList.add('active');
            }
        
            if(tabsContent[tabId - 1]){
                tabsContent[tabId - 1].classList.add('active');
            }
            break;
    }
}

let callJsOption = function() {
    let name = this.getAttribute('data-option');
    getOption(this, name);
}; 

function callJs(){
    btnCallJs.forEach(el => el.removeEventListener('click', callJsOption, false)); //удаляем событие 
    btnCallJs = document.querySelectorAll('.call-js:not(.readonly):not(select):not([disabled])'); // получаем актуальный набор 
    btnCallJs.forEach(el => el.addEventListener('click', callJsOption));  // добавляем событие
}

function maskInit(){
    //console.log('function maskInit()');
    inputMask.forEach(el => el.removeEventListener('focus', maskInitStart, false)); 
    inputMask.forEach(el => el.addEventListener('input', maskPhoneInput, false));  
    inputMask = document.querySelectorAll('.mask_js'); 
    inputMask.forEach(el => el.addEventListener('focus', maskInitStart));   
    inputMask.forEach(el => el.addEventListener('input', maskPhoneInput)); 
}; 

let maskInitStart = function(e) {
    e.preventDefault();
    let type = this.getAttribute('data-mask');

    switch (type) {
        case 'phone':
            console.log('mask_phone_start'); 
            
            if(this){
                if(!this.classList.contains('block_mask')){
                    let val_default = this.value;
    
                    console.log('val_default[0] = ' + val_default[0]);
                    console.log('val_default.length = ' + val_default.length);
    
                    if(val_default.length == 11 && val_default[0] != '7'){
                        this.value = val_default.replace(val_default[0], '7');
                    }
    
                    mask_phone = IMask(this,{
                        mask: '+{0}(000)000-00-00',
                        lazy: false,
        
                        prepare: function (str) {
                            // обработчик до ввода
                            return str.toUpperCase();
                        },
        
                        commit: function (value, masked) {
                             // обработчик после ввода
                        }
                    });
    
                }else{
                    let val_default = mask_phone.unmaskedValue;
                    if(val_default[0] == '7' && val_default.length == 1){
                        val_default = val_default.replace(val_default[0], '');
                    }
    
                    mask_phone.destroy();
                    this.value = val_default; 
                }
            }
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

let maskPhoneInput = function(e) {
    e.preventDefault();
    let val_start = this.value; 

    if((val_start.length == 17 || val_start.length == 27) && val_start[1] != '7'){ 
        this.value = val_start.replace(val_start[1], '7');
    }
};

function choiseJs(){
    selectChoise = document.querySelectorAll('.choice_js');
    selectChoise.forEach((select, index) => {
        new Choices(select, {
            addItems: true,
        });
    });
}

function keyItem(items,key_text){
    if (items && key_text) {
        //расставляем номер 
        for (let i = 0; i < items.length; i++) {
            let item = items[i].querySelector(key_text);
            item.innerHTML = i + 1;
        }
    }
}

function calcForm1Event(){
    console.log('function calcForm1Event()');
    calcInputForm1.forEach(input => input.removeEventListener('input', initCalc, false));
    calcInputForm1 = document.querySelectorAll('.calc_form1_js');
    calcInputForm1.forEach(input => input.addEventListener('input', initCalc));
}

let initCalc = function() {
    console.log('function initCalc()');
    // формулая: сумма по каждой партии (длина * высота * ширина * количество) и перевод в м3
    const calcBtn = document.querySelector('.calc_form1_result_js');
    calcBtn.innerHTML = 0;
    calcItem = document.querySelectorAll('.calculator .calc_item_js');
    let sum = 0;
    
    for (let i = 0; i < calcItem.length; i++) {
        let calc = 1;
        calcInputForm1 = calcItem[i].querySelectorAll('.calc_form1_js');

        for (let y = 0; y < calcInputForm1.length; y++) {
            calc *= Number(calcInputForm1[y].value);
        }
        //console.log('calc = ' + calc);
        sum += calc;
    }
    calcBtn.innerHTML = (sum / 1000000).toFixed(2);
};
 
function initCalc2(){
    // формула :  Вес груза, кг / Объем груза, м3
    const calcBtn2 = document.querySelector('.calc_form2_result_js');
    calcBtn2.innerHTML = 0;
    let weight = document.querySelector('.calc_form2_js[name="weight"]');
    let volume = document.querySelector('.calc_form2_js[name="volume"]');

    if(weight && volume) {
        let weight_val = Number(weight.value);
        let volume_val = Number(volume.value);

        if(weight_val && volume_val){
            calcBtn2.innerHTML = (weight_val / volume_val).toFixed(2);
        }
    }
}



// получаем элементы для модального окна
// полупрозрачный контейнер
// const overflow = document.querySelector('.overflow');
// // кнопка Отправить
// const btnSend = document.querySelector('.btn_calc');
// // кнопка Закрыть 
// const btnCloseMin = document.querySelector('.btn_close_min');
// // Модальное окно
// const modalWindow = document.querySelector('.modal-window');

// btnSend.addEventListener('click', showModal)
// document.querySelector('body').addEventListener('click', closeModal)
// function showModal(e) {
//     e.preventDefault()
//     modalWindow.classList.add('active')
//     overflow.classList.add('active')
//     document.querySelector('body').style.overflow = 'hidden'
// }

// function closeModal(e) {
//     e.preventDefault()
//     console.log(e.target)
//     if (e.target == overflow || e.target == btnCloseMin) {
//         modalWindow.classList.remove('active')
//         overflow.classList.remove('active')
//         document.querySelector('body').style.overflow = 'visible'
//     }

// }

