(function () {
    'use strict';

    angular
        .module('app.statementDetail', ['lbServices'])
        .controller('StatementDetailController', StatementDetailController);
        
    StatementDetailController.$inject = ['$q', 'EDocStatement', 'logger', '$scope', '$stateParams'];
    /* @ngInject */
    function StatementDetailController($q, EDocStatement, logger, $scope, $stateParams) {
        // establish View Model
        var vm = this;
        
        // assign View Title
        vm.title = 'eDoc Statement Detail';
        
        // storage for the selected Statement
        vm.statement = {};
		
		// storage for the asynchronous functions list (for $q)
        var promises = void[];
        
        vm.postageDetails_A = [];
        vm.postageDetails_B = [];
        
       
	   // activate/initialize view
       getPostageDetails();
       activate();
        
        function activate() {
            promises = [getStatement()];
            return $q.all(promises).then(function() {
               logger.info('Activated eDoc Statement Detail View'); 
            }) 
        }
		
		// collect selected Statement from database
        function getStatement() {
            EDocStatement.findById({id: $stateParams.id},
                function (result) {
                    vm.statement = result;
                    console.log(vm.statement);
                });
        }
        
        // build postage details
        function getPostageDetails(){
            
            vm.postageDetails_A = [];
            vm.postageDetails_A.push({"PS3602": "A1", "Entry": "None", "Category": "5-Digit", "Price":"$0.261", "Count":"1,000", "Postage":"$261.00"});
            vm.postageDetails_A.push({"PS3602": "A2", "Entry": "None", "Category": "3-Digit", "Price":"$0.279", "Count":"1,000", "Postage":"$279.00"});
            vm.postageDetails_A.push({"PS3602": "A3", "Entry": "None", "Category": "AADC", "Price":"$0.279", "Count":"1,000", "Postage":"$279.00"});
            vm.postageDetails_A.push({"PS3602": "A4", "Entry": "None", "Category": "Mixed AADC", "Price":"$0.301", "Count":"1,000", "Postage":"$301.00"});
            vm.postageDetails_A.push({"PS3602": "A5", "Entry": "DNDC", "Category": "5-Digit", "Price":"$0.227", "Count":"1,000", "Postage":"$227.00"});
            vm.postageDetails_A.push({"PS3602": "A6", "Entry": "DNDC", "Category": "3-Digit", "Price":"$0.245", "Count":"1,000", "Postage":"$245.00"});
            vm.postageDetails_A.push({"PS3602": "A7", "Entry": "DNDC", "Category": "AADC", "Price":"$0.245", "Count":"1,000", "Postage":"$245.00"});
            vm.postageDetails_A.push({"PS3602": "A8", "Entry": "DNDC", "Category": "Mixed AADC", "Price":"$0.267", "Count":"1,000", "Postage":"$267.00"});
            vm.postageDetails_A.push({"PS3602": "A9", "Entry": "DSCF", "Category": "5-Digit", "Price":"$0.217", "Count":"1,000", "Postage":"$217.00"});
            vm.postageDetails_A.push({"PS3602": "A10", "Entry": "DSCF", "Category": "3-Digit", "Price":"$0.235", "Count":"1,000", "Postage":"$235.00"});
            vm.postageDetails_A.push({"PS3602": "A11", "Entry": "DSCF", "Category": "AADC", "Price":"$0.225", "Count":"1,000", "Postage":"$225.00"});
            
            vm.postageDetails_B = [];
            vm.postageDetails_B.push({"PS3602": "B1", "Entry": "None", "Category": "AADC", "Price":"$0.291", "Count":"1,000", "Postage":"$291.00"});
            vm.postageDetails_B.push({"PS3602": "B2", "Entry": "None", "Category": "Mixed AADC", "Price":"$0.309", "Count":"1,000", "Postage":"$309.00"});
            vm.postageDetails_B.push({"PS3602": "B3", "Entry": "DNDC", "Category": "AADC", "Price":"$0.257", "Count":"1,000", "Postage":"$257.00"});
            vm.postageDetails_B.push({"PS3602": "B4", "Entry": "DNDC", "Category": "Mixed AADC", "Price":"$0.275", "Count":"1,000", "Postage":"$275.00"});
            vm.postageDetails_B.push({"PS3602": "B5", "Entry": "DSCF", "Category": "AADC", "Price":"$0.246", "Count":"1,000", "Postage":"$246.00"});
            
        }
	}
})();