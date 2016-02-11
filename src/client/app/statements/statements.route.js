(function() {
    'use strict';

    angular
        .module('app.statements')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                // display all Statements (Grid View)
                state: 'statements',
                config: {
                    url: '/statements',
                    templateUrl: 'app/statements/statements.html',
                    controller: 'StatementsController',
                    controllerAs: 'vm',
                    title: 'eDoc Statements',
                    settings: {
                        //nav: 2,
                        content: '<i class="ion ion-document-text"></i> eDoc Statements'
                    }
                }
            },
            {
                // display all Statements (Card/Mobile View)
                state: 'statements_M',
                config: {
                    url: '/statements_M',
                    templateUrl: 'app/statements/statements_M.html',
                    controller: 'StatementsController',
                    controllerAs: 'vm',
                    title: 'eDoc Statements',
                    settings: {
                        nav: 6,
                        content: '<i class="ion ion-document-text"></i> eDoc Statements'
                    }
                }
            }
        ];
    }
})();
