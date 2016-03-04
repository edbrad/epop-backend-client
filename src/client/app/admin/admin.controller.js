(function () {
    'use strict';

    angular
        .module('app.admin', ['app.fileInputService'])
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', '$scope', '$timeout', '$http', 'fileInputService', 'EDocStatement'];
    /* @ngInject */
    function AdminController(logger, $scope, $timeout, $http, fileInputService, EDocStatement) {
        var vm = this;
        vm.title = 'Admin';
        
        //
        $scope.fileInputContent = "";
        vm.statement = {};
        vm.statements = [];
        vm.totalPieces = 0;
        vm.totalPostage = 0.0;
        vm.strTOTALS = "";
        vm.showInputStatements = false;
        
        //
        $scope.onFileUpload = function (element) {
            $scope.$apply(function (scope) {
                var file = element.files[0];
                fileInputService.readTextFileAsync(file).then(function (fileInputContent) {
                    $scope.fileInputContent = fileInputContent;
                    processStatementData($scope.fileInputContent);
                });
            });
        }

        activate();
        
        //
        function activate() {
            logger.info('Activated Admin View');
        }
        
        //
        function processStatementData(json) {
            var allTextLines = json.split(/\r\n|\n/);
            vm.statements = [];
            vm.totalPieces = 0;
            vm.totalPostage = 0.0;
            
            for (var i = 0; i < (allTextLines.length - 1); i++) {
                /*var JSONObj = JSON.parse(allTextLines[i]);*/
                var JSONObj = angular.fromJson(allTextLines[i]);
                vm.totalPieces += JSONObj.TotalPieceCount;
                vm.totalPostage += JSONObj.TotalPostage;
                vm.statements.push(JSONObj);
            }
            
            vm.strTOTALS = "TOTALS";
            vm.showInputStatements = true;
        }
        
        //
        vm.importStatements = function () {
            for (var i = 0; i < (vm.statements.length - 1); i++) {
                logger.log("checking for statement w/ID: " + vm.statements[i].Statement_ID);
                EDocStatement.find({ where: { Statement_ID: vm.statements[i].Statement_ID }},
                    function (result) {
                        
                            logger.log("Existing Statement Found: " + JSON.stringify(result));
                        
                })
            }
        };
        
        //
        vm.clearStatements = function(){
            vm.statements = [];
            $('#JSONInputFile').val('');
            vm.strTOTALS = "";
            vm.totalPieces = null;
            vm.totalPostage = null;
            vm.showInputStatements = false;
        };
        
        //
        vm.deleteImportStatement = function(id, pieces, postage){
            logger.log("removing statement w/ ID: " + id);
            vm.totalPieces -= pieces;
            vm.totalPostage -= postage;
            _.remove(vm.statements,{Statement_ID: id});
            if (vm.statements.length == 0){
                vm.showInputStatements = false;
                $('#JSONInputFile').val('');
            }
        };
        
        // format numbers (piece counts) w/ comma's (numeralJS library)
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        
        // format numbers (postage) as money (numeralJS library)
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.000');
        };
        
    }
})();
