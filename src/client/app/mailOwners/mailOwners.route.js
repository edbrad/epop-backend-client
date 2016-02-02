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
                // display all Mail Owners (Grid View)
                state: 'mailOwners',
                config: {
                    url: '/mailowners',
                    templateUrl: 'app/mailOwners/mailOwners.html',
                    controller: 'MailOwnersController',
                    controllerAs: 'vm',
                    title: 'Mail Owners',
                    settings: {
                        //nav: 2,
                        content: '<i class="fa fa-database"></i> Mail Owners'
                    }
                }
            },
            {
                // display all Mail Owners (Card/Mobile View)
                state: 'mailOwners_M',
                config: {
                    url: '/mailowners_M',
                    templateUrl: 'app/mailOwners/mailOwners_M.html',
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
                // display details for a single Mail Owner (using id)
                state: 'mailOwnerDetail',
                config: {
                    url: '/mailowners/:id',
                    templateUrl: 'app/mailOwners/mailOwnerDetail.html',
                    controller: 'MailOwnerDetailController',
                    controllerAs: 'vm',
                    title: 'Mail Owner Detail',
                    // pre-load Google Maps public API (Internet)
                    resolve: {
                        maps: ['uiGmapGoogleMapApi', function(uiGmapGoogleMapApi){
                            return uiGmapGoogleMapApi;
                        }]
                    }
                }
            }
        ];
    }
})();
