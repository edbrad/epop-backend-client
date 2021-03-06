/* jshint -W106, -W014, -W117 */ 
(function () {
    'use strict';
    
    /**
     * @class app.dailyruns
     * @memberOf app
     * 
     * @description
     *
     * The `dailyruns` module provides an overview of Daily EPOP Runs.
     * 
     * @requires
     *   
     * lbServices (Loopback API service)
     * chart.js (charting library)
     *
     */   
    angular
        .module('app.dailyruns', ['lbServices', 'chart.js'])
        /**
         * @ngdoc controller
         * @name app.dailyruns.controller:DailyRunsController
         * @param {object} logger: Internal Logging Service 
         * @param {object} $scope: Angular Scope object
         * @param {object} $timeout: Angular timming object
         * @param {object} $q: Angular Asyncronous execution support
         * @param {object} EDocStatement: eDoc statement JSON object
         * @param {object} $rootScope: Aguluar global scope variable
         * @param {object} $state: Routing state 
         * @description
         * 
         * Controller for DailyRuns View
         * 
         */
        .controller('DailyRunsController', DailyRunsController)
        .filter('DateReformatFilter', DateReformatFilter);

    DailyRunsController.$inject = ['logger', '$scope', '$timeout', 
                                   '$http',  '$q', 'EDocStatement', 
                                   '$rootScope', '$state'];
    
    /* @ngInject */
    function DailyRunsController(logger, $scope, $timeout, $http, $q, EDocStatement, $rootScope, $state) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        var currentDate = new Date();
        
        // view model properties
        vm.title = 'Daily Runs';
        
        vm.dailyRuns = [];
        vm.statements = [];
        
        vm.summaryGroupStatus = {     // to track accordian open/close status
            open: true
        };
        vm.historyGroupStatus = {     // to track accordian open/close status
            open: true
        };
        
        vm.totalFP_PI_PieceCount = 0;
        vm.totalFP_ST_PieceCount = 0;
        vm.totalFP_MT_PieceCount = 0;
        vm.totalNP_PI_PieceCount = 0;
        vm.totalNP_ST_PieceCount = 0;
        vm.totalNP_MT_PieceCount = 0;
        vm.allPieceCount = 0;
        vm.FP_PI_PiecePct = 0.0;
        vm.FP_ST_PiecePct = 0.0;
        vm.FP_MT_PiecePct = 0.0;
        vm.NP_PI_PiecePct = 0.0;
        vm.NP_ST_PiecePct = 0.0;
        vm.NP_MT_PiecePct = 0.0;
        
        // Pie Chart
        var x = 99999;
        vm.pieLabels = ['Profit Permit Imprint', 'Profit Stamp", "Profit Meter',
                        'Non-Profit Permit Imprint', 'Non-Profit Stamp', 'Non-Profit Meter'];
        vm.pieData = [300, 500, 100, 300, 500, 100];
        vm.pieColors = ['#00ff00', '#ff9900', '#00ffff', '#ffff00', '#cc99ff', '#ff00ff'];
        vm.pieOptions = {
            //Number - The percentage of the chart that we cut out of the middle
            percentageInnerCutout : 50, // This is 0 for Pie charts
            tooltipTemplate: '<%= label %>: <%= value %>%',
            
        };
        
        $scope.showDailyRunDetails = function(dailyID, mailDate){
            /*alert("Hello Details!");*/
            $rootScope.dailyRun = {
                'dailyID': dailyID,
                'mailDate': mailDate
            };
            $state.go('dailyRunDetails');  
        };
        
        // initialize UI Grid layout/formatting options                            
        $scope.gridOptions = {
            paginationPageSizes: [10, 20, 100],
            rowHeight: 40,
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {
                    field: 'Daily_ID', displayName: 'Daily Run ID', 
                    cellTemplate: '<div tooltip-placement="bottom" tooltip-append-to-body="true" '
                    + 'uib-tooltip="View the Daily Run Details ' 
                    + 'class="ui-grid-cell-contents" style="padding: 5px; a:hover{color:red; '
                    + 'background-color:blue; text-decoration:underline};">'
                    + '<a ng-click="grid.appScope.showDailyRunDetails(row.entity.Daily_ID, ' 
                    + 'row.entity.MailDate)">{{ row.entity.Daily_ID }}</a></div>', width: '*'
                },
                {name: 'StatementCount', displayName: '# of Statements', width: 150},
                {name: 'MailDate', displayName: 'Mail Date', width: 110, cellFilter: 'DateReformatFilter'},
                {name: 'TotalPieceCount', displayName: 'Pieces', width: 120, cellFilter: 'number: 0'},
                {name: 'TotalPostage', displayName: 'Postage', width: 120, cellFilter: 'currency:"$" : 3' }  
            ],
            enableGridMenu: true,
            enableFiltering: true,
            enableSelectAll: true,
            exporterCsvFilename: 'MailOwners_' 
                                 + '' 
                                 + (currentDate.getMonth()+1) 
                                 + '-'
                                 + currentDate.getDate() 
                                 + '-'
                                 + currentDate.getFullYear() 
                                 + '-'  
                                 + currentDate.getHours() 
                                 + '-'  
                                 + currentDate.getMinutes() 
                                 + '-' 
                                 + currentDate.getSeconds() 
                                 + '.csv',
            exporterPdfDefaultStyle: {fontSize: 9},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfHeader: { 
                text: 'EMS EPOP Backend Client - Daily Runs', 
                style: 'headerStyle', 
                alignment: 'center', margin: [2, 12]
            },
            exporterPdfFooter: function ( currentPage, pageCount ) {
                return { 
                    text: currentPage.toString() + ' of ' + pageCount.toString(), 
                    style: 'footerStyle', alignment: 'center' 
                };
            },
            exporterPdfCustomFormatter: function ( docDefinition ) {
                docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                return docDefinition;
            },
            exporterPdfOrientation: 'landscape',
            exporterPdfPageSize: 'LETTER',
            exporterPdfMaxGridWidth: 620,
            exporterCsvLinkElement: angular.element(document.querySelectorAll('.custom-csv-link-location')),
                onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };
        
        activate();
        /**
         * @ngdoc method
         * @name activate
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @description
         * 
         * initalize the view
         */ 
        function activate() {
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Daily Runs View');
            });
        }
        
        /**
         * @ngdoc method
         * @name getEDocStatements
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @description
         * 
         * collect eDoc Statements from database and Group into a Daily Run list
         */ 
        function getEDocStatements() {
            EDocStatement.find(
                function(result) {
                    vm.statements = result;
                    logger.log('Statement count: ' + vm.statements.length);
                    buildDailyRunsList();
                    buildChartData();
                    console.log ('chart totals: ' + vm.pieData);
                    $scope.gridOptions.data = vm.dailyRuns;
                });
        }
        
        /**
         * @ngdoc method
         * @name buildDailyRunsList
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @description
         * 
         * build a list of unique Daily Runs // TODO: refactor into a Daily Run Service
         */ 
        function buildDailyRunsList(){
            vm.dailyRuns = [];
            var r = -1;
            for (var i = 0; i < (vm.statements.length); i++) {
                // check if the Daily Run exists
                r = lookupDailyID(vm.statements[i].Daily_ID, vm.statements[i].MailDate);
                
                // if not, create a new run
                if (r === -1){
                    console.log('not found: ' + vm.statements[i].Daily_ID);
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
                                      });
                    //
                    vm.totalFP_PI_PieceCount += vm.statements[i].FP_PI_PieceCount;
                    vm.totalFP_ST_PieceCount += vm.statements[i].FP_ST_PieceCount;
                    vm.totalFP_MT_PieceCount += vm.statements[i].FP_MT_PieceCount;
                    vm.totalNP_PI_PieceCount += vm.statements[i].NP_PI_PieceCount;
                    vm.totalNP_ST_PieceCount += vm.statements[i].NP_ST_PieceCount;
                    vm.totalNP_MT_PieceCount += vm.statements[i].NP_MT_PieceCount;
                }
                // otherwise, tally the piece & postage counts
                else{
                    vm.dailyRuns[r].TotalPieceCount += vm.statements[i].TotalPieceCount;
                    vm.dailyRuns[r].TotalPostage += vm.statements[i].TotalPostage;
                    vm.dailyRuns[r].StatementCount += 1;
                    vm.dailyRuns[r].FP_PI_PieceCount += vm.statements[i].FP_PI_PieceCount;
                    vm.dailyRuns[r].FP_ST_PieceCount += vm.statements[i].FP_ST_PieceCount;
                    vm.dailyRuns[r].FP_MT_PieceCount += vm.statements[i].FP_MT_PieceCount;
                    vm.dailyRuns[r].NP_PI_PieceCount += vm.statements[i].NP_PI_PieceCount;
                    vm.dailyRuns[r].NP_ST_PieceCount += vm.statements[i].NP_ST_PieceCount;
                    vm.dailyRuns[r].NP_MT_PieceCount += vm.statements[i].NP_MT_PieceCount;
                    vm.dailyRuns[r].FP_PI_Postage += vm.statements[i].FP_PI_Postage;
                    vm.dailyRuns[r].FP_ST_Postage += vm.statements[i].FP_ST_Postage;
                    vm.dailyRuns[r].FP_MT_Postage += vm.statements[i].FP_MT_Postage;
                    vm.dailyRuns[r].NP_PI_Postage += vm.statements[i].NP_PI_Postage;
                    vm.dailyRuns[r].NP_ST_Postage += vm.statements[i].NP_ST_Postage;
                    vm.dailyRuns[r].NP_MT_Postage += vm.statements[i].NP_MT_Postage;
                    //
                    vm.totalFP_PI_PieceCount += vm.statements[i].FP_PI_PieceCount;
                    vm.totalFP_ST_PieceCount += vm.statements[i].FP_ST_PieceCount;
                    vm.totalFP_MT_PieceCount += vm.statements[i].FP_MT_PieceCount;
                    vm.totalNP_PI_PieceCount += vm.statements[i].NP_PI_PieceCount;
                    vm.totalNP_ST_PieceCount += vm.statements[i].NP_ST_PieceCount;
                    vm.totalNP_MT_PieceCount += vm.statements[i].NP_MT_PieceCount;
                }
            }
            logger.log('Unique Daily Runs: ' + JSON.stringify(vm.dailyRuns));
            
            // save Daily Runs on the root scope for access from the dailyRunDetails Controller
            $rootScope.dailyRuns = vm.dailyRuns;  
        }
        /**
         * @ngdoc method
         * @name lookupDailyID
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @returns {number} the index of the Daily ID
         * @description
         * 
         * search for a given Daily_ID. If found, return the index (-1 = not found)
         */ 
        function lookupDailyID(dailyId, mailDate){
            for (var i = 0; i < vm.dailyRuns.length; i++) {
                if ((vm.dailyRuns[i].Daily_ID === dailyId) && (vm.dailyRuns[i].MailDate === mailDate)) {
                    return i;
                }
            }
            return -1;
        } 
        
        /**
         * @ngdoc method
         * @name buildChartData
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @description
         * 
         * collect data for charts
         */ 
        function buildChartData(){
            vm.pieData = [];
            vm.allPieceCount = 
            vm.totalFP_PI_PieceCount + vm.totalFP_ST_PieceCount + vm.totalFP_MT_PieceCount +
            vm.totalNP_PI_PieceCount + vm.totalNP_ST_PieceCount + vm.totalNP_MT_PieceCount;
            
            vm.FP_PI_PieceCountPct = 
            numeral(vm.totalFP_PI_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.FP_ST_PieceCountPct = 
            numeral(vm.totalFP_ST_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.FP_MT_PieceCountPct = 
            numeral(vm.totalFP_MT_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.NP_PI_PieceCountPct = 
            numeral(vm.totalNP_PI_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.NP_ST_PieceCountPct = 
            numeral(vm.totalNP_ST_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.NP_MT_PieceCountPct = 
            numeral(vm.totalNP_MT_PieceCount / vm.allPieceCount).format('0.000%').replace('%','');
            vm.pieData.push(vm.FP_PI_PieceCountPct);
            vm.pieData.push(vm.FP_ST_PieceCountPct);
            vm.pieData.push(vm.FP_MT_PieceCountPct);
            vm.pieData.push(vm.NP_PI_PieceCountPct);
            vm.pieData.push(vm.NP_ST_PieceCountPct);
            vm.pieData.push(vm.NP_MT_PieceCountPct);
        }
        
        /**
         * @ngdoc method
         * @name numberFormat
         * @methodOf app.dailyruns.controller:DailyRunsController
         * @returns {string} number formatted with comma's
         * @description
         * 
         * format numbers (piece counts) w/ comma's (numeralJS library)
         */ 
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        }; 
    }
   
    // FILTER - Date Reformat
    function DateReformatFilter() {
        return function(date) {
            var refmtDate = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
            return moment(refmtDate).format('MM/DD/YYYY');
        };
    }
})();
