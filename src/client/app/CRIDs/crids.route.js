/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
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
                        content: '<i class="fa fa-2x fa-clone"></i> CRID&#39s'
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
                        content: '<i class="fa fa-2x fa-clone"></i> CRID&#39s'
                    }
                }
            }
        ];
    }
})();
