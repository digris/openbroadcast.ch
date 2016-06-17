$(function () {
    $(document).on('click', '.article-list a[data-toggle-item]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var container = $(this).parents('.article')
        var id = container.data('id');
        container.toggleClass('expanded');
    });


    // TODO: make more generic
    var hash = window.location.hash.substr(1);
    if(hash.length && $('#' + hash).length) {
        var container = $('#' + hash);
        container.addClass('expanded');

        setTimeout(function(){
            $(window).scrollTo(container, 500, {offset: -100})
        }, 500)


    }

});