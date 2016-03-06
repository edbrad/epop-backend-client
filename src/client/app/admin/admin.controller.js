/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.admin', ['app.fileInputService'])
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', '$scope', '$timeout', '$http', 'fileInputService', 
    'EDocStatement', '$q'];
    /* @ngInject */
    function AdminController(logger, $scope, $timeout, $http, fileInputService, EDocStatement, $q) {
        // establish view model
        var vm = this;
        vm.title = 'Admin';
        // work variables
        $scope.fileInputContent = "";   // storage for input file contents
        vm.statement = {};              // storage for an eDoc statement
        vm.statements = [];             // storage for eDoc statement JSON text records
        vm.totalPieces = 0;             // storage for display of Total Pieces represented in JSON file
        vm.totalPostage = 0.0;          // storage for display of Total Gross Postage represented in JSON file
        vm.strTOTALS = "";              // storage for literal
        vm.showInputStatements = false; // to toggle display of eDoc statement information
        vm.inputFileName = "";          // storage for input JSON file name
        vm.accordianGroupStatus = {
            open: true
        }
        //
        var promises = void[];          // storage for the asyncronous function list (for $q) 
        /**
         * Read input file from local file system, using the file input service
         * @param {element} the HTML element containing the type of file
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
         * Initialize view
         */
        activate();
        //
        function activate() {
            logger.info('Activated Admin View');
        }
        /**
         * Parse the input file statement
         * @param {json} the JSON file text content
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
         * Import statements into back-end Database (via LoopBack API)
         * @param {json} the JSON file text content
         */
        vm.importStatements = function () {
            promises = [deleteExistingStatements(), addNewStatements()];
            return $q.all(promises).then(function () {
                logger.success(vm.statements.length + ' Statements Successfully Imported!');
            });
        };
        /**
         * Delete any matching statements from the back-end Database (via LoopBack API)
         */
        function deleteExistingStatements(){
            for (var i = 0; i < (vm.statements.length); i++) {
                // delete any existing statements w/ the same Statement ID
                EDocStatement.find({ filter: { where: { and : [{Statement_ID: vm.statements[i].Statement_ID},{MailDate: vm.statements[i].MailDate} ] } } },
                    function (result) {
                        for (var x = 0; x < (result.length); x++) {
                            EDocStatement.deleteById({ id: result[x].id });
                        }
                    })
            }
        }
        /**
         * Add new statements to the back-end Database (via LoopBack API)
         */
        function addNewStatements() {
            for (var i = 0; i < (vm.statements.length); i++) {
                EDocStatement.create(vm.statements[i]);
            }
        }
        /**
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
         * Delete a stored statement and deduct piece & postage counts from total
         */
        vm.deleteImportStatement = function(id, pieces, postage){
            logger.log("removing statement w/ ID: " + id);
            vm.totalPieces -= pieces;
            vm.totalPostage -= postage;
            _.remove(vm.statements,{Statement_ID: id});
            if (vm.statements.length == 0){
                vm.showInputStatements = false;
                $('#JSONInputFile').val('');
                vm.inputFileName = "";
            }
        };
        /**
         * Format numbers (piece counts) w/ comma's (numeralJS library)
         * @param {number} raw number to be formatted
         * @returns {string} the input number reformatted with commas
         */
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        /**
         * Format numbers (postage) as money (numeralJS library)
         * @param {number} raw number to be formatted
         * @returns {string} the input number reformatted as US currency with $ commas and rounded decimal
         */
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.000');
        };
    }
})();
