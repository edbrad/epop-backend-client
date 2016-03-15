/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function() {
    'use strict';

    angular
        .module('app.dailyruns')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                // display Daily Run information
                state: 'dailyruns',
                config: {
                    url: '/dailyruns',
                    templateUrl: 'app/dailyRuns/dailyRuns.html',
                    controller: 'DailyRunsController',
                    controllerAs: 'vm',
                    title: 'Daily Runs',
                    settings: {
                        nav: 9,
                        content: '<i class="fa fa-2x fa-calendar"></i> Daily Runs'
                    }
                }
            },
            {
                // display Daily Run details
                state: 'dailyRunDetails',
                config: {
                    url: '/dailyRunDetails/',
                    templateUrl: 'app/dailyRuns/dailyRunDetails.html',
                    controller: 'DailyRunDetailsController',
                    controllerAs: 'vm',
                    title: 'Daily Run Details',
                }
            }
        ];
    }
})();