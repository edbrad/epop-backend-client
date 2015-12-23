(function () {
    'use strict';

    angular
        .module('app.dialogsService',['ui.bootstrap'])
        .factory('dialogsService', dialogsService);

    dialogsService.$inject = ['$modal'];
    /* @ngInject */
    function dialogsService($modal) {
        var service = {
			confirm: confirm
		};
        
        return service;
     
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
	}
})();
