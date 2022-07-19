let baseurl = (typeof BASEURL !== 'undefined') ? BASEURL : '/';
let currentUrl = (typeof CURRENTURL !== 'undefined') ? CURRENTURL : '/';
let ajaxForm = document.querySelectorAll('.ajax-form');
let btnCallJs = document.querySelectorAll('.call-js:not(.readonly):not(select):not([disabled])');
let inputMask = document.querySelectorAll('.mask_js');
let calcItem = document.querySelectorAll('.calculator .calc_item_js');
let calcInputForm1 = document.querySelectorAll('.calc_form1_js');
let mask_phone;

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

    ajaxForm.forEach(el => el.addEventListener('submit', function(e) {
        e.preventDefault();
    }));

    const calcInputForm2 = document.querySelectorAll('.calc_form2_js');
    calcInputForm2.forEach(input => input.addEventListener('input', function(e) {
        initCalc2();
    }));

    document.body.addEventListener('click', function(e) {
       //console.log(e.target);

        if(e.target.classList.contains('btn_tab_js')){
            e.preventDefault();
            changeTabs(e.target);
        }

        if(e.target.getAttribute('type') == 'submit' && e.target.closest('.ajax-form-pay')){
            let form = e.target.closest('.ajax-form-pay');
            getAjaxFormPay(form);
        }

        if(e.target.getAttribute('type') == 'submit' && e.target.closest('.ajax-form-tracking')){
            let form = e.target.closest('.ajax-form-tracking');
            getAjaxFormTracking(form); 
        }
    });
});



class systemModal{
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
        let modal = document.getElementById('systemMessage');

        if(this._html_title && this._html_text){
            this._html_title.innerHTML = this._title;
            this._html_text.innerHTML = this._text; 
        }
         
        if(modal){
            let systemMessage = new bootstrap.Modal(modal);
            systemMessage.show(); 
        }
    }

    hide(){
        let modal = document.getElementById('systemMessage');
        if(modal){
            let systemMessage = new bootstrap.Modal(modal);
            systemMessage.hide(); 
        } 
    }
};

