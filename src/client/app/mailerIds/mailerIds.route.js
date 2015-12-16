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
                        nav: 5,
                        content: '<i class="fa fa-lock"></i> Mailer Ids'
                    }
                }
            }
        ];
    }
})();
