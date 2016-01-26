(function () {
    'use strict';

    angular
        .module('app.MailerIdDeleteModal',['lbServices'])
        .controller('MailerIdDeleteModalController', MailerIdDeleteModalController);

    MailerIdDeleteModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailerID'];
    /* @ngInject */
    function MailerIdDeleteModalController($scope, $modalInstance, logger, data, MailerID) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the CRID View, which invoked this dialog
        vm.properties = data;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mailer ID delete Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        
        // perform 'DELETE' processing (remove Permit, then close the dialog)
        vm.delete = function(id){
            console.log('Deleting Mailer ID w/ id: ' + id);
            
            // delete the Permit
            MailerID.deleteById({id: id}).$promise.then(function(){         
                console.log('Deleted Mailer Id');
                $modalInstance.close()
            });
            
        }; 
        
    }
})();