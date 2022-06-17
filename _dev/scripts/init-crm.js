var baseurl = (typeof baseurl !== 'undefined') ? baseurl : '/';
var currentUrl = (typeof currentUrl !== 'undefined') ? currentUrl : '/';
var BREAKPOINT_XS = 0;
var BREAKPOINT_SM = 768;
var BREAKPOINT_MD = 992;
var BREAKPOINT_LG = 1200;
var BREAKPOINT_XL = 1330; 

var IS_MOBILE = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 'ontouchstart' in document.documentElement) {
    IS_MOBILE = true;
}

var iphone = false;
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    iphone = true;
}
console.log('iphone = ' + iphone);



(function($) {
    $.fn.initSelect2 = function($select, toDestroy) {

        if ($select == null) {
            $select = $('select:not(.select_in_table):not(.select_in_table2):not(.select_plagin_of)');
        }

        if (IS_MOBILE == true && !$select.hasClass('select2_mobile')) {
            return false;
        }     

        try {
            if (toDestroy) {
                $select.each(function() {
                    var $currentSelect = $(this);

                    if ($currentSelect.hasClass('select2-hidden-accessible')) {
                        try {
                            $currentSelect.select2('destroy');
                        } catch (error) {
                            console.log(error);
                            $currentSelect.parent().find('.select2-container').remove();
                            $currentSelect.removeClass('select2-hidden-accessible');
                        }
                    }
                });
            }
            $select.each(function() {
                var that = $(this);

                if($(this).closest('.select_placeholder').length){
                    var placeholder = $(this).closest('.select_placeholder').data('placeholder');
                    var allowClear = true;   
                }
                else{
                    var allowClear = false;
                    var placeholder = false; 
                }

                if($(this).closest('div[class*="select_theme_"]').length > 0){
                    var dropdownCssClass = $(this).closest('div[class*="select_theme_"]').attr('class');
                }
                else{
                    var dropdownCssClass = '';
                }

                if (!$(this).hasClass('select2-hidden-accessible') && !$(this).hasClass('select_plagin_of')) {
                    $('option', $select).each(function() {
                        if ($(this).hasClass('hidden')) {
                            $(this).remove();
                        }
                    });

                    
                    function formatState (state) {
                        //функция обратного вызова
                        //state содержит объект с текущикими параметрами функции select2
                        if (!state.id) { 
                        return state.text;
                        } 

                        if (that.hasClass('select_status_js')) {
                            var status_id = state.element.attributes['number-status'].value;
                            var $state = $('<span number-status="'+status_id+'">' + state.text + '</span>'); //передаём html шаблон внутрь option для раздела Сделки
                            return $state;  
                        }
                        else{
                            return state.text; 
                        }
                    };

                    $(this).select2({
                        minimumResultsForSearch: 7,
                        placeholder: placeholder,
                        allowClear:allowClear,
                        dropdownCssClass:dropdownCssClass,
                        templateResult: formatState
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    $.fn.systemMessage = function(options) {
        if (options == null) {
            console.log('отсутствуют опции для sweet alert.');
            return false;
        }

        var swalOptions = $.extend({
            title: 'q',
            text: 'q',
            icon: options.type,
            buttons: options.buttons ? options.buttons : {
                confirm: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true, 
                }
            },
        }, options);

        swal(swalOptions).then(function(value) {
            try {
                if (value) { 
                    if (typeof value === 'string' && value.indexOf('?') == 0){
                        window.location.href = window.location.href + value;
                    } else {
                        $(this).getOption(value, {});
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });

        $('.swal-modal .swal-title').html(options.title ? options.title : '');
        $('.swal-modal .swal-text').html(options.text ? options.text : '');
        return true;
    };

    $.fn.initInputMask = function(type) {
        Inputmask.remove($(this)[0]); // удаляем маску, т.к. инициализация маски повторно ведет к ошибкам.
        var decimalMaxLength = $(this).attr('decimal-maxlength');

        switch (type) {
            case 'currency':
                Inputmask({
                    /*regex: '^(-?)(0|[1-9][0-9]*)([.,][0-9]{2})?$',*/
                    regex: '^(-?)([0-9]*)([.,][0-9]{2})?$',
                    rightAlign: false,
                    placeholder: '',
                    groupSeparator: "",
                    showMaskOnFocus: false,
                    showMaskOnHover: false,
                    onKeyDown: function(event) {
                        if (event.which == 13) {
                            var currentVal = $(this).val();
                            currentVal = currentVal.replace(',', '.');
                            $(this).val(currentVal);
                        }
                    },
                    onBeforeMask: function(initialValue) {
                        var processedValue = initialValue.replace(',', '.');
                        return processedValue;
                    }
                }).mask($(this)[0]);
                break;


            case 'float':

                if (decimalMaxLength > 0) {
                    decimalMaxLength = '{' + parseInt(decimalMaxLength) + '}';
                } else {
                    decimalMaxLength = '+';
                }


                Inputmask({
                    /*regex: '^(-?)(0|[1-9][0-9]*)([.,][0-9]' + decimalMaxLength + ')?$',*/
                    regex: '^(-?)([0-9]*)([.,][0-9]' + decimalMaxLength + ')?$',
                    rightAlign: false,
                    placeholder: '',
                    groupSeparator: "",
                    showMaskOnFocus: false,
                    showMaskOnHover: false,
                    onKeyDown: function(event) {
                        if (event.which == 13) {
                            var currentVal = $(this).val();
                            currentVal = currentVal.replace(',', '.');
                            $(this).val(currentVal);
                        }
                    },
                    onBeforeMask: function(initialValue) {
                        var processedValue = initialValue.replace(',', '.');
                        return processedValue;
                    }
                }).mask($(this)[0]);
                break;


            case 'date':
                Inputmask({
                    alias: 'datetime',
                    inputFormat: 'dd.mm.yyyy',
                    clearIncomplete: true,
                }).mask($(this)[0]);
                break;


            case 'time':
                Inputmask({
                    alias: 'datetime',
                    inputFormat: 'HH:MM',
                    clearIncomplete: true,
                }).mask($(this)[0]);
                break;


            case 'datetime':
                Inputmask({
                    alias: 'datetime',
                    inputFormat: 'dd.mm.yyyy HH:MM',
                    clearIncomplete: true,
                }).mask($(this)[0]);
                break;

            case 'email':
                Inputmask({
                    mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
                    greedy: false,
                    placeholder: '',
                    groupSeparator: "",
                    showMaskOnFocus: false,
                    showMaskOnHover: false,
                    onBeforePaste: function (pastedValue, opts) {
                        pastedValue = pastedValue.toLowerCase();
                        return pastedValue.replace("mailto:", "");
                    },
                    definitions: {
                        '*': {
                            validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
                            casing: "lower"
                        }
                    }
                }).mask($(this)[0]);
                break;

            default:
                Inputmask({
                    alias: 'integer',
                    rightAlign: false
                }).mask($(this)[0]);
                break;
        }
    };

    $.fn.getFormData = function() {
        var data = {};
        console.log('function getFormData');

        $.each($(this).serializeArray(), function(key, value) {
            // новый формат
            if ((value.name).indexOf('[]') >= 0) {
                var name = (value.name).replace('[]', '');

                if (name.substring(name.length - 1) == ']') {
                    name = name.substring(0, name.length - 1);
                    var posLeftBracket = name.indexOf('[');
                    name = name.substring(0, posLeftBracket) + ']' + name.substring(posLeftBracket);
                } 

                data[name] = (data[name] === undefined) ? [] : data[name];
                data[name].push(value.value);
            } else {
                var name = (value.name);
                if (name.substring(name.length - 1) == ']') {
                    name = name.substring(0, name.length - 1);
                    var posLeftBracket = name.indexOf('[');
                    name = name.substring(0, posLeftBracket) + ']' + name.substring(posLeftBracket);
                }
                data[name] = value.value;
            }
        });
        return data;
    };

}(jQuery));



document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOMContentLoaded событие2');
        //$.fn.initSelect2();
    } catch (error) {
        console.debug(error);
    }
});


$(window).on('load', function () {
    console.log('load событие3');
    $(".preloader-it").delay(500).fadeOut("slow");
    var progressAnim = $('.progress-anim');
    if (progressAnim.length > 0) {

        for (var i = 0; i < progressAnim.length; i++) {
            var $this = $(progressAnim[i]);
            $this.waypoint(function() {
                var progressBar = $(".progress-anim .progress-bar");
                for (var i = 0; i < progressBar.length; i++) {
                    $this = $(progressBar[i]);
                    $this.css("width", $this.attr("aria-valuenow") + "%");
                }
            }, {
                triggerOnce: true,
                offset: 'bottom-in-view'
            });
        }
    }


    //ПОЯВЛЕНИЕ ОКНА, ЕСЛИ В НЕГО ЗАПИСАЛИ СООБЩЕНИЕ 
    if (message_data) {
        var options = {
            title: message_data.title ? message_data.title : false,
            text: message_data.text ? message_data.text : false,
            type: message_data.type ? message_data.type : false,
            buttons: message_data.buttons ? message_data.buttons : false,
        };
        $.fn.systemMessage(options);
    } else {
        var $sweetMessage = $('#sweet-alert-message');
        if ($.trim($('.text', $sweetMessage).text()).length > 0 || $.trim($('.title', $sweetMessage).text()).length > 0) {

            var options = {
                title: $('.title', $sweetMessage).html() ? $('.title', $sweetMessage).html() : false,
                text: $('.text', $sweetMessage).html() ? $('.text', $sweetMessage).html() : false,
                type: $('.type', $sweetMessage).attr('data-type') ? $('.type', $sweetMessage).attr('data-type') : false,
            };
            $.fn.systemMessage(options);
        }
    }
    //ПОЯВЛЕНИЕ ОКНА, ЕСЛИ В НЕГО ЗАПИСАЛИ СООБЩЕНИЕ END

});





// ФУНКЦИИ ПРОВЕРКИ ФОРМ ----------
function checkFormInputs($form) {
    /**
     * Функция проверки полей формы. На вход в функцию через параметры передается форма, 
     * а на выходе получаем объект с информацией об ошибках.
     * @param  {jQuery} $form Форма, поля которой надо проверить.
     * @returns {Object} Возвращает объект в котором есть поле с количеством ошибок, с текстом ошибки и заголовком текста ошибки.
     */
    var error = 0;
    var text = '';
    var formStatus = {};
    var textCollection = new Set();

    $form.find('.has-error').removeClass('has-error');
    $form.find('.has-success').removeClass('has-success');

    text = 'Не все обязательные поля были заполнены или заполнены с ошибкой:';

    $('.required:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.select2-hidden-accessible):enabled', $form).each(function() {
        var $input = $(this);
        var required_not_null = false;

        if($input.hasClass('required_not_null') == true){
            if ($input.val() == 0 || $input.val() == '0'){
                required_not_null = true;
            }
        }

        if ($input.val().length < 1 || required_not_null == true) {
            var name = $input.attr('name');
            textCollection.add(getErrorText($input));
            addErrorInput($input, 'has-error');
            error++;
        } else if ($input.attr('name').indexOf('mail') >= 0 && $input.attr('name') != 'notifycations_emails') {
            var val = $input.val();

            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!re.test(String(val).toLowerCase())) {
                error++;
                addErrorInput($input, 'has-error');
                textCollection.add(getErrorText($input));
            } else {
                removeErrorInput($input, 'has-error');
                addErrorInput($input, 'has-success');
            }
        } else if ($input.prop('tagName') == 'SELECT' && $input.val() == '0') {
            error++;
            addErrorInput($input, 'has-error');
            textCollection.add(getErrorText($input));
        } else if ($input.attr('name').indexOf('name_folder') >= 0) {

            if (/(.*)(\/|\\|:|\*|\?|"|<|>|\|)(.*)/.test($input.val())) {
                error++;
                addErrorInput($input, 'has-error');
                textCollection.add(getErrorText($input) + ' (название папок и файлов не должны содержать символы / \\ : * ? " < > | )');
            } else {
                removeErrorInput($input, 'has-error');
                addErrorInput($input, 'has-success');
            }
        } else {
            removeErrorInput($input, 'has-error');
            addErrorInput($input, 'has-success');
        }
    });

    $('input.required[type="checkbox"]', $form).each(function() {
        var $input = $(this);

        if (!$input.is(':checked')) {
            error++;
            removeErrorInput($input, 'has-success');
            addErrorInput($input, 'has-error');

            if ($input.attr('name').indexOf('agree') >= 0) {
                textCollection.add('Правила и оферта сайта');
            } else {
                textCollection.add(getErrorText($input));
            }
        } else {
            removeErrorInput($input, 'has-error');
            addErrorInput($input, 'has-success');
        }
    });

    $('input.required[type="file"]', $form).each(function() {
        var $input = $(this);

        if ($input[0].hasAttribute('data-field-name')) {
            var inputResultName = $input.data('field-name');
            if ($('input[name="' + inputResultName + '"]', $form).length &&
                $('input[name="' + inputResultName + '"]', $form).val()) {
                removeErrorInput($input, 'has-error');
                addErrorInput($input, 'has-success');
            } else {
                removeErrorInput($input, 'has-success');
                addErrorInput($input, 'has-error');
                textCollection.add(getErrorText($input));
                error++;
            }
        }
    });

    $('select.required', $form).each(function() {
        var $select = $(this);
        var select_val = $select.val();

        if (select_val == 0 || select_val == '0' || select_val == null) {
            error++;
            removeErrorInput($select, 'has-success');
            addErrorInput($select, 'has-error');
            textCollection.add(getErrorText($select));
        } else {
            removeErrorInput($select, 'has-error');
            addErrorInput($select, 'has-success');
        }
    });

    textCollection.forEach(function(value, valueAgain, set) {
        text += '<br />- <b>' + value + ';</b>';
    });

    formStatus.countErrors = error;
    formStatus.textError = text;
    formStatus.titleError = 'Внимание!';

    if($form.is('[have_file]')){
        var name_input_file = $form.attr('have_file');
        var val = $('#'+name_input_file+'[type="file"]', $form).val();
        if(val != ''){
            formStatus.countErrors = 0;
        }
    }

    return formStatus;
}

function addErrorInput($input, class_name) {
    if (class_name == null) {
        class_name = 'has-error';
    }

    if ($input.closest('.input').length) {
        $input.closest('.input').addClass(class_name);
    } else if ($input.closest('.form-group').length) {
        $input.closest('.form-group').addClass(class_name);
    } else if ($input.closest('.addition-image').length) {
        $input.closest('.addition-image').addClass(class_name);
    } else {
        $input.addClass(class_name);
    }
}

function removeErrorInput($input, class_name) {
    if (class_name == null) {
        class_name = 'has-error';
    }

    if ($input.closest('.input').length) {
        $input.closest('.input').removeClass(class_name);
    } else if ($input.closest('.form-group').length) {
        $input.closest('.form-group').removeClass(class_name);
    } else if ($input.closest('.addition-image').length) {
        $input.closest('.addition-image').removeClass(class_name);
    } else {
        $input.removeClass(class_name);
    }
}

function curentInputclearOneQuote($input) {
    //console.log('function curentInputclearOneQuote');
    if($input){
        var val_input = $input.val();
        var current_val;
    
        if (val_input) {
            current_val = val_input;
    
            if (val_input.indexOf("'") !== -1) {
                $input.val(val_input.replace(/'/g, ''));
            }
    
            if (val_input.indexOf("\\") !== -1) {
                $input.val(val_input.replace(/\\/g, ''));
            }
        }
    
        if (current_val) {
            if (current_val.indexOf('"') !== -1 && current_val.length > 0) {
    
                var new_val = '';
    
                for (var i = 0; i < current_val.length; i++) {
                    if (current_val[i] == '"') {
                        count++;
    
                        if (count % 2 == 0) {
                            new_val += '»';
                        } else {
                            new_val += '«';
                        }
                    } else {
                        new_val += current_val[i];
                    }
                }
    
                if (val_input) {
                    $input.val(new_val);
                }
            }
        }
    }
   
}

function getErrorText($input) { 
    var text = '';

    try {
        var name = $input.attr('name') || '';
        var id = $input.attr('id') || '';
        var $form = $input.closest('form');

        if ($input[0].hasAttribute('data-error-text')) {
            text += $input.data('error-text');
        } else if ($form.find('label[for="' + name + '"]').length) {
            text += $form.find('label[for="' + name + '"]').eq(0).text();
        } else if ($form.find('label[for="' + id + '"]').length) {
            text += $form.find('label[for="' + id + '"]').eq(0).text();
        } else if ($input.closest('.form-group').find('.control-label').length) {
            text += $input.closest('.form-group').find('.control-label').eq(0).text();
        } else if ($input.closest('.input').find('.input__label').length) {
            text += $input.closest('.input').find('.input__label').eq(0).text();
        } else if ($input.attr('placeholder').length) {
            text += $input.attr('placeholder');
        }
    } catch (error) {
        console.log(error);
    }

    return text;
}
// ФУНКЦИИ ПРОВЕРКИ ФОРМ END ----------


function preloader_start() {
    console.log('function preloader_start');

    if ($('body.preloader').length && !$('body').hasClass('load')) {       
        $('body.preloader').addClass('load'); 
        if ($('.preloader__message').length == 0) {
            $('.preloader > .wrapper').prepend('<span class="preloader__message text-warning strong h4">'+languageData['lang_text_30']+'</span>');
        }
    } 
}

function preloader_end() {
    console.log('function preloader_end');

    if($('body').hasClass('load')){
        $('body.preloader').removeClass('load');
        $('.preloader__message').remove(); 
    }
} 


function recordParamsData(that){
    
    try { 
        if(that[0]){
            var options = {};

            $.each(that[0].attributes, function(){ 
                var n = this.name;
                var v = this.value;
        
                if (n.indexOf('data-') >= 0) {
                    options[n.replace('data-', '')] = v;
                }
            });
        
            return options;
        }
    } catch (error) {
        console.log(error);
    } 
}

function isJson(answer) {
    try {
        JSON.parse(answer);
        return true;
    } catch (error) {
        return false;
    }
}