export default {
    reloadAll() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/';
        document.body.appendChild(form);
        form.submit();
        location.href = '/';
    },
    whichPlatform() {
    }
};
//# sourceMappingURL=utils.js.map