(function($) {
    $.fn.getOption = function(option, params) {

        if (option == null) {
            option = this.attr('data-option');
        }

        console.log('Option ' + option + ' started...');

        try {
            if (params == null) {
                params = recordParamsData($(this)) || {};
            }
        } catch (error) {
            console.log('error getOption');
        }

        var $td = $(this).closest('td');
        if ($td.length) {
            if ($td.hasClass('td_editing')) {
                console.log('Значение в ячейке таблицы уже редактируется.');
                return false;
            }
        }

        switch (option) {

            case 'test': 
                try {
                    console.log(params);
                    result = params.result;
                    

                } catch (error) {
                    console.log(error);
                }finally {
                    preloader_end();
                }
                break;
                    
            default:
                var fname = eval('$.fn.' + option);
                if ($.isFunction(fname)) {
                    console.log('delegate to ' + option + ' function...');
                    eval('$(this).' + option + '(params)');
                }
                break;
        }
    }
}(jQuery));


window.addEventListener('load', function() {
    $('body').on('click', '.call-js:not(.readonly):not(select):not([disabled])', function(e) {
        e.preventDefault();
        var name = $(this).attr('data-option');
        $(this).getOption(name);
    });

    $('body').on('change', 'select.change-js, .select_change_js select', function(e) {
        console.log('change .change-js select');
        e.preventDefault(); 
        var $select = $(this);
        var name = $select.data('option');
        
        if($select.closest('.select_change_js').length > 0){
            name = $select.closest('.select_change_js').data('option');
        }
        var options = recordParamsData($select) || {}; 
        var target_option = $('option:selected', $select[0]);

        $.each(target_option[0].attributes, function(){
        
            var n = this.name;
            var v = this.value;

            if (n.indexOf('data-') >= 0) {
                options[n.replace('data-', '')] = v; 
            }
        });
    
        options.val = $select.val();
        options.that = $(this);
        $select.getOption(name, options);
    });
    
    $('body').on('change', 'input[type="checkbox"].change-js', function(e) {
        console.log('.change-js checkbox');
        e.preventDefault();
        var $checkbox = $(this);

        if ($checkbox.hasClass('checkbox__field_denied-edit')) {
            if ($checkbox.hasClass('checkbox__field_lock-change')) {
                $checkbox.prop('checked', !$checkbox.prop('checked'));
                showConfirmSwal({
                    title: $checkbox.attr('data-title') ? $checkbox.attr('data-title') : 'Внимание!',
                    text: $checkbox.attr('data-text') ? $checkbox.attr('data-text') : 'Подтвердить действие ?',
                });
                scriptAfterConfirmSwal($checkbox);
                return false;
            } else {
                $checkbox.addClass('checkbox__field_lock-change');
            }
        }

        var name = $checkbox.attr('data-option');
        var options = recordParamsData($checkbox) || {}; 
        options.val = !$checkbox.is(':checked') ? 0 : 1; 
        options.that = $checkbox;
        $checkbox.getOption(name, options); 
    });

    $('body').on('change', 'input[type="radio"].change-js', function(e) {
        console.log('.change-js radio');
        e.preventDefault(); 
        var $radio = $(this);
        var name = $radio.attr('data-option');
        var options = recordParamsData($radio) || {}; 
        $radio.getOption(name, options);
    }); 

    $('body').on('change', 'input[type="text"].change-js, textarea.change-js', function(e) {
        console.log('.change-js input[type="text"]');
        e.preventDefault(); 
        var $input = $(this);
        var $form = $input.closest('form');
        var name = $input.attr('data-option');
        var options = recordParamsData($input) || {}; 
        options.val = $(this).val() || '';
        options.name = $(this).attr('name') || '';

        if($form){
            options.form = $form;
        }
    
        $input.getOption(name, options);
    }); 

    $('body').on('submit', '.ajax-form:not(.no_submit)', function(e) {
        e.preventDefault();
        preloader_start();
        console.log('ajax-form submit');
        var form = $(this);
        form.addClass('no_submit');

        if (form[0].disabled) {
            preloader_end();
            return false;
        }

        form[0].disabled = true;

        var formStatus = {};
        if (form.hasClass('form_check-js') && !form.hasClass('form-two-submit-js')) {

            formStatus = checkFormInputs(form);

            if (formStatus.countErrors) {
                preloader_end();
                $.fn.systemMessage({
                    title: formStatus.titleError,
                    text: formStatus.textError,
                    type: 'error'
                });

                setTimeout(function() {
                    form[0].disabled = false;
                    form.removeClass('no_submit');
                }, 10);
                return null;
            }
        }

        var query = $(this).getFormData();
        var callback = $(this).attr('data-callback') || $(this).closest;
        var option = $(this).find('[name="submit"][type="submit"]').val();
        var action = form.attr('action') || '';
        var preloader_end_stop = false;
        query.submitVal = option;

        $.ajax({
            method: "POST",
            type: "POST",
            cache: false,
            url: baseurl + action,
            data: {
                ajax: true,
                option: option,
                query: query
            } 
        }).done(function(msg) {
            if(isJson(msg) == true){
                var result = JSON.parse(msg);

                if(result.id_result){
                    query.result = result.id_result;
                }
                else{
                    if(!result.success){
                        query.result = msg;
                    }
                    else{
                        query.result = result;
                    }
                }

                if(result.success == false){
                    if(result.message){
                        var message = result.message;
                        $.fn.systemMessage({
                            title: message.title || 'Ошибка!',
                            text: message.text || 'Для решения проблемы обратитесь к разработчикам.',
                            type: message.type || 'error'
                        });
                    }
                    form[0].disabled = false;
                    form.removeClass('no_submit');
                    preloader_end();
                    return false;
                }

                if(result.success == true){
                    if(result.message){
                        var message = result.message;
    
                        if(message.title && message.text && message.type){
                            $.fn.systemMessage({
                                title: message.title,
                                text: message.text,
                                type: message.type
                            });
                        }
                    }
                }
            }
            else{
                query.result = msg;
            }

            if (callback && typeof callback === 'string'){
                preloader_end_stop = true;
                form.getOption(callback, query);
            }
                
            else if (!isJson(msg)) {
                preloader_end();
                if (!parseInt(msg) && form.find('.mess').length) {
                    $.fn.systemMessage({
                        title: 'Системное сообщение',
                        text: msg,
                        type: 'warning'
                    });
                }
            }

        }).fail(function(response){
            preloader_end();
            $.fn.systemMessage({
                title: 'Ошибка',
                text: 'Обратитесь к разработчикам',
                type: 'error'
            });
        }).always(function() {
            setTimeout(function() {
                form[0].disabled = false;
                form.removeClass('no_submit');

                if(preloader_end_stop == false){
                    preloader_end();
                }
            }, 10);
        });
    });

    $('body').on('submit', '.js-form', function(e) {
        console.log('submit .js-form');
        e.preventDefault();
        var form = $(this);

        if (form.hasClass('form_check-js') && !form.hasClass('form-two-submit-js')) {
            formStatus = checkFormInputs(form);

            if (formStatus.countErrors) {
                $.fn.systemMessage({
                    title: formStatus.titleError,
                    text: formStatus.textError,
                    type: 'error'
                });

                setTimeout(function() {
                    form[0].disabled = false;
                }, 10);
                return null;
            }
        }

        removePointInMask(form);
        var option = $('[name="submit"]', form).val();
        var query = $(this).getFormData();

        if ($('select[multiple]:not([disabled])', form).length > 0) {
            $('select[multiple]:not([disabled])', form).each(function() {
                var target_select = $(this);
                var name_select = target_select.attr('name');
                var option_value = [];

                $('option:selected', target_select).each(function() {
                    option_value.push($(this).attr('value'));
                });
                query[name_select] = option_value;
            });  
        }
        
        $(this).getOption(option, query);
    });

    /*маски ввода*/

    $('body').on('focus', '.mask-float-js, .mask-int-js', function() {
        $(this).trigger('select');
        var val_input = $(this).val();
        if (val_input == 0 || val_input == '0' || val_input == null) {
            $(this).val('');
        }
    });


    $('body').on('focus', '.mask-float-js', function() {
        $(this).initInputMask('float');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-int-js', function() {
        $(this).initInputMask();
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-currency-js', function() {
        $(this).initInputMask('currency');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-phone-js', function() {
        var current_val = $(this).val();

        if(current_val[0] = '7'){
            current_val = current_val.replace('7');
            $(this).val(current_val);
        }

        Inputmask({
            mask: '+7 (999) 999-99-99',
        }).mask($(this)[0]);
    });

    $('body').on('focus', '.mask-email-js', function() {
        $(this).initInputMask("email");
    });

    $('body').on('focus', '.mask-date-js', function() {
        $(this).initInputMask('date');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-time-js', function() {
        $(this).initInputMask('time');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-datetime-js', function() {
        $(this).initInputMask('datetime');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('change', 'input[type="text"], input[type="password"], input[type="email"]', function() {
        $(this).val($.trim($(this).val()));
    });
    /*маски ввода END*/
});