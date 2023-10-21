const pageCreator = {
    _messages: [],
    _handlers: {
        _formPage: function(evt) {
            evt.preventDefault();
        },
        _formMessage: function(evt) {
            evt.preventDefault();
        }
    },
    addMessage: function() {
        // Init message related fields
        pageCreator._formdata_d_message_fields = [];
        pageCreator.el_form_d_message = document.querySelector("#d_message_form");
        if (pageCreator.el_form_d_message !== null) {
            pageCreator.el_form_d_message.addEventListener('submit', this._handlers._formMessage);
        }
        pageCreator.formdata_d_message = new FormData(pageCreator.el_form_d_message);
        // Get all message fields names and store them into an array
        for (var key of pageCreator.formdata_d_message.keys()) {
            pageCreator._formdata_d_message_fields.push(key);
        }
        // Adding a message is authorized
        // before validity check
        let message_is_postable = true;
        // Check validity for message fields
        this._formdata_d_message_fields.forEach(function(field) {
            const el_input_form = document.querySelector('[name="'+field+'"]');
            const el_error_display = document.querySelector(`#${field}__error`);
            if (el_input_form.checkValidity()) {
                el_error_display.innerHTML = '';
            } else {
                el_error_display.innerHTML = 'error';
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
        } else {
            console.log('message is not postable, check forms')
        }
    },
    _publish: function() {

        // Init pages related fields
        pageCreator._formdata_d_page_fields = [];

        pageCreator.el_form_d_page = document.querySelector("#d_page_form");
        if (pageCreator.el_form_d_page !== null) {
            pageCreator.el_form_d_page.addEventListener('submit', this._handlers._formPage);
        }

        pageCreator.formdata_d_page = new FormData(pageCreator.el_form_d_page);
        // Get all page fields names and store them into an array
        for (var key of pageCreator.formdata_d_page.keys()) {
            pageCreator._formdata_d_page_fields.push(key);
        }

        // Check validity for pages fields
        this._formdata_d_page_fields.forEach(function(field) {
            const el_input_form = document.querySelector('[name="'+field+'"]');
            const el_error_display = document.querySelector(`#${field}__error`);
            if (el_input_form.checkValidity()) {
                el_error_display.innerHTML = '';
            } else {
                el_error_display.innerHTML = 'error';
                message_is_postable = false;
            }
        });
        // fetch('https://olivier3lanc.ovh/cockpit/api/content/item/pagesonthefly', {
        //     method: 'POST',
        //     headers: {
        //       "api-key": "API-c8dd49519bd457ba12944df55c2cb87b402d2868",
        //       "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         data: {
        //             id: "klmlkk-sdfsdfs-sdfsghdfhsdjhtreh-sd",
        //             title: "mon titre 1",
        //             description: "Ma description lrem ipsum",
        //             language: "fr",
        //             theme: "default",
        //             messages: [
        //                 {
        //                     persona: "sdmlfk",
        //                     text: "fq skldfj qsmldkfj sqmlkdfj smldkfj mlskdj "
        //                 }
        //             ]
        //         }
        //     })
        // })
        // .then(response => response.json())
        // .then(response => console.log(response));



        // const data = JSON.stringify({
        //     data: {
        //       id: 'klmlkk-sdfsdfs-sdfsghdfhsdjhtreh-sd',
        //       title: 'mon titre 1',
        //       description: 'Ma description lrem ipsum',
        //       language: 'fr',
        //       theme: 'default',
        //       messages: [
        //         {
        //           persona: 'sdmlfk',
        //           text: 'fq skldfj qsmldkfj sqmlkdfj smldkfj mlskdj '
        //         }
        //       ]
        //     }
        //   });
          
        //   const xhr = new XMLHttpRequest();
        //   xhr.withCredentials = true;
          
        //   xhr.addEventListener('readystatechange', function () {
        //     if (this.readyState === this.DONE) {
        //       console.log(this.responseText);
        //     }
        //   });
          
        //   xhr.open('POST', 'https://www.olivier3lanc.ovh/api/index.php');
        //   xhr.setRequestHeader('content-type', 'application/json');
          
        //   xhr.send(data);

        // OK
        // const options = {
        //     method: "POST",
        //     headers: { "content-type": "application/json" },
        //     body: JSON.stringify({
        //       data: {
        //         id: "klmlkk-sdfsdfs-sdfsghdfhsdjhtreh-sd",
        //         title: "mon titre 1",
        //         description: "Ma description lrem ipsum",
        //         language: "fr",
        //         theme: "default",
        //         messages: [
        //           {
        //             persona: "sdmlfk",
        //             text: "fq skldfj qsmldkfj sqmlkdfj smldkfj mlskdj ",
        //           },
        //         ],
        //       },
        //     }),
        //   };
          
        //   fetch("https://www.olivier3lanc.ovh/api/index.php", options)
        //     .then((response) => response.text())
        //     .then((response) => console.log(response))
        //     .catch((err) => console.error(err));

        const options = {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(pageCreator._messages),
        };
            
        fetch("https://www.olivier3lanc.ovh/api/index.php", options)
            .then((response) => response.text())
            .then((response) => console.log(response))
            .catch((err) => console.error(err));
          
    },
    getMessage: function(id) {
        fetch('https://olivier3lanc.ovh/api/index.php?id='+id, {
            method: 'GET'
            })
            .then(response => response.json())
            .then(response => console.log(response)); 
    }
}
// pageCreator.update()