(function () {
    'use strict';

    /**
     * @class app.core
     * @memberOf app
     *
     * @description
     *
     * The `core` module provides the "core" system-wide dependencies for the application.
     *
     * @requires
     *   - ngAnimate: Angular animations
     *   - ngSanitize: Sanitizes an html string by stripping all potentially dangerous tokens
     *   - blocks.exception: Internal custom exception handling
     *   - blocks.logger: Internal custom logging service
     *   - blocks.router: Internal custom AngularJS route helper provider
     *   - ui.router: AngularJS routing service
     *   - ngplus: set of helpers, directives and services for AngularJS
     *   - uiGmapgoogle-maps: AngularUI Google Maps module
     *   - app.FocusDirective: Custom AngularJS Directive for setting initial cursor focus for a view
     *   - ui.mask: AngularUI field data entry masking
     *   - app.PrintDirective: Custom AngularJS Directive for performing a print-screen of a view
     *   - ui-bootstrap: AngularUI port of the Twitter Bootstrap for AngularJS
     */
    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'ui.router', 'ngplus', 'uiGmapgoogle-maps', 'app.FocusDirective',
            'ui.mask', 'app.PrintDirective', 'ui.bootstrap'
        ]);
})();
