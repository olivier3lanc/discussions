const pageCreator = {
    _messages: [],
    _handlers: {
        _onSubmitFormPage: function(evt) {
            evt.preventDefault();
            pageCreator.publish();
        },
        _onSubmitFormMessage: function(evt) {
            evt.preventDefault();
            pageCreator.addMessage();
        },
        _onClickPersonaNew: function(evt) {
            d_message_persona_full_name.disabled = false;
        },
        _onClickPersonaPreset: function(evt) {
            d_message_persona_full_name.disabled = true;
        },
        _fetchPageResponse: function(response, id) {
            console.log(response,id);
            pageCreator._messages = response.messages;
            pageCreator.buildPage();
        }
    },
    addMessage: function() {
        // Init message related fields
        pageCreator._formdata_d_message_fields = [];
        pageCreator.el_form_d_message = document.querySelector("#d_message_form");
        if (pageCreator.el_form_d_message !== null) {
            pageCreator.el_form_d_message.addEventListener(
                "submit",
                this._handlers._onSubmitFormMessage
            );
        }
        pageCreator.formdata_d_message = new FormData(pageCreator.el_form_d_message);
        // Get all message fields names and store them into an array
        for (let key of pageCreator.formdata_d_message.keys()) {
            pageCreator._formdata_d_message_fields.push(key);
        }
        // Adding a message is authorized
        // before validity check
        let message_is_postable = true;
        // Check validity for message fields
        this._formdata_d_message_fields.forEach(function(field) {
            const el_input_form = document.querySelector(`[name="${field}"]`);
            const el_error_display = document.querySelector(`#${field}__error`);
            let error_html = '';
            if (!el_input_form.checkValidity()) {
                message_is_postable = false;
                error_html = 'error';
            }
            if (el_error_display !== null) {
                el_error_display.innerHTML = error_html;
            }
        });
        // If message is postable
        // Add it to the pool
        if (message_is_postable) {
            const current_message = {};
            this._formdata_d_message_fields.forEach(function(name) {
                current_message[name] = pageCreator.formdata_d_message.get(name);
            });
            this._messages.push(current_message);
            // console.log(this._messages);
            this.buildPage();
            this.addPersonaPreset();
            // Store on localStorage
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
            d_message_text.value = '';
        } else {
            console.log("message is not postable, check forms");
        }
    },
    publish: function() {
        // Adding a page is enabled
        let page_is_publishable = true;
        // Init pages related fields
        pageCreator._formdata_d_page_fields = [];

        pageCreator.formdata_d_page = new FormData(d_page_form);
        // Get all page fields names and store them into an array
        for (var key of pageCreator.formdata_d_page.keys()) {
            pageCreator._formdata_d_page_fields.push(key);
        }

        // Check validity for pages fields
        this._formdata_d_page_fields.forEach(function(field) {
            const el_input_form = document.querySelector(`[name="${field}"]`);
            const el_error_display = document.querySelector(`#${field}__error`);
            if (el_input_form.checkValidity()) {
                el_error_display.innerHTML = "";
            } else {
                el_error_display.innerHTML = "error";
                page_is_publishable = false;
            }
        });

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
    buildPage: function() {
        let markup = '';
        pageCreator._messages.forEach(function(el, index) {
            markup += `
                <p>
                    ${el.d_message_text}<br>
                    <button onclick="window.parent.pc.remove('${index}')">remove</button>
                </p>
            `;
        });
        el_previewer.contentWindow.document.body.innerHTML = markup;
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
        const current_value = document.querySelector('input[name="d_message_persona_preset"]:checked').value;
        if (current_value == 'new') {
            d_message_persona_full_name.disabled = false;
            const index = d_message_persona_presets_container.querySelectorAll(`input[type="radio"]`).length + 1;
            const new_value = d_message_persona_full_name.value;
            if (d_message_persona_presets_container.querySelector(`input[value="${new_value}"]`) == null) {
                const markup = this.renderCustomPersonaPreset(`d_message_persona_preset_${index}`, new_value);
                d_message_persona_presets_container.insertAdjacentHTML('beforeend', markup);
                d_message_persona_full_name.value = '';
            }
        } else {
            d_message_persona_full_name.disabled = true;
        }
    },
    renderCustomPersonaPreset: function(id, value) {
        return `
            <div class="c-dis m-flex m-cross-center">
                <input type="radio"
                    id="${id}"
                    name="d_message_persona_preset" 
                    value="${value}"
                    class="d_message_persona_custom_preset"
                    onclick="pageCreator._handlers._onClickPersonaPreset()">
                <label for="${id}">
                    ${value}
                </label>
            </div>
        `;
    },
    restore: function() {
        const restoration_data = JSON.parse(localStorage.getItem('discussion'));
        if (restoration_data !== null) {
            // Restore custom personas
            let persona_presets_markup = '';
            restoration_data.custom_personas.forEach(function(data) {
                persona_presets_markup += pageCreator.renderCustomPersonaPreset(data.id, data.value);
            });
            d_message_persona_presets_container.insertAdjacentHTML('beforeend', persona_presets_markup);

            // Restore messages
            this._messages = restoration_data.messages;
            this.buildPage();
        }
    },
    clear: function() {
        if (this.localStorageAvailable()) {
            localStorage.removeItem('discussion');
        }
    }
};
d_page_form.addEventListener('submit', pageCreator._handlers._onSubmitFormPage);
d_message_form.addEventListener('submit', pageCreator._handlers._onSubmitFormMessage);
d_message_persona_preset_new.addEventListener('click', pageCreator._handlers._onClickPersonaNew);
pageCreator.restore();
window.pc = {
    remove: function(index) {
        index = parseInt(index);
        pageCreator._messages.splice(index, 1);
        pageCreator.buildPage();
    }
}