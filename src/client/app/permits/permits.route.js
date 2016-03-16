/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
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
                        content: '<i class="fa fa-2x fa-fw fa-shield"></i> Permits'
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
                        content: '<i class="fa fa-2x fa-fw fa-shield"></i> Permits'
                    }
                }
            }
        ];
    }
})();
