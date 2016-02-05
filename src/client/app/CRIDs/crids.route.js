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
                // display all CRIDs
                state: 'crids',
                config: {
                    url: '/crids',
                    templateUrl: 'app/CRIDs/crids.html',
                    controller: 'CRIDsController',
                    controllerAs: 'vm',
                    title: 'CRIDs',
                    settings: {
                        //nav: 3,
                        content: '<i class="fa fa-database"></i> CRID&#39s'
                    }
                }
            },
            {
                // display all CRIDs (Card/Mobile View)
                state: 'crids_M',
                config: {
                    url: '/crids_M',
                    templateUrl: 'app/CRIDs/crids_M.html',
                    controller: 'CRIDsController',
                    controllerAs: 'vm',
                    title: 'CRIDs',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-database"></i> CRID&#39s'
                    }
                }
            }
        ];
    }
})();
