const pageCreator = {
    _messages: [],
    _handlers: {
        _formPage: function(evt) {
            evt.preventDefault();
        },
        _formMessage: function(evt) {
            evt.preventDefault();
        },
    },
    addMessage: function() {
        // Init message related fields
        pageCreator._formdata_d_message_fields = [];
        pageCreator.el_form_d_message = document.querySelector("#d_message_form");
        if (pageCreator.el_form_d_message !== null) {
            pageCreator.el_form_d_message.addEventListener(
                "submit",
                this._handlers._formMessage
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
            if (el_input_form.checkValidity()) {
                el_error_display.innerHTML = "";
            } else {
                el_error_display.innerHTML = "error";
                message_is_postable = false;
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
            console.log(this._messages);
            this.buildPage({messages: this._messages});
        } else {
            console.log("message is not postable, check forms");
        }
    },
    _publish: function() {
        // Adding a page is enabled
        let page_is_publishable = true;
        // Init pages related fields
        pageCreator._formdata_d_page_fields = [];

        pageCreator.el_form_d_page = document.querySelector("#d_page_form");
        if (pageCreator.el_form_d_page !== null) {
            pageCreator.el_form_d_page.addEventListener(
                "submit",
                this._handlers._formPage
            );
        }

        pageCreator.formdata_d_page = new FormData(pageCreator.el_form_d_page);
        // Get all page fields names and store them into an array
        for (var key of pageCreator.formdata_d_page.keys()) {
            pageCreator._formdata_d_page_fields.push(key);
        }

        // Check validity for pages fields
        this._formdata_d_page_fields.forEach(function(field) {
            const el_input_form = document.querySelector('[name="' + field + '"]');
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
            console.log(page_data);
            const options = {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({messages: pageCreator._messages, page: page_data}),
            };
    
            fetch("https://www.olivier3lanc.ovh/api/index.php", options)
                .then((response) => response.json())
                .then((response) => pageCreator.getPageData(response.id))
                .catch((err) => console.error(err));
        } else {
            console.log("page is not postable, check forms");
        }
    },
    getPageData: function(id) {
        fetch("https://olivier3lanc.ovh/api/index.php?id=" + id, {
                method: "GET",
            })
            .then((response) => response.json())
            .then((response) => pageCreator.buildPage(response))
            .catch((err) => console.error(err));
    },
    buildPage: function(data) {
        if (data.error === undefined) {
            console.log(data);
            let markup = '';
            data.messages.forEach(function(el) {
                markup += `
                    <p>${el.d_message_text}</p>
                `;
            });
            el_previewer.contentWindow.document.body.innerHTML = markup
        } else {
            alert(data.error)
        }
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
    }
};
// pageCreator.update()
