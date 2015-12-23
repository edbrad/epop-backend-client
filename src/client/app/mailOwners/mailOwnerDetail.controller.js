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
            'ui.Gmapgoogle-maps'
            ]
        )
        .controller('MailOwnerDetailController', MailOwnerDetailController);

    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'logger', '$scope', '$stateParams', 'dialogsService','uiGmapGoogleMapApi'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, logger, $scope, $stateParams, dialog, uiGmapGoogleMapApi) {
        var vm = this;
        vm.title = 'Mail Owner Detail';
        vm.mailOwner = [];
        
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
        
        vm.map = {
            center:{
                latitude: 38.897733,
                longitude: -77.036531
            },
            zoom: 12    
        };
        
        activate();
        
        function activate() {
            var promises = [getMailOwner()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owner Detail View');
            });
        }
        
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
    }
})();
