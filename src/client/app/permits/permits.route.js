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
                        nav: 4,
                        content: '<i class="fa fa-database"></i> Permits'
                    }
                }
            }
        ];
    }
})();
