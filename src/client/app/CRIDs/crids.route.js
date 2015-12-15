(function() {
    'use strict';

    angular
        .module('app.CRIDs')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'crids',
                config: {
                    url: '/crids',
                    templateUrl: 'app/CRIDs/crids.html',
                    controller: 'CRIDsController',
                    controllerAs: 'vm',
                    title: 'CRIDs',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-lock"></i> CRIDs'
                    }
                }
            }
        ];
    }
})();
