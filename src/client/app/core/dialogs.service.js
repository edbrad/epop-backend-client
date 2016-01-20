(function () {
    'use strict';

    angular
        .module('app.dialogsService',['ui.bootstrap'])
        .factory('dialogsService', dialogsService);

    dialogsService.$inject = ['$modal'];
    /* @ngInject */
    function dialogsService($modal) {
		// exposed service methods
        var service = {
			confirm: confirm,
			addMailOwner: addMailOwner,
			deleteMailOwner: deleteMailOwner
		};
        
        return service;
     	
		// generic confirm Modal Window
	 	function confirm(message, title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/core/confirmModal.html',
				controller: 'ConfirmModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							message: message,
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
		 // add Mail Owner Modal Window
		 function addMailOwner(title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailOwners/mailOwnerAddModal.html',
				controller: 'MailOwnerAddModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
		 // delete Mail Owner Modal Window
		 function deleteMailOwner(title, message, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailOwners/mailOwnerDeleteModal.html',
				controller: 'MailOwnerDeleteModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							message: message,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
	}
})();
