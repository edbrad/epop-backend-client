(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices', 'dialogsService', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('MailOwnerDetailController', MailOwnerDetailController);

    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'dialogsService', 'logger', '$scope', '$stateParams'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, dialogs, logger, $scope, $stateParams) {
        var vm = this;
        vm.title = 'Mail Owner Detail';
        vm.mailOwner = [];
        
        vm.click = function(){
            dialogs.confirm('Are you sure about what you are doing?', 'Click?', ['OK', 'CANCEL'])
            .then(function(){
                console.log("modal test");
            });
        };
        
        activate();
        
        function activate() {
            var promises = [getMailOwner()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owner Detail View');
            });
        }
        
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
    }
})();
