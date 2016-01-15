(function () {
    'use strict';

    angular
        .module('app.MailOwnerAddModal',['lbServices'])
        .controller('MailOwnerAddModalController', MailOwnerAddModalController);

    MailOwnerAddModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner'];
    /* @ngInject */
    function MailOwnerAddModalController($scope, $modalInstance, logger, data, MailOwner) {
        var vm = this;
        
        vm.properties = data;
        vm.newMailOwner = {};
        vm.submitted = false;
        
        vm.cancel = function(){
            logger.warning('Mail Owner Add Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addMailOwnerForm.$valid){
                console.log("New Mail Owner: " + JSON.stringify(vm.newMailOwner));
                MailOwner.create(vm.newMailOwner).$promise.then(function(){         
                    logger.success('Mail Owner Add Modal: close/ok');
                    $modalInstance.close()
                });
            
            }
                
        };
        
    }
})();