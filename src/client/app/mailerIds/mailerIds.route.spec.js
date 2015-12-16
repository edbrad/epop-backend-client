/* jshint -W117, -W030 */
describe('mailerIds routes', function () {
    describe('state', function () {
        var view = 'app/mailerIds/mailerIds.html';

        beforeEach(function() {
            module('app.mailerIds', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state admin to url /mailerids ', function() {
            expect($state.href('mailerids', {})).to.equal('/mailerids');
        });

        it('should map /mailerids route to MailerIds View template', function () {
            expect($state.get('mailerIds').templateUrl).to.equal(view);
        });

        it('of mailerIds should work with $state.go', function () {
            $state.go('mailerids');
            $rootScope.$apply();
            expect($state.is('mailerids'));
        });
    });
});