function postJS(baseurl, data) {
    return new Promise((succeed, fail) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", baseurl, true);
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

function getAjaxFormPay(form) { 
    // 'Способ: Автодоставка Объем: 6.11 Вес: 1830 Наименование: Рампа для крепления автомобилей в транспортном контейнере (6 комплектов) Куда: Владивосток Откуда: Хойчжоу';
    console.log('function getAjaxFormPay');
    if(form){
        if (form.classList.contains('form_check_js')) {
            formStatus = checkFormInputs(form);
            if (formStatus.countErrors) {
                new systemModal({
                    type:'warning',
                    title: formStatus.titleError,
                    text: formStatus.textError
                }).show();
                return null;
            }
        }
        let params = new FormData(form);
        let query = '';
        let comment = 'comment=';

        for(let [name, value] of params) {
            //console.log('name: ' + name + ' value: ' + value);
            switch(name) {
                case 'weight':
                case 'volume':
                case 'point_a':
                case 'point_b':
                case 'type_delivery':
                case 'product_title':
                    let input = form.querySelector('[name="' + name + '"]');
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

        let params_get_token = 'request=addLead&login=api_app@mail.ru&password=133api&not_get_token=true&token&';
        postJS(baseurl, params_get_token + query + comment).then(response =>  {
            let result = JSON.parse(response);
            if(result.success == true){
                new systemModal({
                    type:'success',
                    title: 'Спасибо!',
                    text: 'Ваша заявка принята, наш менеджер свяжется с вами в ближайшее время'
                }).show();

                clearForm(form);
            }
        }).catch(error => console.error(error));
    }
}; 

function getAjaxFormTracking(form) { 
    // 'Способ: Автодоставка Объем: 6.11 Вес: 1830 Наименование: Рампа для крепления автомобилей в транспортном контейнере (6 комплектов) Куда: Владивосток Откуда: Хойчжоу';
    console.log('function getAjaxFormTracking');
    if(form){
        if (form.classList.contains('form_check_js')) {
            formStatus = checkFormInputs(form);
            if (formStatus.countErrors) {
                new systemModal({
                    type:'warning',
                    title: formStatus.titleError,
                    text: formStatus.textError
                }).show();
                return null;
            }
        }

        let params = getFormData(form);
        let params_get_token = 'request=login&login=api_crm@hl-group.ru&password=b83cf54810c924db2ccff0a242188ad6';

        postJS(baseurl, params_get_token).then(response =>  {
            let result = JSON.parse(response);

            if(result.success == false){
                if(result.message){
                    var message = result.message;

                    new systemModal({
                        type: message.type,
                        title: message.title,
                        text: message.text
                    }).show();
                    return null;
                }
            }else{
                if(result.result){ 
                    token_api = result.result;
                    let container = document.querySelector('.container_tracking_js');
                    let params_get_cargo = `request=getClientIntransitItemByMark&number_client=${params.tracking}&token=${token_api}&html=true`;

                    postJS(baseurl, params_get_cargo).then(response =>  {
                        container.classList.remove('start_js');
                        let result = JSON.parse(response);

                        if(result.success == true){
                            if(result.result){
                                container.querySelector('.form_tracking_content_js').innerHTML = result.result;
                                container.classList.remove('empty_js'); 
                            }else{
                                container.classList.add('empty_js');
                            }
                            
                            if(result.message){
                                var message = result.message;
            
                                new systemModal({
                                    type: message.type,
                                    title: message.title,
                                    text: message.text
                                }).show();
                            }

                        }else{
                            container.classList.add('empty_js');
                            container.querySelector('.form_tracking_content_js').innerHTML = '';
                        }
                    }).catch(error => console.error(error));
                }
            }
        }).catch(error => console.error(error));
    }
}; 

function getFormData(form) {
    console.log('function getFormData');
    let data = {};

    if(form){
        let params = new FormData(form);
    
        for(let [name, value] of params) {
            //console.log('name: ' + name + ' value: ' + value);

            if(name.indexOf('[]') >= 0){
                let name = name.replace('[]', '');

                if (name.substring(name.length - 1) == ']') {
                    name = name.substring(0, name.length - 1);
                    let posLeftBracket = name.indexOf('[');
                    name = name.substring(0, posLeftBracket) + ']' + name.substring(posLeftBracket);
                } 
                
                data[name] = (data[name] === undefined) ? [] : data[name];
                data[name].push(value);
            }else{
                if (name.substring(name.length - 1) == ']') {
                    name = name.substring(0, name.length - 1);
                    let posLeftBracket = name.indexOf('[');
                    name = name.substring(0, posLeftBracket) + ']' + name.substring(posLeftBracket);
                }
                data[name] = value;
            }
        }
    }
    return data;
};

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


function changeTabs(that) {
    try {
        let container = that.closest('.tabs');
        let tabsBtns = container.querySelectorAll('.btn_tab_js');
        let tabsContent = container.querySelectorAll('.tabs__content');
        let tabId = that.dataset.tab;

        tabsBtns.forEach((tab, i) => {
            tab.classList.remove('active');
            tabsContent[i].classList.remove('active');
        });

        tabsBtns[tabId - 1].classList.add('active');
        tabsContent[tabId - 1].classList.add('active');
     
    } catch (error) {
        console.log(error);
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


let maskInitStart = function(e) {
    e.preventDefault();
    let type = this.getAttribute('data-mask');

    switch (type) {
        case 'phone':
            console.log('mask_phone_start'); 
            
            if(!this.classList.contains('block_mask')){
                let val_default = this.value;

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

let maskPhoneInput = function() {
    let val_start = this.value; 
    if((val_start.length == 17 || val_start.length == 27) && val_start[1] != '7'){ 
        this.value = val_start.replace(val_start[1], '7');
    }
};

function maskInit(){
    //console.log('function maskInit()');
    inputMask.forEach(el => el.removeEventListener('focus', maskInitStart, false)); 
    inputMask.forEach(el => el.addEventListener('input', maskPhoneInput, false));  
    inputMask = document.querySelectorAll('.mask_js'); 
    inputMask.forEach(el => el.addEventListener('focus', maskInitStart));   
    inputMask.forEach(el => el.addEventListener('input', maskPhoneInput)); 
}; 

function choiseJs(){
    selectChoise = document.querySelectorAll('.choice_js');
    selectChoise.forEach((select, index) => {
        //choise.destroy(); 
    
        let choise = new Choices(select, {
            //addItems: true,
            //placeholderValue: 'test'
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



//проверка форм
function getErrorText(input) { 
    let text = '';

    try {
        let name = input.getAttribute('name') || '';
        let id = input.getAttribute('id') || '';
        let form = input.closest('form');

        if (input.hasAttribute('data-error-text')) {
            text += input.data('error-text');
        }
        else if (form.querySelector('label[for="' + name + '"]')) {
             text += form.querySelector('label[for="' + name + '"]').textContent;
        }
        else if (form.querySelector('label[for="' + id + '"]')) {
            text += form.querySelector('label[for="' + id + '"]').textContent;
        }
        else if (input.getAttribute('placeholder').length) {
            text += input.getAttribute('placeholder');
        }
    } catch (error) {
        console.log(error);
    }
    return text;
}

function checkFormInputs(form) {
    /**
     * Функция проверки полей формы. На вход в функцию через параметры передается форма, 
     * а на выходе получаем объект с информацией об ошибках.
     * @param  {jQuery} form Форма, поля которой надо проверить.
     * @returns {Object} Возвращает объект в котором есть поле с количеством ошибок, с текстом ошибки и заголовком текста ошибки.
     */

    if(form){
        let error = 0;
        let text = 'Не все обязательные поля были заполнены или заполнены с ошибкой:';
        let formStatus = {};
        let textCollection = new Set();
        let input = form.querySelectorAll('.required:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.select2-hidden-accessible):enabled');

        input.forEach((input, i) => {
            let name = input.getAttribute('name');

            if (input.value.length < 1) {
                textCollection.add(getErrorText(input));
                addErrorInput(input);
                error++;
            }
            else if (name.indexOf('mail') >= 0 && name != 'notifycations_emails') {
                let val = input.value;
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!re.test(String(val).toLowerCase())) {
                    error++;
                    textCollection.add(getErrorText(input));
                    addErrorInput(input);
                }else{
                    removeErrorInput(input);
                    addErrorInput(input, 'has-success');
                }
            }
            else if (input.tagName == 'SELECT' && input.value == '0') {
                error++;
                addErrorInput(input);
                textCollection.add(getErrorText(input));
            }
            else if (name.indexOf('name_folder') >= 0) {

                if (/(.*)(\/|\\|:|\*|\?|"|<|>|\|)(.*)/.test(input.value)) {
                    error++;
                    textCollection.add(getErrorText(input) + ' (название папок и файлов не должны содержать символы / \\ : * ? " < > | )');
                    addErrorInput(input);
                } else{
                    removeErrorInput(input);
                    addErrorInput(input, 'has-success');
                }
            }else{
                removeErrorInput(input, 'has-error');
                addErrorInput(input, 'has-success');
            }
        });

        textCollection.forEach(function(value, valueAgain, set) {
            text += '<br />- <b>' + value + ';</b>';
        });

        formStatus.countErrors = error;
        formStatus.textError = text;
        formStatus.titleError = 'Внимание!';

        return formStatus;
    }
}

function addErrorInput(input, class_name) {
    if (class_name == null) {
        class_name = 'has-error';
    }

    if (input.closest('.input')) {
        input.closest('.input').classList.add(class_name);
    } else if (input.closest('.form-group')) {
        input.closest('.form-group').classList.add(class_name);
    } else if (input.closest('.addition-image')) {
        input.closest('.addition-image').classList.add(class_name);
    } else {
        input.classList.add(class_name);
    }
}

function removeErrorInput(input, class_name) {
    if (class_name == null) {
        class_name = 'has-error';
    }

    if (input.closest('.input')) {
        input.closest('.input').classList.remove(class_name);
    } else if (input.closest('.form-group')) {
        input.closest('.form-group').classList.remove(class_name);
    } else if (input.closest('.addition-image')) {
        input.closest('.addition-image').classList.remove(class_name);
    } else {classList.remove
        input.classList.remove(class_name);
    }
}

function clearForm(form){
    if(form){
        let inputs = form.querySelectorAll('input[type="text"]');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }

        // let selects = form.querySelectorAll('select');
        // console.log(selects); 

        // for (let i = 0; i < selects.length; i++) {
        //     console.log(selects[i]);
        //     let option = selects[i].querySelector('option');
        // }
    }
}
//проверка форм END




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
                if(el.closest('form')){
                    let form = el.closest('form');
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

