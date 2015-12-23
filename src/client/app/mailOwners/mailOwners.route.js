(function() {
    'use strict';

    angular
        .module('app.mailOwners')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'mailOwners',
                config: {
                    url: '/mailowners',
                    templateUrl: 'app/mailOwners/mailOwners.html',
                    controller: 'MailOwnersController',
                    controllerAs: 'vm',
                    title: 'Mail Owners',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-database"></i> Mail Owners'
                    }
                }
            },
            {
                state: 'mailOwnerDetail',
                config: {
                    url: '/mailowners/:id',
                    templateUrl: 'app/mailOwners/mailOwnerDetail.html',
                    controller: 'MailOwnerDetailController',
                    controllerAs: 'vm',
                    title: 'Mail Owner Detail'
                }
            }
        ];
    }
})();
