(function () {
    'use strict';

    angular
        .module('app.FocusDirective',[])
        .directive('focus', FocusDirective);


	// Directive - set cursor focus 
    FocusDirective.$inject = ['$timeout'];
    /* @ngInject */
    function FocusDirective($timeout) {
        return {
            scope: {
                trigger: '@focus'
            },
            link: function (scope, element) {
                scope.$watch('trigger', function (value) {
                    if (value === 'true') {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }
    
})();
 