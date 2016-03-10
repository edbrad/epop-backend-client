/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
   
    angular
        .module('app.dailyruns', [])
        .controller('DailyRunsController', DailyRunsController);

    DailyRunsController.$inject = ['logger', '$scope', '$timeout', '$http',  '$q', 'EDocStatement'];
    
    /* @ngInject */
    function DailyRunsController(logger, $scope, $timeout, $http, $q, EDocStatement) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        // view model properties
        vm.title = 'Daily Runs';
        
        vm.dailyRuns = [];
        vm.statements = [];
        
        vm.summaryGroupStatus = {     // to track accordian open/close status
            open: true
        }
        vm.historyGroupStatus = {     // to track accordian open/close status
            open: false
        }
        
        activate();
         
        function activate() {
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Daily Runs View');
            });
        }
        
        // collect eDoc Statements from database (filtered by current date)
        function getEDocStatements() {
            EDocStatement.find(
                function(result) {
                    vm.statements = result;
                    logger.log("Statement count: " + vm.statements.length);
                    buildDailyRunsList();
                });
        }
        
        // build a list of unique Daily Runs
        function buildDailyRunsList(){
            vm.dailyRuns = [];
            var r = -1;
            for (var i = 0; i < (vm.statements.length); i++) {
                // check if the Daily Run exists
                r = lookupDailyID(vm.statements[i].Daily_ID);
                
                // if not, create a new run
                if (r === -1){
                    console.log("not found: " + vm.statements[i].Daily_ID)
                    vm.dailyRuns.push({ Daily_ID: vm.statements[i].Daily_ID, 
                                        TotalPieceCount: vm.statements[i].TotalPieceCount,
                                        TotalPostage: vm.statements[i].TotalPostage,
                                        StatementCount: 1,
                                        MailDate: vm.statements[i].MailDate,
                                        FP_PI_PieceCount: vm.statements[i].FP_PI_PieceCount,
                                        FP_ST_PieceCount: vm.statements[i].FP_ST_PieceCount,
                                        FP_MT_PieceCount: vm.statements[i].FP_MT_PieceCount,
                                        NP_PI_PieceCount: vm.statements[i].NP_PI_PieceCount,
                                        NP_ST_PieceCount: vm.statements[i].NP_ST_PieceCount,
                                        NP_MT_PieceCount: vm.statements[i].NP_MT_PieceCount,
                                        FP_PI_Postage: vm.statements[i].FP_PI_Postage,
                                        FP_ST_Postage: vm.statements[i].FP_ST_Postage,
                                        FP_MT_Postage: vm.statements[i].FP_MT_Postage,
                                        NP_PI_Postage: vm.statements[i].NP_PI_Postage,
                                        NP_ST_Postage: vm.statements[i].NP_ST_Postage,
                                        NP_MT_Postage: vm.statements[i].NP_MT_Postage
                                      })
                }
                // otherwise, tally the piece & postage counts
                else{
                    vm.dailyRuns[r].TotalPieceCount += vm.statements[i].TotalPieceCount;
                    vm.dailyRuns[r].TotalPostage += vm.statements[i].TotalPostage;
                    vm.dailyRuns[r].StatementCount += 1;
                    vm.dailyRuns[r].FP_PI_PieceCount += vm.statements[i].FP_PI_PieceCount,
                    vm.dailyRuns[r].FP_ST_PieceCount += vm.statements[i].FP_ST_PieceCount,
                    vm.dailyRuns[r].FP_MT_PieceCount += vm.statements[i].FP_MT_PieceCount,
                    vm.dailyRuns[r].NP_PI_PieceCount += vm.statements[i].NP_PI_PieceCount,
                    vm.dailyRuns[r].NP_ST_PieceCount += vm.statements[i].NP_ST_PieceCount,
                    vm.dailyRuns[r].NP_MT_PieceCount += vm.statements[i].NP_MT_PieceCount,
                    vm.dailyRuns[r].FP_PI_Postage += vm.statements[i].FP_PI_Postage,
                    vm.dailyRuns[r].FP_ST_Postage += vm.statements[i].FP_ST_Postage,
                    vm.dailyRuns[r].FP_MT_Postage += vm.statements[i].FP_MT_Postage,
                    vm.dailyRuns[r].NP_PI_Postage += vm.statements[i].NP_PI_Postage,
                    vm.dailyRuns[r].NP_ST_Postage += vm.statements[i].NP_ST_Postage,
                    vm.dailyRuns[r].NP_MT_Postage += vm.statements[i].NP_MT_Postage
                }
            }
            logger.log("Unique Daily Runs: " + JSON.stringify(vm.dailyRuns)) 
        }
        // 
        function lookupDailyID(dailyId){
            for (var i = 0; i < vm.dailyRuns.length; i++) {
                if (vm.dailyRuns[i].Daily_ID == dailyId) {
                    return i;
                }
            }
            return -1;
        }

    }
})();
