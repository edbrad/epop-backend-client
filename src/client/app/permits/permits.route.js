(function() {
    'use strict';

    angular
        .module('app.permits')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                // display all Permits
                state: 'permits',
                config: {
                    url: '/permits',
                    templateUrl: 'app/permits/permits.html',
                    controller: 'PermitsController',
                    controllerAs: 'vm',
                    title: 'Permits',
                    settings: {
                        //nav: 4,
                        content: '<i class="ion ion-document-text"></i> Permits'
                    }
                }
            },
            {
                // display all Permits (Card/Mobile View)
                state: 'permits_M',
                config: {
                    url: '/permits_M',
                    templateUrl: 'app/permits/permits_M.html',
                    controller: 'PermitsController',
                    controllerAs: 'vm',
                    title: 'Permits',
                    settings: {
                        nav: 4,
                        content: '<i class="ion ion-document-text"></i> Permits'
                    }
                }
            }
        ];
    }
})();
