/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
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
                    url: '/statements/:view',
                    templateUrl: 'app/statements/statements.html',
                    controller: 'StatementsController',
                    controllerAs: 'vm',
                    title: 'eDoc Statements',
                    settings: {
                        //nav: 2,
                        content: '<i class="fa fa-2x fa-file-text-o"></i> eDoc Statements'
                    }
                }
            },
            {
                // display all Statements (Card/Mobile View)
                state: 'statements_M',
                config: {
                    url: '/statements_M/:view',
                    templateUrl: 'app/statements/statements_M.html',
                    controller: 'StatementsController',
                    controllerAs: 'vm',
                    title: 'eDoc Statements',
                    settings: {
                        nav: 6,
                        content: '<i class="fa fa-2x fa-file-text-o"></i> eDoc Statements'
                    }
                }
            },
            {
                // display Statement detail
                state: 'statementDetail',
                config: {
                    url: '/statementDetail/:id',
                    templateUrl: 'app/statements/statementDetail.html',
                    controller: 'StatementDetailController',
                    controllerAs: 'vm',
                    title: 'eDoc Statement Detail',
                }
            }
        ];
    }
})();
