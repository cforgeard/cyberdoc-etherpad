exports.postAceInit = function(hookName, args, cb) {
    const aceOuterIframe = document.querySelector('iframe[name="ace_outer"]');
    const aceInnerIframe = aceOuterIframe.contentWindow.document.querySelector('iframe[name="ace_inner"]');
    aceInnerIframe.contentDocument.getElementById("innerdocbody").firstElementChild.click();
    return cb();
}