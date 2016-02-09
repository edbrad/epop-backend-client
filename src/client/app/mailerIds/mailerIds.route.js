(function() {
    'use strict';

    angular
        .module('app.mailerIds')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'mailerids',
                config: {
                    url: '/mailerids',
                    templateUrl: 'app/mailerIds/mailerIds.html',
                    controller: 'MailerIdsController',
                    controllerAs: 'vm',
                    title: 'Mailer Ids',
                    settings: {
                        //nav: 5,
                        content: '<i class="fa fa-database"></i> Mailer ID&#39s'
                    }
                }
            },
            {
                // display all Mailer IDs (Card/Mobile View)
                state: 'mailerids_M',
                config: {
                    url: '/mailerids_M',
                    templateUrl: 'app/mailerIds/mailerids_M.html',
                    controller: 'MailerIdsController',
                    controllerAs: 'vm',
                    title: 'Mailer Ids',
                    settings: {
                        nav: 5,
                        content: '<i class="fa fa-database"></i> Mailer ID&#39s'
                    }
                }
            }
        ];
    }
})();
