
const pageRun = {
    themes: {
        default: function(messages) {
            let messages_markup = '';
            messages.forEach((mess, index) => {
                let cmd_markup = ``;
                if (typeof pageCreator == 'object') {
                    cmd_markup = `<br>
                        <button class="cmd_remove_message" onclick="window.parent.pageCreator.removeMessage('${index}')">remove</button>
                        <button class="cmd_edit_message" onclick="window.parent.pageCreator.editMessage('${index}')">edit</button>`;
                }
                messages_markup += `
                    <p data-message="${index}" data-message_alignment="${mess.d_message_alignment}" data-message_variant="${mess.d_message_variant}">
                        <span data-message_text="">${mess.d_message_text}</span><br>
                        <cite data-message_persona="">${mess.d_message_persona_full_name || mess.d_message_persona_preset}</cite>
                        ${cmd_markup}
                    </p>
                `;
            });
            return messages_markup;
        }
    },
    build: function(response) {
        console.log(response);
        const markup = this.themes[response.page.d_page_theme](response.messages);
        document.title = response.page.d_page_title;
        const el_title = document.querySelector('#d_page_title');
        if (el_title !== null) {
            el_title.innerHTML = response.page.d_page_title;
        }
        const el_description = document.querySelector('#d_page_description');
        if (el_description !== null) {
            el_description.innerHTML = response.page.el_description;
        }
        if (typeof pageCreator == 'object') {
            // wait until iframe is loaded
            const insertMarkup = function() {
                const el_main = pageCreator.el_previewer.contentWindow.document.querySelector('main');
                if (el_main !== null) {
                    el_main.innerHTML = markup;
                    const el_previewer_document = pageCreator.el_previewer.contentWindow.document;
                    // Edit mode on double click on message
                    el_previewer_document.querySelectorAll('[data-message]').forEach(function(el) {
                        el.addEventListener('dblclick', pageCreator._handlers._onDoubleClickMessage);
                    })
                    clearInterval(interval);
                }
            }
            const interval = setInterval(insertMarkup, 100);
        } else {
            document.querySelector('main').innerHTML = markup;
        }
    },
    getJSON: function(page_id) {
        if (page_id !== undefined) {
            fetch("https://olivier3lanc.ovh/api/index.php?id=" + page_id, {
                    method: "GET",
                })
                .then((response) => response.json())
                .then((response) => {
                    if (response.error === undefined) {
                        pageRun.build(response)
                    } else {
                        alert(response.error)
                    }
                })
                .catch((err) => console.error(err));
        }
    },
    update: function() {
        const params = new URLSearchParams(document.location.search);
        const page_id = params.get("id");
        if (page_id !== null) {
            pageRun.getJSON(page_id);
        }
    }
};
pageRun.update();
