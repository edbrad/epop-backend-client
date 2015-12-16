(function () {
    'use strict';

    angular
        .module('app.CRIDs', ['lbServices'])
        .controller('CRIDsController', CRIDsController);

    CRIDsController.$inject = ['$q', 'CRID', 'logger'];
    /* @ngInject */
    function CRIDsController($q, CRID, logger) {
        var vm = this;
        
        vm.title = 'CRIDs';
        vm.CRIDs = [];
        
        activate();
        
        function activate() {
            var promises = [getCRIDs()];
            return $q.all(promises).then(function() {
                logger.info('Activated CRIDs View');
            });
        }
        
        function getCRIDs() {
            CRID.find(
                function (result) {
                    vm.CRIDs = result;
                });
        }
    }
})();
