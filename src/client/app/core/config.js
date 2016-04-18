(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    toastrConfig.$inject = ['toastr'];
    /* @ngInject */
    function toastrConfig(toastr) {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        appErrorPrefix: '[epopBackendClient Error] ',
        appTitle: 'EPOP Backend Client'
    };

    core.value('config', config);

    core.config(configure);

    configure.$inject = ['$logProvider', 'routerHelperProvider',
                         'exceptionHandlerProvider', 'uiGmapGoogleMapApiProvider'];
    /* @ngInject */
    function configure($logProvider, routerHelperProvider, exceptionHandlerProvider, uiGmapGoogleMapApiProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(config.appErrorPrefix);
        routerHelperProvider.configure({docTitle: config.appTitle + ': '});

        // configure the AngularUI Google Maps API provider
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyBZt4TvdP5brTUhUdD_R7Kbnhz2pPg7YRE',
            v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    }

})();
