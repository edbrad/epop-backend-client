/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W074, -W071 */
(function () {
    'use strict';

    angular
        .module('app.mailOwnerDetail', ['lbServices', 'app.dialogsService', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.exporter'])
        .controller('MailOwnerDetailController', MailOwnerDetailController)
        .filter('DateReformatFilter', DateReformatFilter);
        
    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'EDocStatement', 'logger', '$scope', '$stateParams', 'dialogsService', 'maps', '$timeout'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, EDocStatement, logger, $scope, $stateParams, dialog, maps, $timeout) {
        // establish View Model
        var vm = this;
        
        // assign View Title
        vm.title = 'Mail Owner Detail';
        
        // storage for the selected Mail Owner
        vm.mailOwner = {};
        vm.mailOwnerAddress = "";
        
        // storage for eDoc Statements (filterd for currrent Mail Owner)
        vm.eDocStatements = [];
        vm.CRIDs = [];
               
        // storage for the asynchronous functions list (for $q)
        var promises = void[];
        
        // storage for counts
        vm.CRIDCount = 0;
        vm.permitCount = 0;
        vm.mailerIdCount = 0;
        
        // misc
        var currentDate = new Date();
        
        // initialize map center/focus
        vm.map = {
            center: {
                latitude: 38.897733,
                longitude: -77.036531
            },
            zoom: 12
        };
        
        // initialize map marker
        vm.marker = {
            id: 1,
            coords: {
                latitude: 38.897733,
                longitude: -77.036531
            },
            options: {
                title: "The White House"
            }
        };
        
        // set map view flag/switch
        vm.showMap = false;

        // update map address
        vm.showTheMap = function(addr1, addr2, city, state, zip5){
            vm.showMap = true;
            vm.mailOwnerAddress = "";
            vm.mailOwnerAddress = addr1 + ' ' + city + ' ' + state + ' ' + zip5;
            logger.log('Map Address: ' + vm.mailOwnerAddress);
            refreshMap();
        };
        
        // hide map
        vm.hideMap = function(){
            vm.showMap = false;
            refreshMap();
        };
        
        vm.historyGroupStatus = {     // to track accordian open/close status
            open: true
        }
        vm.cridPermitMidGroupStatus = {     // to track accordian open/close status
            open: false
        }
        // initialize UI Grid layout/formatting/printing options for displaying related eDoc Statements
        $scope.cridsEDocStatementsOptions = {
            paginationPageSizes: [10, 20, 100],
            rowHeight: 40,
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Statement_ID', displayName: 'Statement ID', cellTemplate: '<div tooltip-placement="bottom" tooltip-append-to-body="true"  uib-tooltip="View the Statement Details" class="ui-grid-cell-contents" style="padding: 5px;" ><a ui-sref="statementDetail({ id: row.entity.id })">{{ row.entity.Statement_ID }}</a></div>', width: 150},
                {field: 'Description', displayName: 'Description', width: "*"},
                {field: 'MailOwnerCRID', displayName: 'CRID', width: 95},
                {field: 'MailDate', displayName: 'Mail Date', width: 120, cellFilter: 'DateReformatFilter'},
                {field: 'PermitNumber', displayName: 'Permit', width: 100, cellClass: 'colorCodePermit'}, // TODO: FIXME
                {field: 'TotalPieceCount', displayName: 'Pieces', width: 100, cellFilter: 'number: 0'},
                {field: 'TotalPostage', displayName: 'Gross Postage', width: 170, cellFilter: 'currency:"$" : 3'},
            ],
            enableGridMenu: true,
            enableFiltering: true,
            enableSelectAll: true,
            exporterCsvFilename: 'eDocStatements_' + '' +
                                 (currentDate.getMonth()+1) + "-"
                                 + currentDate.getDate() + "-"
                                 + currentDate.getFullYear() + "-"  
                                 + currentDate.getHours() + "-"  
                                 + currentDate.getMinutes() + "-" 
                                 + currentDate.getSeconds() 
                                 + '.csv',
            exporterPdfDefaultStyle: {fontSize: 9},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfHeader: { text: "EMS EPOP Backend Client - Mail Owner Statements", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
            exporterPdfFooter: function ( currentPage, pageCount ) {
                return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle', alignment: 'center' };
            },
            exporterPdfCustomFormatter: function ( docDefinition ) {
                docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                return docDefinition;
            },
            exporterPdfOrientation: 'landscape',
            exporterPdfPageSize: 'LETTER',
            exporterPdfMaxGridWidth: 620,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };
        
        // initialize UI Grid layout/formatting options for displaying related CRIDs
        $scope.cridsGridOptions = {
            rowHeight: 40,
            columnDefs:[
                {name: 'CRID', displayName: 'CRID'},
                // append Edit & Delete buttons
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editCRID(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteCRID(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ]
        };
        
        // initialize UI Grid layout/formatting options for displaying related Permits
        $scope.permitsGridOptions = {
            rowHeight: 40,
            columnDefs:[
                {name: 'PermitNumber', displayName: 'Permit #'},
                /*{name: 'PermitCity', displayName: 'City'},
                {name: 'PermitState', displayName: 'State'},
                {name: 'PermitZip5', displayName: 'Zip'},*/
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editPermit(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deletePermit(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ]
        };
        
        // initialize UI Grid layout/formatting options for displaying related Mailer Id's
        $scope.mailerIdsGridOptions = {
            rowHeight: 40,
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                //{name: 'MailerName', displayName: 'Mailer Name'},
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editMailerId(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteMailerId(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ]
        };
        
        // format the Mail Owner City/State/Zip line for display
        vm.formatCityStateZip = function(city, state, zip5, zip4){
            return city + ', ' + state + ' ' + zip5;
        };
        
        // activate/initialize view
        activate();
        
        function activate() {
            promises = [getMailOwner(), getCRIDs(), getPermits(), getMailerIDs()];
            return $q.all(promises).then(function() {
               logger.info('Activated Mail Owner Detail View'); 
            }) 
        }
        
        // get geolocation of Mail Owner address and center it on the map
        function refreshMap(){
            // get geo-coordinates from the address
            var geocoder = new maps.Geocoder();
            geocoder.geocode({address: vm.mailOwnerAddress}, function(result){
                if (result.length > 0){
                    var mailOwnerLocation = result[0].geometry.location;
                    
                    // force map to redraw itself
                    $timeout(function(){
                        vm.map.center = {
                            latitude: mailOwnerLocation.lat(),
                            longitude: mailOwnerLocation.lng()
                        };
                        vm.marker = {
                            id: 1,
                            coords: {
                                latitude: mailOwnerLocation.lat(),
                                longitude: mailOwnerLocation.lng()
                            },
                            options: {
                                title: vm.mailOwner.Name
                            }
                        };
                        // set map zoom level
                        vm.map.zoom = 15;
                    }, 0);   
                }
            })
        }
        
        // collect selected Mail Owner from database
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
        
        // invoke modal dialog w/form to edit selected Mail Owner
        vm.editMailOwner = function(id){
            dialog.editMailOwner('Edit Mail Owner', ['Update', 'Cancel'], id)
            .then(function(){
                getMailOwner();
                vm.mailOwnerAddress = "";
                vm.mailOwnerAddress = vm.mailOwner.Address1 + ' ' + vm.mailOwner.City + ' ' + vm.mailOwner.State + ' ' + vm.mailOwner.Zip5;
                logger.log('Map Address: ' + vm.mailOwnerAddress);
                refreshMap();
                logger.success("Mail Owner Updated!");
            });
        };
        
        // collect eDoc Statements for the current MailOwner
        function getEDocStatements() {
            
            // clear out any existing statements
            vm.eDocStatements = [];
            
            logger.log("CRID Count: " + vm.CRIDCount);
            
            // get statements for each Mail Owner CRID
            for (var i = 0; i < vm.CRIDCount; i++) {
                logger.log("looking for statements w/ CRID: " + vm.CRIDs[i].CRID);
                EDocStatement.find({ filter: { where: { MailOwnerCRID: vm.CRIDs[i].CRID }}},
                function (result) {
                    logger.log("Statement Results count: " + result.length);
                    for (var i = 0; i < result.length; i++) {
                        logger.log("Results [i]: " + JSON.stringify(result[i]));
                        vm.eDocStatements.push(result[i]);
                    }
                    logger.log("Statement count: " + vm.eDocStatements.length);
                    $scope.cridsEDocStatementsOptions.data = vm.eDocStatements;
                });
            }
             
        }
        
        // collect related CRID's for the Mail Owner from the database
        function getCRIDs() {
            MailOwner.CRIDs({id: $stateParams.id},
                function (result) {
                    $scope.cridsGridOptions.data = result;
                    // save the CRID's (for use in finding all related eDoc Statements)
                    vm.CRIDs = result;
                    vm.CRIDCount = result.length;
                    logger.log("MailOwner has " + vm.CRIDCount + " CRIDs")
                    getEDocStatements();
                });
        }
        
        // collect related Permits for the Mail Owner from the database
        function getPermits() {
            MailOwner.Permits({id: $stateParams.id},
                function (result) {
                    $scope.permitsGridOptions.data = result
                    vm.permitCount = result.length;
                });
        }
        
        // collect related Mailer Id's for the Mail Owner from the database
        function getMailerIDs() {
            MailOwner.MailerIDs({id: $stateParams.id},
                function (result) {
                    $scope.mailerIdsGridOptions.data = result;
                    vm.mailerIdCount = result.length;
                });
        }
        
        // invoke modal dialog w/form to add new CRID
        vm.addCRID = function(){
            dialog.addCRIDToMailOwner('Add New CRID', ['Add', 'Cancel'], vm.mailOwner.id)
            .then(function(){
                getCRIDs();
                logger.success("New CRID Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current CRID, and update the grid
        $scope.deleteCRID = function(id){
            dialog.deleteCRID('Delete CRID?', 'Are You Sure You Want to Delete this CRID?', ['Delete', 'Cancel'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected CRID
        $scope.editCRID = function(id){
            dialog.editCRID('Edit CRID', ['Update', 'Cancel'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Updated!");
            });
        };

        // invoke modal dialog w/form to add new CRID
        vm.addPermit = function(){
            dialog.addPermitToMailOwner('Add New Permit', ['Add', 'Cancel'], vm.mailOwner.id)
            .then(function(){
                getPermits();
                logger.success("New Permit Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current Permit, and update the grid
        $scope.deletePermit = function(id){
            dialog.deletePermit('Delete Permit?', 'Are You Sure You Want to Delete this Permit?', ['Delete', 'Cancel'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Permit
        $scope.editPermit = function(id){
            dialog.editPermit('Edit Permit', ['Update', 'Cancel'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Updated!");
            });
        };
        
        // invoke modal dialog w/form to add new Mailer Id
        vm.addMailerId = function(){
            dialog.addMailerIdToMailOwner('Add New Mailer ID', ['Add', 'Cancel'], vm.mailOwner.id)
            .then(function(){
                getMailerIDs();
                logger.success("New Mailer ID Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current Mailer ID, and update the grid
        $scope.deleteMailerId = function(id){
            dialog.deleteMailerId('Delete Mailer ID?', 'Are You Sure You Want to Delete this Mailer ID?', ['Delete', 'Cancel'], id)
            .then(function(){
                getMailerIDs();
                logger.success("Mailer ID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Permit
        $scope.editMailerId = function(id){
            dialog.editMailerId('Edit Mailer ID', ['Update', 'Cancel'], id)
            .then(function(){
                getMailerIDs();
                logger.success("Mailer ID Updated!");
            });
        };
        
        // format numbers w/ comma's
        $scope.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        
        // format numbers as money
        $scope.currencyFormat = function(number){
            return numeral(number).format('$0,0.00');
        };
        
        // format Dates
        $scope.dateFormat = function(date){
            var refmtDate = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
            return moment(refmtDate).format('MMMM Do YYYY');
        };
        
        // TODO: FIXME     
        function colorCodePermit(grid, row, col, rowRenderIndex, colRenderIndex) {
            console.log("row entity: " + row.entity.FP_PI_PieceCount);
            // For Profit
            var statementType = "";
            if (vm.statement.FP_PI_PieceCount > 0){
                statementType = "FP_PI";
            }
            if (vm.statement.FP_MT_PieceCount > 0){
                statementType = "FP_MT";
            }
            if (vm.statement.FP_ST_PieceCount > 0){
                statementType = "FP_ST";
            }
            
            // Non-Profit
            if (vm.statement.NP_PI_PieceCount > 0){
                statementType = "NP_PI";
            }
            if (vm.statement.NP_MT_PieceCount > 0){
                statementType = "NP_MT";
            }
            if (vm.statement.NP_ST_PieceCount > 0){
                statementType = "NP_ST";
            }
            
            logger.log("Statement Type: " + statementType);
            switch(statementType)
            {               
                // PROFIT / PERMIT IMPRINT
                case "FP_PI":
                    return "#00ff00"; 
                break;
                // PROFIT / METER
                case "FP_MT":
                return "#00ffff";
                    
                break;
                // PROFIT / STAMP
                case "FP_ST":
                return "#ff9900";
                    
                break;
                // NON-PROFIT / PERMIT IMPRINT
                case "NP_PI":
                return "#ffff00";
                    
                break;
                // NON-PROFIT / METER
                case "NP_MT":
                return "#ff00ff";
                    
                break;
                // NON-PROFIT / STAMP                     
                case "NP_ST":
                return "#cc99ff";
                    
                break;
                default:
                return "red";
                    
            }  
        }
                
    }
    
    // FILTER - Date Reformat
    function DateReformatFilter() {
        return function(date){
            var refmtDate = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
            return moment(refmtDate).format('MM/DD/YYYY');
        }
    }
})();
