(function () {
    'use strict';

    angular
        .module('app.mailOwnerDetail', 
            [
                'lbServices', 
                'app.dialogsService', 
                'ui.grid', 
                'ui.grid.pagination', 
                'ui.grid.resizeColumns', 
                'ui.grid.moveColumns', 
                'ui.grid.selection', 
                'ui.grid.exporter',
                'uiGmapgoogle-maps'
            ]
        )
        .controller('MailOwnerDetailController', MailOwnerDetailController);

    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'logger', '$scope', '$stateParams', 'dialogsService', 'maps'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, logger, $scope, $stateParams, dialog, maps) {
        var vm = this;
        vm.title = 'Mail Owner Detail';
        var promises = void[]; // asynchronous functions array
        
        vm.mailOwner = [];
        vm.addrLocation = null;
        
        //vm.crids = [];
        $scope.cridsGridOptions = {
            paginationPageSizes: [10, 30, 100],
            columnDefs:[
                {name: 'CRID', displayName: 'CRID'}
            ],
            enableGridMenu: true,
            enableFiltering: true,
        };
        
        //vm.permits = [];
        $scope.permitsGridOptions = {
            paginationPageSizes: [10, 30, 100],
            columnDefs:[
                {name: 'PermitNumber', displayName: '#'},
                {name: 'PermitCity', displayName: 'City'},
                {name: 'PermitState', displayName: 'State'},
                {name: 'PermitZip5', displayName: 'Zip'}
            ],
            enableGridMenu: true,
            enableFiltering: true,
        };
        
        //vm.mailerIds = [];
        $scope.mailerIdsGridOptions = {
            paginationPageSizes: [10, 30, 100],
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {name: 'MailerName', displayName: 'Mailer Name'} 
            ],
            enableGridMenu: true,
            enableFiltering: true,
        };
        
        vm.click = function(){
            dialog.confirm('Are you sure about what you are doing?', 'Confirm?', ['YES', 'CANCEL'])
            .then(function(){
                logger.info("modal complete!");
            });
        };
        
        vm.formatCityStateZip = function(city, state, zip5, zipPlus4){
            if (zipPlus4){   
                return city + ', ' + state + ' ' + zip5 + '-' + zipPlus4;
            }
            else{
                return city + ', ' + state + ' ' + zip5;
            }   
        };
        
        
        // activate module
        activate();
        
        function activate() {
            promises = [getMailOwner(), getCRIDs(), getPermits(), getMailerIDs()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owner Detail View');
                var geocoder = new maps.Geocoder();
                geocoder.geocode({ address: "7855 W 111th Street, Palos Hills, IL 60465"}, function(result){
                    if (result.length > 0){
                        vm.addrLocation = result [0].geometry.location;
                        vm.map = {
                            center:{
                                latitude: vm.addrLocation.lat(),
                                longitude: vm.addrLocation.lng()
                            },
                            zoom: 12    
                        };
                    }
                });
            });
        }
        
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
        
        function getCRIDs() {
            MailOwner.CRIDs({id: $stateParams.id},
                function (result) {
                    $scope.cridsGridOptions.data = result;
                });
        }
        
        function getPermits() {
            MailOwner.Permits({id: $stateParams.id},
                function (result) {
                    $scope.permitsGridOptions.data = result;
                });
        }
        
        function getMailerIDs() {
            MailOwner.MailerIDs({id: $stateParams.id},
                function (result) {
                    $scope.mailerIdsGridOptions.data = result;
                });
        }
    }
})();
