
const pageBuilder = {
    build: function(r) {
        console.log(r);
        let markup = '';
        let css_markup = '';
        let js_head_markup = '';
        let js_body_markup = '';
        pageThemesResources[r.page.d_page_theme].css.forEach(function(file_name) {
            css_markup += `<link rel="stylesheet" href="/assets/themes/${r.page.d_page_theme}/css/${file_name}.css" type="text/css">`;
        });
        pageThemesResources[r.page.d_page_theme].js_head.forEach(function(file_name) {
            js_head_markup += `<script src="/assets/themes/${r.page.d_page_theme}/js/${file_name}.js"></script>`;
        });
        pageThemesResources[r.page.d_page_theme].js_body.forEach(function(file_name) {
            js_body_markup += `<script src="/assets/themes/${r.page.d_page_theme}/js/${file_name}.js"></script>`;
        });
        r.messages.forEach(function(mess, index) {
            markup += `
                <p>
                    <span>${mess.d_message_text}</span><br>
                    <cite>${mess.d_message_persona_full_name}</cite>
                </p>
            `;
        });
        // Insert messages markup + JS body
        document.head.innerHTML = css_markup + js_head_markup;
        // Insert messages markup + JS body
        const markup_body = markup + js_body_markup;
        document.body.insertAdjacentHTML('afterbegin', markup_body);
    },
    getPageData: function(id) {
        if (id !== undefined) {
            fetch("https://olivier3lanc.ovh/api/index.php?id=" + id, {
                    method: "GET",
                })
                .then((response) => response.json())
                .then((response) => pageBuilder.build(response))
                .catch((err) => console.error(err));
        }
    },
};
