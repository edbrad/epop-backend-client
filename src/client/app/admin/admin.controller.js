/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
    
    /**
     * @class app.admin
     * @memberOf app
     * 
     * @description
     *
     * The `admin` module provides administrative and utility functionality for the application.
     * 
     * @requires
     *   - fileInputService: reads a file from the local file system
     *
     */
    angular
        .module('app.admin', ['app.fileInputService'])
        /**
         * @ngdoc controller
         * @name app.admin.controller:AdminController
         * @description
         * 
         * Controller for Admin View
         * 
         */
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', '$scope', '$timeout', '$http', 'fileInputService', 
    'EDocStatement', '$q'];
    
    /* @ngInject */
    function AdminController(logger, $scope, $timeout, $http, fileInputService, EDocStatement, $q) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        // view model properties
        vm.title = 'Admin';
        vm.statement = {};              // storage for an eDoc statement
        vm.statements = [];             // storage for eDoc statement JSON text records
        vm.totalPieces = 0;             // storage for display of Total Pieces represented in JSON file
        vm.totalPostage = 0.0;          // storage for display of Total Gross Postage represented in JSON file
        vm.strTOTALS = "";              // storage for literal
        vm.showInputStatements = false; // to toggle display of eDoc statement information
        vm.inputFileName = "";          // storage for input JSON file name
        vm.accordianGroupStatus = {     // to track accordian open/close status
            open: true
        }
        vm.fileInputContent = "";       // storage for input file contents
        
        /**
         * @ngdoc method
         * @name onFileUpload
         * @methodOf app.admin.AdminController
         * @param {Object} element - The HTML5 element
         * @description
         * 
         * Return a function that reads as input file from local file system, using the file input service
         */
        $scope.onFileUpload = function (element) {
            $scope.fileInputContent = null;
            vm.statements = [];
            vm.strTOTALS = "";
            vm.totalPieces = null;
            vm.totalPostage = null;
            vm.showInputStatements = false;
            vm.inputFileName = "";
            $scope.$apply(function (scope) {
                var file = element.files[0];
                fileInputService.readTextFileAsync(file).then(function (fileInputContent) {
                    $scope.fileInputContent = fileInputContent;
                    processStatementData($scope.fileInputContent);
                    var input = document.getElementById("JSONInputFile");
                    var file = input.value.split("\\");
                    vm.inputFileName = file[file.length-1];
                });
            });
        }
        /**
         * @ngdoc method
         * @name importStatements
         * @methodOf app.admin:AdminController 
         * @description
         * 
         * Import statements into back-end Database (via LoopBack API)
         */
        vm.importStatements = function () {
            promises = [deleteExistingStatements(), addNewStatements()];
            return $q.all(promises).then(function () {
                logger.success(vm.statements.length + ' Statements Successfully Imported!');
            });
        };
        
        /**
         * @ngdoc method
         * @name clearStatements
         * @methodOf app.admin:AdminController 
         * @decription
         * 
         * Clear statement storage and tallied totals
         */
        vm.clearStatements = function(){
            vm.statements = [];
            $('#JSONInputFile').val('');
            vm.strTOTALS = "";
            vm.totalPieces = null;
            vm.totalPostage = null;
            vm.showInputStatements = false;
            vm.inputFileName = "";
        };
        /**
         * @ngdoc method
         * @name deleteImportStatement 
         * @methodOf app.admin:AdminController 
         * @description
         * 
         * Delete a stored statement and deduct piece & postage counts from total
         */
        vm.deleteImportStatement = function(id, pieces, postage){
            logger.log("removing statement w/ ID: " + id);
            // deduct pieces and postage from total for imported file
            vm.totalPieces -= pieces;
            vm.totalPostage -= postage;
            // remove statement from the the list (using lodash library: http://lodash.com)
            _.remove(vm.statements,{Statement_ID: id});
            // if removal results in no more statements, clear the display information altogther
            if (vm.statements.length == 0){
                vm.showInputStatements = false;
                $('#JSONInputFile').val('');
                vm.inputFileName = "";
            }
        };
        /**
         * @ngdoc method
         * @name numberFormat 
         * @methodOf app.admin:AdminController 
         * @description
         * 
         * Format numbers (piece counts) w/ comma's (using numeralJS library: http://numeraljs.com)
         */
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        /**
         * @ngdoc method
         * @name currencyFormat 
         * @methodOf app.admin:AdminController
         * @description
         * 
         * Format numbers (postage) as money (using numeralJS library: http://numeraljs.com)
         */
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.000');
        };
        
        
        //
        activate();
         
        /**
         * @ngdoc method
         * @name activate 
         * @methodOf app.admin:AdminController
         * @desription 
         * 
         * Initialize the view
         */
        function activate() {
            logger.info('Activated Admin View');
        }
        /**
         * @ngdoc method
         * @name processStatementData
         * @methodOf app.admin:AdminController
         * @description
         * 
         * Parse the input file's eDoc Statement JSON data into individual objects
         */
        function processStatementData(json) {
            // initialize variables
            vm.statements = [];
            vm.totalPieces = 0;
            vm.totalPostage = 0.0;
            // parse file contents (JSON) into plain text w/ CR/LF
            var allTextLines = json.split(/\r\n|\n/);
            // tally each statment and add it to the list for display and DB insert
            for (var i = 0; i < (allTextLines.length - 1); i++) {
                var JSONObj = angular.fromJson(allTextLines[i]);
                vm.totalPieces += JSONObj.TotalPieceCount;
                vm.totalPostage += JSONObj.TotalPostage;
                vm.statements.push(JSONObj);
            }
            // display the summary in the view
            vm.strTOTALS = "TOTALS";
            vm.showInputStatements = true;
        }
        
        /**
         * @ngdoc method
         * @name deleteExistingStatements 
         * @methodOf app.admin:AdminController
         * @description
         * 
         * Delete any matching statements from the back-end Database (via LoopBack API)
         */
        function deleteExistingStatements(){
            for (var i = 0; i < (vm.statements.length); i++) {
                // delete any existing statements w/ the same Statement ID & date
                EDocStatement.find({ filter: { where: { and : [{Statement_ID: vm.statements[i].Statement_ID},{MailDate: vm.statements[i].MailDate} ] } } },
                    function (result) {
                        for (var x = 0; x < (result.length); x++) {
                            EDocStatement.deleteById({ id: result[x].id });
                        }
                    })
            }
        }
        /**
         * @ngdoc method
         * @name addNewStatements 
         * @methodOf app.admin:AdminController
         * @description
         * 
         * Add new statements to the back-end Database (via LoopBack API)
         */
        function addNewStatements() {
            for (var i = 0; i < (vm.statements.length); i++) {
                EDocStatement.create(vm.statements[i]);
            }
        }
       
    }
})();
