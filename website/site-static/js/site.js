var SiteUI = function () {

    var self = this;
    this.navigation_active = false;
    this.colors = [
        '#21D9EA',
        '#6C74EE',
        '#75DB87',
        '#609E80'
    ];

    this.colors = [
        '#dddddd'
    ];
    this.current_color = 0;

    this.remote_window = false;

    this.hover_timeouts = [];

    this.bindings = function () {

        $(document).on('mouseenter', '.hoverable', function (e) {
            $(this).addClass("hover");
        });
        $(document).on('mouseleave', '.hoverable', function (e) {
            $(this).removeClass("hover");
        });
        $(document).on('click', '.clickable', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = $(this).data('permalink');
            document.location = url;
        });

        // item linking
        $(document).on('click', '.item[data-permalink], .clickable[data-permalink]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var url = $(this).data('permalink');
            try {
                tl_visit(url);
            } catch(e) {
                document.location.href = url;
            }
        });

        $(document).ajaxStart(function() {
            //debug.debug('ajax start');
            //$('body').addClass('xhr-load');
        });
        $(document).ajaxStop(function() {
            //debug.debug('ajax stop');
            //$('body').removeClass('xhr-load');
        });

        $(window).on('resize', function(e){
            self.layout();
        });

        // $(document).on('ajax-loader', function(e, action) {
        //     if(action == 'loaded') {
        //         self.init_fd5();
        //     }
        // });


        $(document).on('alogin', function(e, t){
            if(t == 'auth-state-change') {
                Turbolinks.visit($.address.path())
            }
        });


    };





    /*
    layout method, called as well on window resize
     */
    this.layout = function() {

        // map width to height
        $('[data-width-to-height]').each(function(){
            $(this).height($(this).width());
        });

    };



    this.init_fd5 = function() {
        // var fd5_settings = {
        //     reveal: {
        //         animation: 'none',
        //         animation_speed: 0
        //     },
        //     tooltip: {
        //         disable_for_touch: true
        //     },
        //     topbar: {
        //         custom_back_text: false,
        //         is_hover: true,
        //         mobile_show_parent_link: true,
        //         scrolltop : false
        //     }
        // };
        // $(document).foundation(fd5_settings);


        $(document).foundation();

    };



    this.init = function () {
        self.layout();
        self.bindings();
        self.init_fd5();
    };

};
