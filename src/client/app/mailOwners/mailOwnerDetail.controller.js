(function () {
    'use strict';

    angular
        .module('app.mailOwnerDetail', ['lbServices', 'app.dialogsService', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('MailOwnerDetailController', MailOwnerDetailController);
        
    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'logger', '$scope', '$stateParams', 'dialogsService', 'maps', '$timeout'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, logger, $scope, $stateParams, dialog, maps, $timeout) {
        // establish View Model
        var vm = this;
        
        // assign View Title
        vm.title = 'Mail Owner Detail';
        
        // storage for the selected Mail Owner
        vm.mailOwner = {};
        vm.mailOwnerAddress = "";
        
        // asynchronous functions array storage
        var promises = void[];
        
        // storage for counts
        vm.CRIDCount = 0;
        vm.permitCount = 0;
        vm.mailerIdCount = 0;
        
        // initialize map location
        vm.map = {
            center: {
                latitude: 38.897733,
                longitude: -77.036531
            },
            zoom: 12
        };
        
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
        vm.showMap = true;

        // update map
        vm.showTheMap = function(addr1, addr2, city, state, zip5){
            vm.showMap = true;
            vm.mailOwnerAddress = "";
            vm.mailOwnerAddress = addr1 + ' ' + city + ' ' + state + ' ' + zip5;
            console.log('Map Address: ' + vm.mailOwnerAddress);
            refreshMap();
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
                {name: 'PermitNumber', displayName: '#'},
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
                {name: 'MailerName', displayName: 'Mailer Name'},
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
        showMap();
        
        //
        function showMap(){
            vm.mailOwnerAddress = "";
            vm.mailOwnerAddress = vm.mailOwner.Address1 + ' ' + vm.mailOwner.City + ' ' + vm.mailOwner.Statw + ' ' + vm.mailOwner.Zip5;
            console.log('Map Address: ' + vm.mailOwnerAddress);
            refreshMap();
        }
        
        
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
                        
                        vm.map.zoom = 18;
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
            dialog.editMailOwner('Edit Mail Owner', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getMailOwner();
                logger.success("Mail Owner Updated!");
            });
        };
        
        
        // collect related CRID's for the Mail Owner from the database
        function getCRIDs() {
            MailOwner.CRIDs({id: $stateParams.id},
                function (result) {
                    $scope.cridsGridOptions.data = result;
                    vm.CRIDCount = result.length;
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
            dialog.addCRIDToMailOwner('Add New CRID', ['ADD', 'CANCEL'], vm.mailOwner.id)
            .then(function(){
                getCRIDs();
                logger.success("New CRID Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current CRID, and update the grid
        $scope.deleteCRID = function(id){
            dialog.deleteCRID('Delete CRID?', 'Are You Sure You Want to Delete this CRID?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected CRID
        $scope.editCRID = function(id){
            dialog.editCRID('Edit CRID', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Updated!");
            });
        };
       
        
        
        // invoke modal dialog w/form to add new CRID
        vm.addPermit = function(){
            dialog.addPermitToMailOwner('Add New Permit', ['ADD', 'CANCEL'], vm.mailOwner.id)
            .then(function(){
                getPermits();
                logger.success("New Permit Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current Permit, and update the grid
        $scope.deletePermit = function(id){
            dialog.deletePermit('Delete Permit?', 'Are You Sure You Want to Delete this Permit?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Permit
        $scope.editPermit = function(id){
            dialog.editPermit('Edit Permit', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Updated!");
            });
        };
        
        // invoke modal dialog w/form to add new Mailer Id
        vm.addMailerId = function(){
            dialog.addMailerIdToMailOwner('Add New Mailer ID', ['ADD', 'CANCEL'], vm.mailOwner.id)
            .then(function(){
                getMailerIDs();
                logger.success("New Mailer ID Added for Mail Owner!");
            });
        };
        
        // invoke modal dialog to delete current Mailer ID, and update the grid
        $scope.deleteMailerId = function(id){
            dialog.deleteMailerId('Delete Mailer ID?', 'Are You Sure You Want to Delete this Mailer ID?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getMailerIDs();
                logger.success("Mailer ID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Permit
        $scope.editMailerId = function(id){
            dialog.editMailerId('Edit Mailer ID', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getMailerIDs();
                logger.success("Mailer ID Updated!");
            });
        };
    }
})();
