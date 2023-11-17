const pageThemesResources = {
    default: {
        css: ['preview'],
        js_head: ['foo'],
        js_body: ['bar']
    }
}
const pageCreator = {
    // DOM elements
    el_page_form: document.getElementById('d_page_form'),
    el_message_form: document.getElementById('d_message_form'),
    el_page_languages: document.getElementById('d_page_languages'),
    el_page_title: document.getElementById('d_page_title'),
    el_page_description: document.getElementById('d_page_description'),
    el_message_persona_presets_container: document.getElementById('d_message_persona_presets_container'),
    el_message_persona_preset_new: document.getElementById('d_message_persona_preset_new'),
    el_message_persona_full_name: document.getElementById('d_message_persona_full_name'),
    el_message_text: document.getElementById('d_message_text'),
    el_previewer: document.getElementById('d_previewer'),
    // Temp array for messages
    _messages: [],
    // Event handlers
    _handlers: {
        _onSubmitFormPage: function(evt) {
            evt.preventDefault();
            pageCreator.publish();
        },
        _onSubmitFormMessage: function(evt) {
            console.log('submit message');
            evt.preventDefault();
            pageCreator.addMessage();
        },
        _onClickPersonaNew: function(evt) {
            pageCreator.el_message_persona_full_name.disabled = false;
            pageCreator.el_message_persona_full_name.focus();
        },
        _onClickPersonaPreset: function(evt) {
            pageCreator.el_message_persona_full_name.disabled = true;
            pageCreator.el_message_text.focus();
        },
        _onClickRemovePersonaPreset: function(evt) {
            console.log('_onClickRemovePersonaPreset');
            evt.preventDefault();
            evt.target.closest('div').remove();
            pageCreator.save();
        },
        _fetchPageResponse: function(response, id) {
            console.log(response,id);
            pageCreator._messages = response.messages;
            pageCreator.buildPage();
        },
        // Make "Enter" key in a textarea submit a form
        // https://stackoverflow.com/a/49389811
        _onTextareaEnter(evt) {
            if (evt.which === 13) {
                if (!evt.repeat) {
                    const newEvent = new Event("submit", {cancelable: true});
                    evt.target.form.dispatchEvent(newEvent);
                }
                evt.preventDefault(); // Prevents the addition of a new line in the text field
            }
        },
        // source
        // https://javascript.info/selection-range
        _onClickWrapMarkdown: function(evt) {
            const start = pageCreator.el_message_text.selectionStart;
            const end = pageCreator.el_message_text.selectionEnd;
            if (start == end) {
                return; // nothing is selected
            }
            const markdown = evt.target.dataset.markdown;
            const selected = pageCreator.el_message_text.value.slice(start, end);
            pageCreator.el_message_text.setRangeText(`${markdown}${selected}${markdown}`);
        },
        _onDoubleClickMessage: function(evt) {
            pageCreator.el_previewer.contentWindow.document.querySelectorAll('[data-message]').forEach(function(el, index) {
                const el_message = evt.target.closest('[data-message]');
                if (el_message.dataset.message == index) {
                    pageCreator.editMessage(index);
                    el_message.removeEventListener('dblclick', pageCreator._handlers._onDoubleClickMessage);
                }
            })
        }
    },
    // wrapSelectedText: function(markdown = '') {
    //     const selection = this.el_previewer.contentWindow.window.getSelection();
    //     if (selection.rangeCount) {
    //         const range = selection.getRangeAt(0);
    //         const selected_text_obj = range.extractContents();
    //         const selected_text = selected_text_obj.textContent;
    //         range.insertNode(document.createTextNode(`${markdown}${selected_text}${markdown}`));
    //     }
    // },
    _checkFields: function(fields_array) {
        // Inputs are valid unless invalid is detected
        let is_postable = true;
        // Check validity for message fields
        fields_array.forEach(function(field) {
            const el_input_form = document.querySelector(`[name="${field}"]`);
            const el_error_display = document.querySelector(`#${field}__error`);
            let error_html = '';
            if (!el_input_form.checkValidity()) {
                is_postable = false;
                error_html = 'error';
            }
            if (el_error_display !== null) {
                el_error_display.innerHTML = error_html;
            }
        });
        return is_postable;
    },
    // Submit message form 
    // Prepare publish
    // Update preview
    addMessage: function() {
        // Init message related fields
        this._formdata_d_message_fields = [];
        // Get form data
        this.formdata_d_message = new FormData(this.el_message_form);
        // Get all message fields names and store them into an array
        for (let key of this.formdata_d_message.keys()) {
            pageCreator._formdata_d_message_fields.push(key);
        };
        const message_is_postable = this._checkFields(this._formdata_d_message_fields);
        // If message is postable
        // Add it to the pool
        if (message_is_postable) {
            const current_message = {};
            this._formdata_d_message_fields.forEach(function(name) {
                const field_value = pageCreator.formdata_d_message.get(name);
                const sanitized_value = pageCreator.stripHTML(field_value);
                const parsed_markdown = pageCreator.customParse(sanitized_value);
                current_message[name] = parsed_markdown;
            });
            this._messages.push(current_message);
            console.log(this._messages);
            this.buildPage();
            this.addPersonaPreset();
            this.save();
            pageCreator.el_message_text.value = '';
            pageCreator.el_message_persona_full_name.focus();
        } else {
            console.log("message is not postable, check forms");
        }
    },
    customParse: function(string) {
        // Source
        // https://randyperkins2k.medium.com/writing-a-simple-markdown-parser-using-javascript-1f2e9449a558
        const to_HTML = string
            // .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
            // .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
            // .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
            .replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/, `<a href="$1" target="_blank">$1</a>`)
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // bold text
            .replace(/\*(.*)\*/gim, '<em>$1</em>'); // italic text
	    return to_HTML.trim(); // using trim method to remove whitespace
    },
    customParseReverse: function(string) {
        const to_plain_text = string
            .replace(/<a.*>(.*)<\/a>/ig, '$1') // Link
            .replace(/<strong>(.*)<\/strong>/gim, '**$1**') // bold text
            .replace(/<em>(.*)<\/em>/gim, '*$1*'); // italic text
	    return to_plain_text.trim(); // using trim method to remove whitespace
    },
    publish: function() {
        // Init pages related fields
        pageCreator._formdata_d_page_fields = [];

        pageCreator.formdata_d_page = new FormData(pageCreator.el_page_form);
        // Get all page fields names and store them into an array
        for (var key of pageCreator.formdata_d_page.keys()) {
            pageCreator._formdata_d_page_fields.push(key);
        }
        
        const page_is_publishable = this._checkFields(this._formdata_d_page_fields);

        // If page is postable
        // Add it to the pool
        if (page_is_publishable) {
            const page_data = {};
            this._formdata_d_page_fields.forEach(function(name) {
                page_data[name] = pageCreator.formdata_d_page.get(name);
            });
            console.log(pageCreator._messages);
            const options = {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({messages: pageCreator._messages, page: page_data}),
            };
    
            fetch("https://www.olivier3lanc.ovh/api/index.php", options)
                .then((response) => response.json())
                .then((response) => pageCreator.getPageData(response))
                .catch((err) => console.error(err));
        } else {
            console.log("page is not postable, check forms");
        }
    },
    getPageData: function(data) {
        console.log('publish retour', data);
        if (data.id !== undefined) {
            fetch("https://olivier3lanc.ovh/api/index.php?id=" + data.id, {
                    method: "GET",
                })
                .then((response) => response.json())
                .then((response) => pageCreator._handlers._fetchPageResponse(response, data.id))
                .catch((err) => console.error(err));
        }
    },
    stripHTML: function(string) {
        return string.replace(/(<([^>]+)>)/gi, "");
    },
    buildPage: function() {
        const el_input_current_template = document.querySelector('[name="d_page_theme"]:checked');
        let theme_name = 'default';
        if (el_input_current_template !== null) {
            theme_name = el_input_current_template.value;
        }
        let markup = '';
        let css_markup = '';
        let js_head_markup = '';
        let js_body_markup = '';
        pageThemesResources[theme_name].css.forEach(function(file_name) {
            css_markup += `<link rel="stylesheet" href="/assets/themes/${theme_name}/css/${file_name}.css" type="text/css">`;
        });
        pageThemesResources[theme_name].js_head.forEach(function(file_name) {
            js_head_markup += `<script src="/assets/themes/${theme_name}/js/${file_name}.js"></script>`;
        });
        pageThemesResources[theme_name].js_body.forEach(function(file_name) {
            js_body_markup += `<script src="/assets/themes/${theme_name}/js/${file_name}.js"></script>`;
        });
        pageCreator._messages.forEach(function(mess, index) {
            markup += `
                <p data-message="${index}" data-message_alignment="${mess.d_message_alignment}" data-message_variant="${mess.d_message_variant}">
                    <span data-message_text="">${mess.d_message_text}</span><br>
                    <cite data-message_persona="">${mess.d_message_persona_full_name || mess.d_message_persona_preset}</cite><br>
                    <button class="cmd_remove_message" onclick="window.parent.pageCreator.removeMessage('${index}')">remove</button>
                    <button class="cmd_edit_message" onclick="window.parent.pageCreator.editMessage('${index}')">edit</button>
                </p>
            `;
        });
        const el_previewer_document = pageCreator.el_previewer.contentWindow.document;
        // Insert messages markup + JS body
        el_previewer_document.head.innerHTML = css_markup + js_head_markup;
        // Insert messages markup + JS body
        el_previewer_document.body.innerHTML = markup + js_body_markup;
        // Edit mode on double click on message
        el_previewer_document.querySelectorAll('[data-message]').forEach(function(el) {
            el.addEventListener('dblclick', pageCreator._handlers._onDoubleClickMessage);
        })
        // scroll to the last message
        // const el_last_message = el_previewer_document.querySelector('p:last-child');
        // if (el_last_message !== null) {
        //     el_last_message.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        // }
    },
    localStorageAvailable: function() {
        let storage;
        try {
            storage = window['localStorage'];
            const x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException &&
                // everything except Firefox
                (e.code === 22 ||
                    // Firefox
                    e.code === 1014 ||
                    // test name field too, because code might not be present
                    // everything except Firefox
                    e.name === "QuotaExceededError" ||
                    // Firefox
                    e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage &&
                storage.length !== 0
            );
        }
    },
    addPersonaPreset: function() {
        const el_input_checked_persona = document.querySelector('input[name="d_message_persona_preset"]:checked');
        const el_input_new_persona = document.querySelector('input[name="d_message_persona_preset"][value="new"]');
        // If none radio selected, select 'new' by default
        if (el_input_checked_persona == null) {
            el_input_new_persona.checked = true;
        }
        if (el_input_new_persona.checked) {
            this.el_message_persona_full_name.disabled = false;
            const index = this.el_message_persona_presets_container.querySelectorAll(`input[type="radio"]`).length + 1;
            const raw_value = this.el_message_persona_full_name.value;
            const sanitized_value = this.stripHTML(raw_value);
            const new_value = this.customParse(sanitized_value);
            if (this.el_message_persona_presets_container.querySelector(`input[value="${new_value}"]`) == null) {
                const markup = this.renderCustomPersonaPreset(`d_message_persona_preset_${index}`, new_value);
                this.el_message_persona_presets_container.insertAdjacentHTML('beforeend', markup);
                this.el_message_persona_full_name.value = '';
            }
        } else {
            this.el_message_persona_full_name.disabled = true;
        }
    },
    renderCustomPersonaPreset: function(id, value) {
        return `
            <div class="
                c-dis m-flex m-cross-center
                c-pos m-relative">
                <input type="radio"
                    id="${id}"
                    name="d_message_persona_preset" 
                    value="${value}"
                    class="d_message_persona_custom_preset"
                    onclick="pageCreator._handlers._onClickPersonaPreset()">
                <label for="${id}">${value}</label>
                <a  href="#!command-remove"
                    class="c-pos m-absolute m-bottom-100"
                    onclick="pageCreator._handlers._onClickRemovePersonaPreset(event)">
                    remove
                </a>
            </div>
        `;
    },
    restore: function() {
        const restoration_data = JSON.parse(localStorage.getItem('discussion'));
        if (restoration_data !== null) {
            console.log('jkl');
            // Restore custom personas
            let persona_presets_markup = '';
            restoration_data.custom_personas.forEach(function(data) {
                persona_presets_markup += pageCreator.renderCustomPersonaPreset(data.id, data.value);
            });
            this.el_message_persona_presets_container.insertAdjacentHTML('beforeend', persona_presets_markup);

            // Restore messages
            this._messages = restoration_data.messages;
            this.buildPage();
        }
    },
    // Store on localStorage
    save: function() {
        console.log('saved');
        if (this.localStorageAvailable()) {
            const els_custom_personas_presets = document.querySelectorAll('.d_message_persona_custom_preset');
            let custom_personas = [];
            els_custom_personas_presets.forEach(function(el) {
                custom_personas.push({
                    id: el.id,
                    value: el.value
                })
            });
            const backup = {
                custom_personas: custom_personas,
                messages: this._messages
            }
            localStorage.setItem("discussion", JSON.stringify(backup));
        }
    },
    // Clear localStorage
    clear: function() {
        if (this.localStorageAvailable()) {
            localStorage.removeItem('discussion');
            location.reload();
        }
    },
    renderCmdInputRadio: function(data) {
        return `
            <label for="cmd_${data.index}_${data.field}_${data.value}">
                <input type="radio" 
                    ${data.checked == data.value ? 'checked' : ''}
                    id="cmd_${data.index}_${data.field}_${data.value}" 
                    name="cmd_${data.index}_${data.field}" 
                    value="${data.value}">
                ${data.value}
            </label>
        `;
    },
    // Edit message
    editMessage: function(index) {
        console.log('edit:',index);
        const el_to_edit = pageCreator.el_previewer.contentWindow.document.querySelectorAll('[data-message]')[index];
        const el_message = el_to_edit.querySelector('[data-message_text]');
        const el_persona = el_to_edit.querySelector('[data-message_persona]');
        const handler_on_enter_key = function(evt) {
            if (evt.which === 13) {
                window.parent.pageCreator.saveMessage(index)
            }
        }
        el_message.innerHTML = pageCreator.customParseReverse(el_message.innerHTML);
        el_message.addEventListener('keydown', handler_on_enter_key);
        el_persona.innerHTML = pageCreator.customParseReverse(el_persona.innerHTML);
        el_persona.addEventListener('keydown', handler_on_enter_key);
        el_message.contentEditable = true;
        el_persona.contentEditable = true;
        let commands_markup = '';
        const parameters_to_adjust = ['alignment', 'variant'];
        parameters_to_adjust.forEach(function(param_name) {
            const current_value = el_to_edit.dataset['message_'+param_name];
            let possible_values = [];
            document.querySelectorAll(`[name="d_message_${param_name}"]`).forEach(function(el) {
                possible_values.push(el.value);
            });
            possible_values.forEach(function(value) {
                commands_markup += pageCreator.renderCmdInputRadio({
                    index: index,
                    field: param_name,
                    value: value,
                    checked: current_value
                })
            });
        });
        commands_markup += `<button onclick="window.parent.pageCreator.saveMessage(${index})">save</button>`;
        el_to_edit.insertAdjacentHTML('beforeend', commands_markup);
        el_to_edit.querySelector('.cmd_edit_message').remove();
    },
    // Save message
    saveMessage: function(index) {
        console.log('save:',index);
        const el_to_edit = pageCreator.el_previewer.contentWindow.document.querySelectorAll('[data-message]')[index];
        const el_new_message = el_to_edit.querySelector('[data-message_text]');
        const el_new_persona = el_to_edit.querySelector('[data-message_persona]');
        el_new_message.contentEditable = false;
        el_new_persona.contentEditable = false;
        const new_sanitized_message = pageCreator.stripHTML(el_new_message.innerHTML);
        const new_sanitized_persona = pageCreator.stripHTML(el_new_persona.innerHTML);
        const new_message = pageCreator.customParse(new_sanitized_message);
        const new_persona = pageCreator.customParse(new_sanitized_persona);
        pageCreator._messages[index]['d_message_persona_full_name'] = new_persona;
        pageCreator._messages[index]['d_message_text'] = new_message;
        pageCreator._messages[index]['d_message_alignment'] = el_to_edit.querySelector(`[name="cmd_${index}_alignment"]:checked`).value;
        pageCreator._messages[index]['d_message_variant'] = el_to_edit.querySelector(`[name="cmd_${index}_variant"]:checked`).value;
        pageCreator.buildPage();
        pageCreator.save();
    }
};
pageCreator.el_page_form.addEventListener('submit', pageCreator._handlers._onSubmitFormPage);
pageCreator.el_message_form.addEventListener('submit', pageCreator._handlers._onSubmitFormMessage);
pageCreator.el_message_persona_preset_new.addEventListener('click', pageCreator._handlers._onClickPersonaNew);
pageCreator.el_message_text.addEventListener("keydown", pageCreator._handlers._onTextareaEnter);
pageCreator.el_previewer.addEventListener("load", pageCreator.buildPage);
pageCreator.restore();

window.pageCreator = {
    removeMessage: function(index) {
        index = parseInt(index);
        pageCreator._messages.splice(index, 1);
        pageCreator.buildPage();
        pageCreator.save();
    },
    editMessage: function(index) {
        index = parseInt(index);
        pageCreator.editMessage(index);
    },
    saveMessage: function(index) {
        index = parseInt(index);
        pageCreator.saveMessage(index);
    }
}
