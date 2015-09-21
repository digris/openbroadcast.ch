$(function () {
    $('body').on('click', '.article-list .toggle a', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var container = $(this).parents('.article')
        var id = container.data('id');
        container.toggleClass('expanded');
    })
});